import LayerModel from "./model";

var LayerList = Backbone.Collection.extend({
    model: LayerModel,
    initialize: function () {
        this.listenTo(Radio.channel("FeatureLoader"), {
            "addFeatureCollection": function (Id, features) {
                const districtLayer = Radio.request("SelectDistrict", "getDistrictLayer");

                _.each(districtLayer, layerGroup => {
                    if (_.contains(layerGroup.layerIds, Id)) {
                        const layerId = Id,
                            layerModel = Radio.request("ModelList", "getModelByAttributes", { id: layerId }),
                            layerName = layerModel.attributes.name,
                            layerScope = layerGroup.name,
                            newLayer = new LayerModel({
                                layerScope: layerScope,
                                layerName: layerName,
                                layerId: layerId,
                                layerModel: layerModel
                            });
                        // console.log("layer added: ", Id);

                        this.add(newLayer);
                    }
                });
            }
        });
    }
});

export default LayerList;
