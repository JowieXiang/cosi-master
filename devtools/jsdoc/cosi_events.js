/** -------------------- FeaturesLoader -------------------- */

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


/** -------------------- OpenRouteService -------------------- */

/**
 * @event OpenRouteService#RadioTriggerCompareDistrictsCloseFilter
 * @description sends request to get Isochrone geoJSON
 * @param {String} pathType - type of transportation
 * @param {Array} coordinates - coordinates of origins
 * @param {Array} rangeArray - array of time range values
 * @example  Radio.request("OpenRoute", "requestIsochrones", pathType, coordinates, rangeArray);
 */

/** -------------------- Reachability From Point -------------------- */

/**
* @event ReachabilityFromPointModel#ChangeCoordinate
* @description triggered when reference point coordinate changes
*/

/**
* @event ReachabilityFromPointModel#ChangeIsActive
* @description trigged when IsActive changes
*/

/** -------------------- Select Districts -------------------- */

/**
 * @event Tools.SelectDistrict#RadioTriggerSelectDistrictRevertBboxGeometry
 * @description set bbox back to selected districts
 * @example  Radio.trigger("SelectDistrict", "revertBboxGeometry");
 */

/** -------------------- Bounding Box Settor -------------------- */

/**
 * @event BboxSettor#RadioTriggerSetBboxGeometryToLayer
 * sets the bbox geometry for targeted raw layers or exisiting vector layers
 * @param {Array} itemList - list of target raw layers
 * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
 * @example  Radio.trigger("BboxSettor", "setBboxGeometryToLayer", itemList, bboxGeometry);
 */
