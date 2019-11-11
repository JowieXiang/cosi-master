import Tool from "../../core/modelList/tool/model";

const CompareDistrictsModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        comparableFeaturesName: [],
        layerFilterList: "", // e.g [{layerId: "", filter: {key: [],...}},...]
        mapLayerName: "compare-district",
        mode: "" // "DISTRICTMODE", "VALUEMODE"
    }),
    initialize: function () {
        this.superInitialize();
    }
});

export default CompareDistrictsModel;
