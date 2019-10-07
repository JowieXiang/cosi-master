const LayerFilterSelectorModel = Backbone.Model.extend({
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null // selected option e.g. {layerName:"",layerId:""}

    },

    initialize: function () {
        const currentSelector = Radio.request("SelectDistrict", "getSelector"),
            allLayers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
            layers = allLayers.filter(layer => _.contains(Object.keys(layer), "districtCompareField")).filter(layer => layer.selector === currentSelector),
            layerOptions = layers.map(layer => {
                // console.log("new layer: ", layer);
                return { "layerName": layer.name, "layerId": layer.id };
            });

        this.setLayerOptions(layerOptions);
    },

    setSelectedLayer: function (value) {
        /**
         * this is unstable!!! because "value" is only the first word of the layer name
         */
        const selectedLayer = this.get("layerOptions").filter(layer => layer.layerName.includes(value))[0];
        this.set("selectedLayer", selectedLayer);
    },

    setLayerOptions: function (value) {
        this.set("layerOptions", value);
    },
    getSelectedLayer: function () {
        return this.get("selectedLayer");
    },
    getLayerOptions: function () {
        return this.get("layerOptions");
    }

});

export default LayerFilterSelectorModel;
