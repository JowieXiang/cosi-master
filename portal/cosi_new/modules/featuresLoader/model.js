import MappingJson from "./mapping.json";
import {WFS} from "ol/format.js";
import "whatwg-fetch";
import {getLayerList, getLayerWhere} from "masterportalAPI/src/rawLayerList";

const featuresLoader = Backbone.Model.extend(/** @lends featuresLoader.prototype */{
    defaults: {
        statistischeGebieteUrl: "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
        statistischeGebiete: [],
        stadtteileUrl: "https://geodienste.hamburg.de/Test_HH_WFS_hamburg_statistik_stadtteile",
        stadtteile: [],
        featureList: {}
    },
    /**
     * @class featuresLoader
     * @extends Backbone.Model
     * @memberof FeaturesLoader
     * @constructs
     * @property {String} statistischeGebieteUrl="https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test" WFS url of statistischeGebiete datasets
     * @property {String} stadtteileUrl="https://geodienste.hamburg.de/Test_HH_WFS_hamburg_statistik_stadtteile" WFS url of stadtteile datasets
     * @property {object} featureList store for already queried features indexed by attribute value e.g {15634: [Feature,Feature,Feature,...] , 15987: [Feature,Feature,Feature,...],...}
     * @fires Core#RadioTriggerUtilHideLoader
     * @fires Core#RadioTriggerUtilShowLoader
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires FeaturesLoader#RadioTriggerDistrictsLoaded

     * @listens FeaturesLoader#RadioRequestGetDistrictsByScope
     * @listens FeaturesLoader#RadioRequestGetDistrictsByValue
     * @listens FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
     * @listens FeaturesLoader#RadioRequestGetAllValuesByScope
     * @listens SelectDistrict#RadioTriggerSelectionChanged
     */
    initialize: function () {
        const channel = Radio.channel("FeaturesLoader");

        channel.reply({
            "getDistrictsByScope": this.getDistrictsByScope,
            "getDistrictsByValue": this.getDistrictsByValue,
            "getAllFeaturesByAttribute": this.getAllFeaturesByAttribute,
            "getAllValuesByScope": this.getAllValuesByScope
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

        const layerList = getLayerList().filter(function (layer) {
                return layer.url === serviceUrl;
            }),
            wfsReader = new WFS({
                featureNS: layerList[0].featureNS
            }),
            propertyListPromise = this.getPropertyListWithoutGeometry(serviceUrl),
            featurePromiseList = [];

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
                    // mapping feature kategorie value
                    .then(features => {
                        features.forEach(function (feature) {
                            feature.set("kategorie", this.findMappingObjectByCategory(feature.get("kategorie")).value);
                        }, this);
                        if (features.length > 0) {
                            layer.category = features[0].get("kategorie");
                        }
                        return features;
                    })
                    .then(features => {
                        return features.filter((feature) => {
                            return districtNameList.includes(feature.get("statgebiet")) || districtNameList.includes(feature.get("stadtteil"));
                        });
                    })
                    .catch(function (error) {
                        Radio.trigger("Alert", "alert", {
                            text: "Datensätze konnten nicht geladen werden. Vermutlich liegt ein Verbindungsproblem zum Server vor. Bestätigen Sie die Auswahl erneut oder laden Sie die CoSI neu.",
                            kategorie: "alert-warning"
                        });
                        console.error(error);
                    }));
            }, this);
            Promise.all(featurePromiseList).then((featureList) => {
                this.set(attribute, featureList.reduce((total, feature) => total.concat(feature), []));
                Radio.trigger("FeaturesLoader", "districtsLoaded", layerList);
                Radio.trigger("Util", "hideLoader");
                Radio.trigger("Alert", "alert:remove");
            }).catch(function (error) {
                // to do
                console.error(error);
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
        let url = `${layer.url}?` +
            "service=WFS&" +
            "request=Getfeature&" +
            `version=${layer.version}&` +
            `typename=${layer.featureType}&`;

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
        return this.getDistrictsByScope(scope).filter(function (feature) {
            return feature.getProperties().kategorie === value;
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
            layer = getLayerWhere(obj),
            xhr = new XMLHttpRequest();

        if (featureList.hasOwnProperty(valueOfLayer)) {
            return featureList[valueOfLayer];
        }

        xhr.open("GET", Radio.request("Util", "getProxyURL", this.getUrl(layer, undefined, undefined)), false);
        xhr.onload = function (event) {
            const wfsReader = new WFS({
                featureNS: layer.featureNS
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
     * finds a mapping object by its category
     * @param {string} value - category of the mapping object
     * @returns {object} the mapping object
     */
    findMappingObjectByCategory: function (value) {
        return MappingJson.find(obj => {
            return obj.category === value;
        });
    },

    /**
     * get all mapped data layer infos by scope
     * @param {string} scope - statgebiet | stadtteil
     * @returns {object[]} list of all available values
     */
    getAllValuesByScope: function (scope) {
        return MappingJson.filter(obj => {
            return obj[scope] === true;
        });
    }

});

export default featuresLoader;
