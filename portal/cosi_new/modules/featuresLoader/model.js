import MappingJson from "./mapping.json";
import {WFS} from "ol/format.js";
import "whatwg-fetch";

const featuresLoader = Backbone.Model.extend({
    defaults: {
        statistischeGebieteUrl: "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
        statistischeGebiete: [],
        // does not exist yet
        stadtteileUrl: "",
        stadtteile: [],
        // store for all features
        featureList: {}
    },
    initialize: function () {
        const channel = Radio.channel("FeaturesLoader");

        channel.reply({
            "getDistrictsByScope": this.getDistrictsByScope,
            "getDistrictsByValue": this.getDistrictsByValue,
            "getAllFeaturesByAttribute": this.getAllFeaturesByAttribute,
            "getAllValuesByScope": this.getAllValuesByScope
        }, this);
        channel.on({
            "districtsLoaded": this.districtsLoaded
        }, this);
        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": this.checkDistrictScope
        });
    },

    /**
     * checks which scope of districts are selected
     * @param {number[]} bbox - extent of the selected areas
     * @param {string} scope - scope of the selected areas (Stadtteile or Statistische Gebiete)
     * @param {string[]} districtNameList - the names of the Stadtteile or of the Statistische Gebiete
     * @returns {void}
     */
    checkDistrictScope: function (bbox, scope, districtNameList) {
        // to do - nur einmal laden und dann speichern
        if (scope === "Stadtteile") {
            this.loadDistricts(bbox, this.get("stadtteileUrl"), "stadtteile", districtNameList);
        }
        else if (scope === "Statistische Gebiete") {
            this.loadDistricts(bbox, this.get("statistischeGebieteUrl"), "statistischeGebiete", districtNameList);
        }
    },

    /**
     * loads all demographic features of the selected districts and stores them
     * @param {number[]} bbox - extent of the selected districts
     * @param {string} serviceUrl - the wfs url of the districts
     * @param {string} attribute - the model attribute in which the features are stored
     * @param {string[]} districtNameList - a list of the names of the selected districts
     * @returns {void}
     */
    loadDistricts: function (bbox, serviceUrl, attribute, districtNameList) {
        Radio.trigger("Util", "showLoader");
        Radio.trigger("Alert", "alert", {
            text: "Datensätze werden geladen",
            kategorie: "alert-info"
        });

        const layerList = Radio.request("RawLayerList", "getLayerListWhere", {url: serviceUrl}),
            wfsReader = new WFS({
                featureNS: layerList[0].get("featureNS")
            }),
            propertyListPromise = this.getPropertyListWithoutGeometry(serviceUrl),
            featurePromiseList = [];

        Radio.trigger("FeaturesLoader", "districtsLoaded", layerList);
        propertyListPromise.then(propertyList => {
            layerList.forEach(function (layer) {
                const getFeatureUrl = Radio.request("Util", "getProxyURL", this.getUrl(layer, bbox, propertyList));

                featurePromiseList.push(window.fetch(getFeatureUrl)
                    .then(response => {
                        return response.text();
                    })
                    .then(responseString => {
                        return wfsReader.readFeatures(responseString);
                    })
                    .then(features => {
                        return features.filter((feature) => {
                            // to do for stadtteile
                            return districtNameList.includes(feature.get("statgebiet"));
                        });
                    })
                    .catch(function (error) {
                        // to do
                        console.error(error);
                    }));
            }, this);
            Promise.all(featurePromiseList).then((featureList) => {
                this.set(attribute, featureList.reduce((total, feature) => total.concat(feature), []));
                console.info(this.get("statistischeGebiete"));

                Radio.trigger("Util", "hideLoader");
                Radio.trigger("Alert", "alert:remove");
            });
        });
    },

    /**
     * returns all available properties of a WFS except the geometry
     * asks for this the Describe Feature Request of the WFS
     * @param {string} url - the wfs url
     * @returns {string} property list
     */
    getPropertyListWithoutGeometry: function (url) {
        return window.fetch(`${url}?service=WFS&request=DescribeFeatureType&version=1.1.0`)
            .then(response => {
                return response.text();
            })
            .then(responseString => {
                return new DOMParser().parseFromString(responseString, "text/xml");
            })
            .then(responseXML => {
                const propertyList = [],
                    elements = responseXML.getElementsByTagName("sequence")[0].getElementsByTagName("element");

                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].getAttribute("name") !== "geom") {
                        propertyList.push(elements[i].getAttribute("name"));
                    }
                }
                return propertyList.toString();
            })
            .catch(function (error) {
                console.error(error);
            });
    },

    /**
     * returns the url for a GetFeature Request
     * @param {Backbone.Model} layer - the layer model to be requested
     * @param {number[]} bbox - extent for the request
     * @param {string} propertyNameList - a list of the properties to be requested
     * @returns {string} the GetFeature Request url
     */
    getUrl: function (layer, bbox, propertyNameList) {
        let url = `${layer.get("url")}?` +
            "service=WFS&" +
            "request=Getfeature&" +
            `version=${layer.get("version")}&` +
            `typename=${layer.get("featureType")}&`;

        if (propertyNameList) {
            url += `propertyName=${propertyNameList}&`;
        }
        if (bbox) {
            url += `BBOX=${bbox}`;
        }
        return url;
    },

    /**
     * returns the district features
     * @param {string} scope - scope of districts, Stadtteile | Statistische Gebiete
     * @returns {ol.Feature[]} the district features
     */
    getDistrictsByScope: function (scope) {
        if (scope === "Stadtteile") {
            return this.get("stadtteile");
        }
        return this.get("statistischeGebiete");
    },

    /**
     * returns district features by a value
     * @param {string} scope - scope of districts, Stadtteile | Statistische Gebiet
     * @param {string} value - the value to be filtered by
     * @returns {ol.Feature[]} the district features
     */
    getDistrictsByValue: function (scope, value) {
        const mappingObject = this.findMappingObjectByValue(value);

        return this.getDistrictsByScope(scope).filter(function (feature) {
            return feature.getProperties().kategorie === mappingObject.category;
        });
    },

    /**
     * returns all features of a layer
     * if the features are not yet stored, it will be loaded
     * @param {object} obj - key value pair of a layer attribute
     * @returns {ol.Feature[]} the features of a layer
     */
    getAllFeaturesByAttribute: function (obj) {
        // layer name, layer id or any other value of the layer
        const valueOfLayer = obj[Object.keys(obj)[0]],
            featureList = this.get("featureList"),
            layer = Radio.request("RawLayerList", "getLayerWhere", obj),
            xhr = new XMLHttpRequest();

        if (featureList.hasOwnProperty(valueOfLayer)) {
            return featureList[valueOfLayer];
        }

        xhr.open("GET", Radio.request("Util", "getProxyURL", this.getUrl(layer, undefined, undefined)), false);
        xhr.onload = function (event) {
            const wfsReader = new WFS({
                featureNS: layer.get("featureNS")
            });

            featureList[valueOfLayer] = wfsReader.readFeatures(event.currentTarget.responseXML);
        };
        xhr.onerror = function () {
            // to do
        };
        xhr.send();
        return featureList[valueOfLayer];
    },

    /**
     * returns all raw layers within the scope of respective district selection
     * e.g. if selected district is of type statistishe gebiet
     * returns all WFS layers on the level of statistishe gebiet
     * @param {array} layerList - layerList of selected type
     * @returns {array} layerList of selected type
     */
    districtsLoaded: function (layerList) {
        return layerList;
    },

    /**
     * finds a mapping object by its value
     * @param {string} value - value of the mapping object
     * @returns {object} the mapping object
     */
    findMappingObjectByValue: function (value) {
        return MappingJson.find(obj => {
            return obj.value === value;
        });
    },

    /**
     * get all available values by scope
     * @param {string} scope - statgebiet | stadtteil
     * @returns {object[]} list of all available values
     */
    getAllValuesByScope: function (scope) {
        console.info(scope);
        return MappingJson.filter(obj => {
            return obj[scope] === true;
        });
    }

});

export default featuresLoader;
