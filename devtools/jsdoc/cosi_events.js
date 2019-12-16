/** -------------------- FeaturesLoaders -------------------- */

/**
 * @event FeaturesLoader#RadioTriggerDistrictsLoaded
 * @description Triggered when datasets of selectedDistricts are loaded
 */

/**
* @event FeaturesLoader#RadioRequestGetDistrictsByScope
* @description  returns the district features
* @param {string} scope - scope of districts, "Stadtteile" or "Statistische Gebiete"
* @example Radio.request("FeaturesLoader", "getDistrictsByScope", scope)
*/

/**
* @event FeaturesLoader#RadioRequestGetDistrictsByValue
* @description returns district features by a value
* @param {string} scope - scope of districts, "Stadtteile" or "Statistische Gebiete"
* @param {string} value - the value to be filtered by
* @example Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value)
*/

/**
* @event FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
* @description returns all features of a layer. If the features are not yet stored, it will be loaded
* @param {object} obj - key value pair of a layer attribute
* @example Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", obj)
*/

/**
* @event FeaturesLoader#RadioRequestGetAllValuesByScope
* @description get all mapped data layer infos by scope
* @param {string} scope - scope of districts, "Stadtteile" or "Statistische Gebiete"
* @example Radio.request("FeaturesLoader", "getAllValuesByScope", scope)
*/


/** -------------------- Compare Districts -------------------- */
/**
 * @event Tools.CompareDistricts#RadioTriggerCompareDistrictsSelectRefDistrict
 * @description trigged when reference district drop-down selector is changed
 * @example  Radio.trigger("CompareDistricts", "selectRefDistrict");
 */

/**
 * @event Tools.CompareDistricts#RadioTriggerCompareDistrictsCloseFilter
 * @description trigged when a layer filter is closed by user
 * @example  Radio.trigger("CompareDistricts", "closeFilter");
 */

/**
* @event CompareDistrictsModel#changeIsActive
* @description trigged when isActive changes
*/

/**
* @event CompareDistrictsModel#changeLayerFilterList
* @description trigged when layerFilterList changes
*/
