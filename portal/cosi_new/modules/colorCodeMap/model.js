import DropdownModel from "../../../../modules/snippets/dropdown/model";
import * as Chromatic from "d3-scale-chromatic";
import {Fill, Style} from "ol/style.js";

const LayerModel = Backbone.Model.extend({
    defaults: {
        dropDownModel: undefined,
        // the used features without geometry (Bevölkerung, Haushalte,...)
        features: [],
        // the district features with geometry (Stadtteil | Statistisches Gebiet)
        districtFeatures: []
    },
    initialize: function () {
        // to do for stadtteil
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
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

    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * sets the features based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        if (isSelected) {
            this.trigger("clearLegend");
            // the used features
            this.setFeaturesByValueAndScope(valueModel.get("value"), Radio.request("SelectDistrict", "getScope"));
            // to do dynamic for 'jahr_2018'
            this.styleDistrictFeaturs(this.get("features"), "jahr_2018");
        }
    },
    selectDistrictReminder: function () {
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");

        if (selectedDistricts.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong> Bitte wählen Sie zuerst die Bezirke mit 'Gebiet wählen' im Werkzeugmenü aus</strong>",
                kategorie: "alert-warning"
            });
        }
    },
    /**
     * styles the equivalent district features (have a geometry) of the used features (have no geometry)
     * @param {ol.Features[]} features - the used features
     * @param {string} attribute - style is depending on this attribute
     * @returns {void}
     */
    styleDistrictFeaturs: function (features, attribute) {
        const districtFeatures = this.getDistrictFeaturesByScope(Radio.request("SelectDistrict", "getScope")),
            foundDistrictFeatures = [],
            values = features.map(feature => feature.getProperties()[attribute]),
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, Chromatic.interpolateBlues);

        features.forEach(function (feature) {
            // find the equivalent district feature -> to do for stadtteile
            const foundFeature = districtFeatures.find(function (districtFeature) {
                return feature.get("statgebiet") === districtFeature.get("statgebiet");
            });

            foundFeature.setStyle(new Style({
                fill: new Fill({
                    color: colorScale.scale(feature.getProperties()[attribute])
                })
            }));
            foundDistrictFeatures.push(foundFeature);
        });
        this.trigger("setLegend", colorScale.legend);
        this.set("districtFeatures", foundDistrictFeatures);
    },

    /**
     * gives the district features a "null-style"
     * @param {Object[]} features - all styled district features
     * @returns {void}
     */
    unStyleDistrictFeaturs: function (features) {
        features.forEach((feature) => {
            feature.setStyle(null);
        });
    },

    /**
     * gets the district features (which have a geometry) by scope
     * @param {string} scope - Statischtische Gebiete | Stadtteile
     * @returns {ol.Feature[]} district features
     */
    getDistrictFeaturesByScope: function (scope) {
        let districtLayer;

        if (scope === "Statistische Gebiete") {
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {id: "6071"});
        }
        // Stadtteile
        else {
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {id: "1694"});
        }
        return districtLayer.get("layer").getSource().getFeatures();
    },

    /**
     * sets the used features
     * @param {string} value - the selected value in the dropdown
     * @param {string} scope - statgebiet | stadttteil
     * @returns {void}
     */
    setFeaturesByValueAndScope: function (value, scope) {
        this.set("features", Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value));
    }

});

export default LayerModel;
