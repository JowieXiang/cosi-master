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
* @event FeaturesLoader#RadioRequestFeaturesLoaderGetAllValuesByScope
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
 * @event Tools.CompareDistricts#RadioTriggerCompareDistrictsChangeRefValue
 * @description trigged when reference value input changes
 * @example  Radio.trigger("CompareDistricts", "changeRefValue");
 */

/**
* @event CompareDistrictsModel#changeIsActive
* @description trigged when isActive changes
*/

/**
* @event CompareDistrictsModel#changeLayerFilterList
* @description trigged when layerFilterList changes
*/

/**
* @event LayerFilterCollection#Add
* @description triggered when new model is added to the LayerfilterList
*/

/**
* @event LayerFilterCollection#Destroy
* @description trigged when model is destroyed in LayerFilterList
*
*/

/**
* @event LayerFilterCollection#Change
* @description trigged when layerFilterList changes
*/

/**
 * @event DistrictSelector#RadioRequestDistrictSelectorGetSelectedDistrict
 * @description returns selected reference district
 * @example  Radio.request("DistrictSelector", "getSelectedDistrict");
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

/** -------------------- Select District -------------------- */

/**
 * @event Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
 * @description returns current selector
 * @example  Radio.request("SelectDistrict", "getSelector");
 */


/**
 * @event Tools.SelectDistrict#RadioTriggerSelectDistrictGetDistrictLayer
 * @description returns 'districtLayer' object
 * @example  Radio.request("SelectDistrict", "getDistrictLayer");
 */

 /**
 * @event Tools.SelectDistrict#RadioTriggerSelectDistrictRevertBboxGeometry
 * @description sets bbox back to selected districts
 * @example  Radio.trigger("SelectDistrict", "revertBboxGeometry");
 */

 /**
 * @event Tools.SelectDistrict#RadioTriggerSelectDistrictGetScope
 * @description returns current scope
 * @example  Radio.request("SelectDistrict", "getScope");
 */

 /**
 * @event Tools.SelectDistrict#RadioTriggerZoomToDistrict
 * @description sets viewport to selected districts
 * @param {string} districtName names of selected districts
 * @param {boolean} onlySelected todo
 * @example  Radio.request("SelectDistrict", "zoomToDistrict");
 */

 /**
  * @event Tools.SelectDistrict#RadioRequestSetSelectedDistrictsToFeatures
  * @description sets features as selected districts
  * @param {array} features features to be set as selectedDistricts
  * @example Radio.request("SelectDistrict", "setSelectedDistrictsToFeatures", features);
  */

 /**
 * @event Tools.SelectDistrict#RadioRequestSelectDistrictGetSelectedDistricts
 * @description gets selected districts
 * @example Radio.request("SelectDistrict", "getSelectedDistricts");
 */

/** -------------------- Bounding Box Settor -------------------- */

/**
 * @event BboxSettor#RadioTriggerSetBboxGeometryToLayer
 * sets the bbox geometry for targeted raw layers or exisiting vector layers
 * @param {Array} itemList - list of target raw layers
 * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
 * @example  Radio.trigger("BboxSettor", "setBboxGeometryToLayer", itemList, bboxGeometry);
 */

/**
 * @event Dashboard#RadioTriggerDashboardDestroyWidgetById
 * @description destroys widget by Id
 * @param {String} id id of widget
 * @example Radio.trigger("Dashboard", "destroyWidgetById", id);
 */

/** -------------------- Dashboard -------------------- */

/**
 * @event Dashboard#RadioTriggerDashboardAppend
 * @description appends a new widget to the dashboard
 * @param {Backbone.View | object | string} child the child object to append
 * @param {string} parent the container-selector to append to, defaults to ".info-screen-children"
 * @param {object} opts appending options (optional)
 * @param {boolean} cullButtons remove buttons when appending html to InfoScreen, defaults to false (optional)
 * @example Radio.trigger("Dashboard", "append", child, parent = ".info-screen-children", opts, cullButtons = false);
 */

/**
 * @event Dashboard#RadioTriggerDashboardDestroyWidgetById
 * @description removes a widget from the dashboard by ID
 * @param {String} id the ID of the widget to remove
 * @example Radio.trigger("Dashboard", "destroyWidgetById", id);
 */

