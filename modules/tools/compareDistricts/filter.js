const FilterModel = Backbone.Model.extend({
    defaults: {
        layerNames: [], // all select options (vector layers in the map)
        selectedFilter: [], // selected option
        sliderFields: [] // range keys and values
        /**
         * sliderFields value : [{key:value},{key,value},...]
         */
    },
    onSlide: function (key, value) {
        /**
         * reset slider field value on slide
         */
    },
    setLayerNames: function (value) {
        this.set("layerNames", value);
    }
});

export default FilterModel;
