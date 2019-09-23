const LayerFilterModel = Backbone.Model.extend({
    defaults: {
        districtName: "", // selected district name
        districtInfo: [], // [{key:...,value:...},{},...]
        layerInfo: {},
        filter: ""// e.g {filterKey:value,filterKey:value,filterKey:value,...}
    },
    initialize: function () {
        this.initializeFilter();
        this.initializeDistrictInfo();
    },
    initializeFilter: function () {
        const layerInfo = this.get("layerInfo"),
            selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerInfo.layerId }),
            keys = selectedLayer.districtCompareField;
        var newFilter = {};

        _.each(keys, key => {
            newFilter[key] = 0;
        });
        console.log("keys: ", keys);
        console.log("newFilter: ", newFilter);

        this.set("filter", JSON.stringify(newFilter));
    },
    initializeDistrictInfo: function () {

        // console.log($("#district-selector").children("option:selected").val());
        const districtName = $("#district-selector").children("option:selected").val(),
            layerId = this.get("layerInfo").layerId,
            selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerId }),
            keys = selectedLayer.districtCompareField,
            featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", layerId),
            refFeature = featureCollection.filter(feature => feature.getProperties().stadtteil === districtName)[0],
            districtInfo = [];

        _.each(keys, key => {
            const newInfo = { key: key, value: refFeature.getProperties()[key] };

            districtInfo.push(newInfo);
        });
        console.log("districtInfo: ", districtInfo);
        this.set("districtInfo", districtInfo);
        this.set("districtName", districtName);
    }

});

export default LayerFilterModel;