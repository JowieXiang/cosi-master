const FilterModel = Backbone.Model.extend({
    defaults: {
        layerNames: [], // all select options (vector layers in the map)
        selectedLayer: null, // selected option
        sliderKeys: [], // range keys and values
        filterData: []
    },
    initialize: function () {
        const allLayers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
            layers = allLayers.filter(layer => _.contains(Object.keys(layer), "mouseHoverField")),
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
    // filter out district names that are already selected
    filterLayerNames: function (nameToFilter) {
        const newLayerNames = this.get("layerNames").filter(name => name === nameToFilter);

        this.set("districtNames", newLayerNames);
    },
    setSelectedLayer: function (value) {
        this.set("selectedLayer", value);

    },
    resetSliderKeys: function () {
        this.set("sliderKeys", []);
        console.log("resetSliderKeys");

        const selectedLayerName = this.get("selectedLayer"),
            selectedLayer = Radio.request("ModelList", "getModelByAttributes", { name: selectedLayerName });
        console.log(selectedLayerName);
        console.log(selectedLayer);

        if (selectedLayer !== undefined) {
            if (_.contains(Object.keys(selectedLayer), "mouseHoverField")) {
                // if (selectedLayer.get("numericalProperties")) {
                const fields = selectedLayer.mouseHoverField;
                //     numericalProperties = selectedLayer.get("numericalProperties");

                // _.each(numericalProperties, (prop) => {
                //     // fields.push({ [prop]: null });
                //     fields.push(prop);
                // });
                this.set("sliderKeys", fields);
                // }
            }
        }
    },

    getSliderKeys: function () {
        return this.get("sliderKeys");
    },
    setFilterData: function (data) {
        this.set("filterData", data);
    }
});

export default FilterModel;
