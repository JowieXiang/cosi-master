import Tool from "../../../../modules/core/modelList/tool/model";

const CompareDistrictsModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        comparableFeaturesNames: [],
        layerFilterList: "", // e.g [{layerId: "", filter: {key: [],...}},...]
        mapLayerName: "compare-district"
    }),
    initialize: function () {
        this.superInitialize();
    }
});

export default CompareDistrictsModel;
