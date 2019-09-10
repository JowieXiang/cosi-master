const FilterModel = Backbone.Model.extend({
    defaults: {
        layerNames: [], // all select options (vector layers in the map)
        selectedLayer: "", // selected option
        sliderFields: [] // range keys and values
        /**
         * sliderFields value : [{key:value},{key,value},...]
         */
    },
    initialize: function () {
        const layers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
            layerNames = layers.map(layer => layer.name);

        this.setLayerNames(layerNames);
    },
    onSlide: function (key, value) {
        /**
         * reset slider field value on slide
         */
    },
    setLayerNames: function (value) {
        this.set("layerNames", value);
    },
    setSelectedLayer: function (value) {
        this.set("selectedLayer", value);
    }
});

export default FilterModel;
