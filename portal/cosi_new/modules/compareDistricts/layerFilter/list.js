import LayerFilterModel from "./model";

var LayerFilterList = Backbone.Collection.extend(/** @lends LayerFilterList.prototype */{
    /**
     * @class LayerFilterList
     * @description list of layer filter models
     * @extends Backbone.Collection
     * @memberof Tools.CompareDistricts.LayerFilter
     * @constructs
     */
    model: LayerFilterModel
});

export default LayerFilterList;
