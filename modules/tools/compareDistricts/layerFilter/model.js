const LayerFilterModel = Backbone.Model.extend({
    defaults: {
        districtName: "", // selected district name
        districtInfo: [], // [{key:...,value:..., max: ..., min: ..., space: ...},{},...]
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


        this.set("filter", JSON.stringify(newFilter));
    },
    initializeDistrictInfo: function () {
        const selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            districtName = $("#district-selector").children("option:selected").val(),
            layerId = this.get("layerInfo").layerId,
            selectedLayer = Radio.request("Parser", "getItemByAttributes", { id: layerId }),
            keys = selectedLayer.districtCompareField,
            featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", layerId),
            refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0],
            districtInfo = [];

        // console.log("values: ", featureCollection.map(feature => feature.getProperties()[selector]));

        // console.log("max: ", max);
        // console.log("min: ", min);

        _.each(keys, key => {

            const values = featureCollection.map(feature => parseFloat(feature.getProperties()[key])),
                max = Math.max(...values),
                min = Math.min(...values),
                refValue = refFeature.getProperties()[key],
                space = Math.max(max - refValue, refValue - min),
                newInfo = { key: key, value: refValue, max: max, min: min, space: space };

            districtInfo.push(newInfo);
        });
        this.set("districtInfo", districtInfo);
        this.set("districtName", districtName);
    }

});

export default LayerFilterModel;
