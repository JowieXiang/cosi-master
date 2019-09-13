const LayerFilterModel = Backbone.Model.extend({
    defaults: {
        layerInfo: {},
        filter: ""// e.g {filterKey:value,filterKey:value,filterKey:value,...}
    },
    initialize: function () {
        this.initializeFilter();
    },
    initializeFilter: function () {
        const layerInfo = this.get("layerInfo"),
            selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerInfo.layerId }),
            keys = selectedLayer.mouseHoverField;
        var newFilter = {};

        _.each(keys, key => {
            newFilter[key] = 0;
        });
        console.log("keys: ", keys);
        console.log("newFilter: ", newFilter);

        this.set("filter", JSON.stringify(newFilter));
    }


});

export default LayerFilterModel;
