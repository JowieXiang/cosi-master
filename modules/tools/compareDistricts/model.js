import Tool from "../../core/modelList/tool/model";

const CompareDistrictsModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        layerFilterList: "", // e.g [{layerId: "", filter: [{key: value},...]},...]
        mapLayerName: "compare-district"
    }),

    initialize: function () {

        this.superInitialize();

    }


});

export default CompareDistrictsModel;
