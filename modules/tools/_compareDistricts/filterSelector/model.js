const FilterModel = Backbone.Model.extend({
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        layerFilter: ""
    },

    initialize: function () {
        const allLayers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
            layers = allLayers.filter(layer => _.contains(Object.keys(layer), "mouseHoverField")),
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

    // filter out district names that are already selected
    filterLayerNames: function (nameToFilter) {
        // const newLayerNames = this.get("layerNames").filter(name => name === nameToFilter);

        // this.set("districtNames", newLayerNames);
    }

});

export default FilterModel;
