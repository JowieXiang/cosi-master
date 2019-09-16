
const FeatureLoaderModel = Backbone.Model.extend({
    defaults: {
        featureCollections: []
    },
    initialize: function () {
        var channel = Radio.channel("FeatureLoader");

        channel.reply({
            "getFeaturesByLayerId": this.getFeaturesByLayerId

        }, this);

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                var currentLayerIds = [];
                // selector = Radio.request("SelectDistrict", "getSelector");

                _.each(features, feature => {

                    if (_.contains(Object.keys(feature.getProperties()), "stadtteil")) {
                        let stadtteil = feature.getProperties().stadtteil;

                        stadtteil = stadtteil.replace(/_/g, "");
                        stadtteil = stadtteil.replace(/-/g, "");
                        stadtteil = stadtteil.replace(/\s+/g, "");
                        feature.set("stadtteil", stadtteil);


                    }
                });
                if (this.get("featureCollections").length > 0) {

                    currentLayerIds = this.get("featureCollections").map(collection => collection.layerId);
                }
                if (!_.contains(currentLayerIds, layerId)) {
                    this.pushFeatureCollection(layerId, features);
                }
            }
        });
    },
    // push feature collection to this model
    pushFeatureCollection: function (layerId, features) {
        var featureCollections = this.get("featureCollections");

        featureCollections.push({
            "layerId": layerId,
            "collection": features
        });
        this.set("featureCollections", featureCollections);
    },
    getFeaturesByLayerId: function (layerId) {
        const features = this.get("featureCollections").filter(collection => collection.layerId === layerId)[0].collection;

        return features;
    }

});

export default FeatureLoaderModel;
