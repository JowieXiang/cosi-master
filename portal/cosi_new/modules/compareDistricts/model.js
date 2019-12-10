import Tool from "../../../../modules/core/modelList/tool/model";
import {Fill, Stroke, Style} from "ol/style.js";

const CompareDistrictsModel = Tool.extend(/** @lends CompareDistrictsModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        // selectedLayers: [],
        comparableFeaturesNames: [],
        layerFilterList: "", // e.g [{layerId: "", filter: {key: [],...}},...]
        mapLayerName: "compare-district",
        selectedStyle: new Style({
            fill: new Fill({
                color: [8, 119, 95, 0.3]
            }),
            stroke: new Stroke({
                color: [8, 119, 95, 0.3],
                width: 3
            })
        }),
        refDistrict: null
    }),
    /**
     * @class CompareDistrictsModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts
     * @constructs
     * @property {string} layerFilterList all filter layers' data. e.g "[{layerId: "", filter: {key: [],...}},...]"
     * @property {Array} comparableFeaturesNames name of comparable districts
     * @property {Array} mapLayerName="compare-district" OpenLayers map layer containing comparable results
     * @property {Feature} refDistrict reference district feature
     */
    initialize: function () {
        this.superInitialize();
    }
});

export default CompareDistrictsModel;
