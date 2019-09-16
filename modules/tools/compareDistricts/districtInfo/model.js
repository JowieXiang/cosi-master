const DistrictInfoModel = Backbone.Model.extend({
    defaults: {
        districtName: "", // selected district name
        districtInfo: [], // [{key:...,value:...},{},...]
        layerInfo: null

    },
    initialize: function () {

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
        console.log(districtInfo);
        this.set("districtInfo", districtInfo);
        this.set("districtName", districtName);
    }
});

export default DistrictInfoModel;
