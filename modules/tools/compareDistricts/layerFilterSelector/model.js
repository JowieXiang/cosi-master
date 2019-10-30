import DropdownModel from "../../../snippets/dropdown/model";

const LayerFilterSelectorModel = Backbone.Model.extend({
    defaults: {
        layerOptions: [], // all select options (vector layers in the map) e.g. [{layerName:"",layerId:""},...]
        selectedLayer: null, // selected option e.g. {layerName:"",layerId:""}
        urls: {
            "statgebiet": "https://geodienste.hamburg.de/HH_WFS_Statistische_Gebiete_Test",
            "stadtteile": ""
        },
        dropDownModel: undefined
    },
    initialize: function () {
        const currentSelector = Radio.request("SelectDistrict", "getSelector"),
            layers = Radio.request("RawLayerList", "getLayerListWhere", {
                url: this.get("urls")[currentSelector]
            }),
            layerOptions = layers.map(layer => {
                return {
                    "layerName": layer.get("name"), "layerId": layer.get("id")
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
            displayName: "Demografische Daten anzeigen",
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
            layerModel = Radio.request("RawLayerList", "getLayerWhere", { featureType: "v_hh_statistik_" + selectedObj.category.toLowerCase() });

        this.set("selectedLayer", { layerName: layerModel.attributes.name, layerId: layerModel.attributes.id });
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
