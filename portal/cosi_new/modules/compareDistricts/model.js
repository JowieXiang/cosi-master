import Tool from "../../../../modules/core/modelList/tool/model";

const CompareDistrictsModel = Tool.extend(/** @lends CompareDistrictsModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        comparableFeaturesNames: [],
        layerFilterList: "", // e.g [{layerId: "", filter: {key: [],...}},...]
        mapLayerName: "compare-district"
    }),
    /**
     * @class CompareDistrictsModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts
     * @constructs
     * @property {string} layerFilterList all filter layers' data. e.g "[{layerId: "", filter: {key: [],...}},...]"
     * @property {Array} comparableFeaturesNames name of comparable districts
     * @property {Array} mapLayerName="compare-district" OpenLayers map layer containing comparable results
     */
    initialize: function () {
        this.superInitialize();
    }
});

export default CompareDistrictsModel;
