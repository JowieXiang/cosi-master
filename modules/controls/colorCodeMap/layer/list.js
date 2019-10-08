import LayerModel from "./model";

var LayerList = Backbone.Collection.extend({
    model: LayerModel,
    initialize: function () {
        const channel = Radio.channel("ColorCodeMap");

        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": function (layerList) {
                _.each(layerList, layer => {
                    // if (_.contains(layer.attributes, id)) {
                    const layerId = layer.get("id"),
                        layerModel = layer,
                        layerName = layer.get("name"),
                        newLayer = new LayerModel({
                            layerName: layerName,
                            layerId: layerId,
                            layerModel: layerModel
                        });
                    
                    this.add(newLayer);
                    // }
                });
                channel.trigger("districtsLoaded");
            }
        });
    }
});

export default LayerList;
