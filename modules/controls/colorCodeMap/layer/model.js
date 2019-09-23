const LayerModel = Backbone.Model.extend({
    defaults: {
        layerScope: "",
        layerName: "",
        layerId: "",
        layerModel: null
    }

});

export default LayerModel;
