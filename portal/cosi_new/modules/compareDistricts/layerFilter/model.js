const LayerFilterModel = Backbone.Model.extend({
    defaults: {
        districtInfo: [], // [{key:...,value:..., max: ..., min: ...},{},...]
        layerInfo: {},
        filter: "" // e.g {filterKey:value,filterKey:value,filterKey:value,...},
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
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            });
        let refValue = 0;
            console.log("selected: ",Radio.request("DistrictSelector", "getSelectedDistrict"));
        if (Radio.request("DistrictSelector", "getSelectedDistrict") !== "Leeren") {
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
        console.log("disInfo intial: ", this.get("districtInfo"));

    },
    updateRefDistrictValue: function () {
        const selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            layerId = this.get("layerInfo").layerId,
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                id: layerId
            }),
            newDistrictInfo = _.map(this.get("districtInfo"), _.clone);

        let refValue = 0;
        console.log("selected value: ", Radio.request("DistrictSelector", "getSelectedDistrict"));
        if (Radio.request("DistrictSelector", "getSelectedDistrict") !== "Leeren") {
            const districtName = $("#district-selector").children("option:selected").val(),
                refFeature = featureCollection.filter(feature => feature.getProperties()[selector] === districtName)[0];

            refValue = parseInt(refFeature.getProperties().jahr_2018, 10);
        }
        else {
            refValue = 0;
        }
        newDistrictInfo.filter(item => item.key === "jahr_2018")[0].value = refValue;
        this.set("districtInfo", newDistrictInfo);
    }

});

export default LayerFilterModel;
