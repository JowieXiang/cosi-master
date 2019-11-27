import DropdownModel from "../../../../../modules/snippets/dropdown/model";
import { getLayerList, getLayerWhere } from "masterportalAPI/src/rawLayerList";

const LayerFilterSelectorModel = Backbone.Model.extend(/** @lends LayerFilterSelectorModel.prototype */{
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        urls: {
            "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
            "stadtteile": ""
        },
        dropDownModel: {}
    },
    /**
     * @class LayerFilterSelectorModel
     * @extends Backbone.Model
     * @memberof Tools.CompareDistricts.LayerFilterSelector
     * @constructs
     * @property {Array} layerOptions list of layer filter options
     * @property {string} selectedDistrict="Leeren" selected districtname
     * @property {object} urls={"statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test", "stadtteile": ""} mapping of district scopes and urls
     * @property {object} dropDownModel dropdown menu model
     */
    initialize: function () {
        const currentSelector = Radio.request("SelectDistrict", "getSelector"),
            layers = getLayerList().filter(function (layer) {
                return layer.url === this.get("urls")[currentSelector];
            }, this),
            layerOptions = layers.map(layer => {
                return {
                    "layerName": layer.name, "layerId": layer.id
                };
            });

        this.setLayerOptions(layerOptions);
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": function () {
                this.updateDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
            }
        }, this);
    },
    /**
      * sets the selection list for the time slider
      * @param {object[]} valueList - available values
      * @returns {void}
      */
    setDropDownModel: function (valueList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: valueList,
            snippetType: "dropdown",
            isMultiple: false,
            isGrouped: true,
            displayName: "Auswahl demografischer Daten",
            liveSearch: true
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);
        this.set("dropDownModel", dropdownModel);
    },
    updateDropDownModel: function (valueList) {
        this.get("dropDownModel").set("values", valueList);
    },
    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * sets the features based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {

            this.setSelectedLayer(valueModel.get("value"));
        }
    },
    setSelectedLayer: function (value) {
        const selectedObj = this.get("dropDownModel").attributes.values.filter(item => item.value === value)[0],
            layerModel = getLayerWhere({ featureType: "v_hh_statistik_" + selectedObj.category.toLowerCase() });

        this.set("selectedLayer", { layerName: layerModel.name, layerId: layerModel.id });
    },
    setLayerOptions: function (value) {
        this.set("layerOptions", value);
    },
    getSelectedLayer: function () {
        return this.get("selectedLayer");
    },
    getLayerOptions: function () {
        return this.get("layerOptions");
    }

});

export default LayerFilterSelectorModel;
