const FilterModel = Backbone.Model.extend({
    defaults: {
        layerNames: [], // all select options (vector layers in the map)
        selectedLayer: null, // selected option
        sliderKeys: [] // range keys and values

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
    },
    setSliderKeys: function (selectedLayerName) {
        const selectedLayer = Radio.request("ModelList", "getModelByAttributes", { name: selectedLayerName });

        if (typeof selectedLayer.get("numericalProperties") !== "undefined") {
            if (selectedLayer.get("numericalProperties")) {
                const fields = [],
                    numericalProperties = selectedLayer.get("numericalProperties");

                _.each(numericalProperties, (prop) => {
                    // fields.push({ [prop]: null });
                    fields.push(prop);
                });

                this.set("sliderKeys", fields);
            }
        }
    },

    getSliderKeys: function () {
        return this.get("sliderKeys");
    }
});

export default FilterModel;
