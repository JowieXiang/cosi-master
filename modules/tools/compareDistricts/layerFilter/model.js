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
        const newFilter = {};

        newFilter.jahr_2018 = 0;
        this.set("filter", JSON.stringify(newFilter));
    },
    initializeDistrictInfo: function () {
        const selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            districtName = $("#district-selector").children("option:selected").val(),
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0],
            districtInfo = [],
            values = featureCollection.map(feature => parseFloat(feature.getProperties().jahr_2018)),
            max = parseInt(Math.max(...values), 10),
            min = parseInt(Math.min(...values), 10),
            refValue = parseInt(refFeature.getProperties().jahr_2018, 10),
            space = Math.max(max - refValue, refValue - min),
            newInfo = {
                key: "jahr_2018", value: refValue, max: max, min: min, space: space
            };

        districtInfo.push(newInfo);

        this.set("districtInfo", districtInfo);
        this.set("districtName", districtName);
    }

});

export default LayerFilterModel;
