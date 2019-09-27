const FeatureLoaderModel = Backbone.Model.extend({
    defaults: {
        layerGroups: {
            "stadtteil": [
                "1694"
            ],
            "stadtteil-layers": [
                "2763",
                "2769",
                "2768",
                "2771"
            ],
            "statgebiet-layers": [
                "15563",
                "15564",
                "15565",
                "15989"
            ],
            "Sportstätten-layer": [
                "12868"
            ],
            "Grünflächen-layer": [
                "1534"
            ],
            "Kindertagesstätten-layer": [
                "753"
            ]
        },
        featureCollections: []
    },
    initialize: function () {
        this.channel = Radio.channel("FeatureLoader");

        this.channel.reply({
            "getFeaturesByLayerId": this.getFeaturesByLayerId
        }, this);

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                this.processData(layerId, features);
            }
        });
    },
    processData: function (layerId, features) {
        const currentLayerIds = this.get("featureCollections").length > 0 ? this.get("featureCollections").map(collection => collection.layerId) : [],
            layerCategory = _.allKeys(this.get("layerGroups")).filter(groupName => {
                const layerGroup = this.get("layerGroups")[groupName];

                return _.contains(layerGroup, layerId);
            });
        // console.log("layerGroup: ", layerCategory, layerId);

        if (!_.contains(currentLayerIds, layerId) && layerCategory.length > 0) {
            switch (layerCategory[0]) {
                case "stadtteil-layers": {
                    this.processStatteilData(features);
                    break;
                }
                case "stadtteil": {
                    this.processStatteilData(features);
                    break;
                }
                case "statgebiet-layers": {
                    this.processStatgebietData(features);
                    break;
                }
                case "Sportstätten-layer": {
                    this.processSportsData(features);
                    break;
                }
                case "Grünflächen-layer": {
                    this.processGreenData(features);
                    break;
                }
                case "Kindertagesstätten-layer": {
                    this.processKinderData(features);
                    break;
                }
                default: {
                    break;
                }
            }
            this.channel.trigger("addFeatureCollection", layerId, features);
            this.pushFeatureCollection(layerId, features);
        }
    },
    processStatteilData: function (features) {
        _.each(features, feature => {
            if (_.contains(Object.keys(feature.getProperties()), "stadtteil")) {
                let stadtteil = feature.getProperties().stadtteil.replace(/_/g, "");

                stadtteil = stadtteil.replace(/-/g, "");
                stadtteil = stadtteil.replace(/\s+/g, "");
                feature.set("stadtteil", stadtteil);
            }
        }, this);
    },
    processStatgebietData: function (features) {
        _.each(features, feature => {
            // move "stat_gebiet" value to "statgebiet" for gebiet features
            if (_.contains(Object.keys(feature.getProperties()), "stat_gebiet")) {
                feature.set("statgebiet", feature.getProperties().stat_gebiet);
            }
        }, this);
    },
    processSportsData: function (features) {
        const featuresByStatteil = _.groupBy(features, function (feature) {
            return feature.getProperties().stadtteil;
        }),
            districtLayer = this.get("featureCollections").filter(collection => collection.layerId === this.get("layerGroups").stadtteil[0])[0];
        // console.log("featuresByStatteil: ", featuresByStatteil);

        // console.log("districtLayer: ", districtLayer);
        _.each(districtLayer.collection, district => {
            district.set("sports", []);

        });
    },
    processGreenData: function (features) {
        _.each(features, feature => {

        }, this);
    },
    processKinderData: function (features) {
        _.each(features, feature => {

        }, this);
    },

    sendAddedLayer: function (layerId, features) {
        return {
            "layerId": layerId,
            "collection": features
        };
    },

    // push feature collection to this model
    pushFeatureCollection: function (layerId, features) {
        var featureCollections = this.get("featureCollections");

        featureCollections.push({
            "layerId": layerId,
            "collection": features
        });
        // console.log("featurepushed: ", features[0].getProperties());
        this.set("featureCollections", featureCollections);
    },

    getFeaturesByLayerId: function (layerId) {
        const selectedCollection = this.get("featureCollections").filter(collection => collection.layerId === layerId);
        let features = [];

        if (selectedCollection.length > 0) {
            features = selectedCollection[0].collection;
        }

        return features;
    }

});

export default FeatureLoaderModel;
