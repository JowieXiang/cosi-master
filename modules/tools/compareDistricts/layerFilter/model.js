const LayerFilterModel = Backbone.Model.extend({
    defaults: {
        districtInfo: [], // [{key:...,value:..., max: ..., min: ...},{},...]
        layerInfo: {},
        filter: "", // e.g {filterKey:value,filterKey:value,filterKey:value,...},
        mode: "" // "DISTRICTMODE" or "VALUEMODE"
    },
    initialize: function () {
        this.checkSelectDistrict();
        this.initializeFilter();
        this.initializeDistrictInfo();
    },
    initializeFilter: function () {
        const newFilter = {};

        newFilter.jahr_2018 = 0;
        this.set("filter", JSON.stringify(newFilter));
    },
    checkSelectDistrict: function () {
        if (Radio.request("DistrictSelector", "getSelectedDistrict") !== "") {
            this.set("mode", "DISTRICTMODE");
        }
        else {
            this.set("mode", "VALUEMODE");
        }
    },
    initializeDistrictInfo: function () {
        const selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            });
        let refValue = 0;

        if (this.get("mode") === "DISTRICTMODE") {
            const districtName = $("#district-selector").children("option:selected").val(),
                refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0];

            refValue = parseInt(refFeature.getProperties().jahr_2018, 10);
        }
        else {
            refValue = 0;
        }

        const districtInfo = [],
            values = featureCollection.map(feature => parseFloat(feature.getProperties().jahr_2018)),
            max = parseInt(Math.max(...values), 10),
            min = parseInt(Math.min(...values), 10),
            newInfo = {
                key: "jahr_2018", value: refValue, max: max, min: min
            };

        districtInfo.push(newInfo);
        this.set("districtInfo", districtInfo);
    }

});

export default LayerFilterModel;
