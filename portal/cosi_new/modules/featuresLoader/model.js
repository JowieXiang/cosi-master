import {WFS} from "ol/format.js";

const featuresLoader = Backbone.Model.extend({
    defaults: {
        statistischeGebieteUrl: "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
        statistischeGebiete: [],
        stadtteileUrl: "",
        stadtteile: []
    },
    initialize: function () {
        const channel = Radio.channel("FeaturesLoader");

        channel.reply({
            "getDistrictsByType": this.getDistrictsByType,
            "getDistrictsByAttributes": this.getDistrictsByAttributes
        }, this);
// get all features of one layer
        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": this.checkDistrictType
        });
    },

    checkDistrictType: function (bbox, type) {
        if (type === "Stadtteile") {
            this.loadDistricts(bbox, this.get("stadtteileUrl"), "stadtteile");
        }
        else if (type === "Statistische Gebiete") {
            this.loadDistricts(bbox, this.get("statistischeGebieteUrl"), "statistischeGebiete");
        }
    },

    loadDistricts: function (bbox, servicesUrl, attribute) {
        const layerList = Radio.request("RawLayerList", "getLayerListWhere", {url: servicesUrl}),
            wfsReader = new WFS({
                featureNS: layerList[0].get("featureNS")
            }),
            propertyListPromise = this.getPropertyNamesWithoutGeom(layerList[0]),
            featurePromiseList = [];

        propertyListPromise.then((propertyList) => {
            layerList.forEach(function (layer) {
                const getFeatureUrl = Radio.request("Util", "getProxyURL", this.getUrl(layer, bbox.getExtent().toString(), propertyList));

                featurePromiseList.push(fetch(getFeatureUrl)
                    .then(response => {
                        return response.text();
                    })
                    .then(responseString => {
                        return wfsReader.readFeatures(responseString);
                    })
                    .catch(function (error) {
                        console.error(error);
                    }));
            }, this);
            Promise.all(featurePromiseList).then((featureList) => {
                this.set(attribute, featureList.flat());
            });
        });
    },

    getUrl: function (layer, bbox, propertyNameList) {
        return `${layer.get("url")}?` +
            "service=WFS&" +
            "request=Getfeature&" +
            `version=${layer.get("version")}&` +
            `typename=${layer.get("featureType")}&` +
            `propertyName=${propertyNameList.toString()}&` +
            `BBOX=${bbox}`;
    },

    /**
     *
     * @param {object} layer -
     * @returns {string[]} -
     */
    getPropertyNamesWithoutGeom: function (layer) {
        return fetch(`${layer.get("url")}?service=WFS&request=DescribeFeatureType&version=1.1.0`)
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
                return propertyList;
            })
            .catch(function (error) {
                console.error(error);
            });
    },

    getDistrictsByType: function (type) {
        if (type === "Stadtteile") {
            return this.get("stadtteile");
        }
        return this.get("statistischeGebiete");
    },

    getDistrictsByAttributes: function (type, attributes) {
        const featureList = [];

        Object.keys(attributes).forEach(function (key) {
            featureList.push(this.getDistrictsByType(type).filter(function (feature) {
                return feature.getProperties()[key] === attributes[key];
            }));
        }, this);

        return featureList;
    }

});

export default featuresLoader;
