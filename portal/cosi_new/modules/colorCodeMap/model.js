import DropdownModel from "../../../../modules/snippets/dropdown/model";
import {Fill, Stroke, Style, Text} from "ol/style.js";

const LayerModel = Backbone.Model.extend({
    defaults: {
        dropDownModel: undefined,
        // the statistics features that have no geometry (Bevölkerung, Haushalte, Arbeitslose, ...)
        statisticsFeatures: [],
        // the district features with geometry (Stadtteil | Statistisches Gebiet)
        districtFeatures: []
    },
    initialize: function () {
        this.listenTo(Radio.channel("SelectDistrict"), {
            "reset": function () {
                this.reset();
                this.trigger("resetView");
            }
        });
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
            liveSearch: true,
            isDropup: true
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
            const scope = Radio.request("SelectDistrict", "getScope"),
                // the selected value in the dropdown
                value = valueModel.get("value"),
                statisticsFeatures = Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value);

            this.setStatisticsFeatures(statisticsFeatures);
            // to do dynamic for 'jahr_2018' -> find the last year
            this.styleDistrictFeaturs(this.get("statisticsFeatures"), "jahr_2018");
        }
    },

    /**
     * styles the equivalent district features (have a geometry) of the statistics features (have no geometry)
     * @param {ol.Features[]} features - the statistics features
     * @param {string} attribute - style is depending on this attribute
     * @returns {void}
     */
    styleDistrictFeaturs: function (features, attribute) {
        const districtFeatures = Radio.request("SelectDistrict", "getSelectedDistricts"),
            foundDistrictFeatures = [],
            values = features.map(feature => feature.getProperties()[attribute]),
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, "interpolateBlues");

        features.forEach(function (feature) {
            // find the equivalent district feature -> to do for stadtteile
            const foundFeature = districtFeatures.find(function (districtFeature) {
                return feature.get("statgebiet") === districtFeature.get("statgebiet");
            });

            foundFeature.setStyle(new Style({
                fill: new Fill({
                    color: colorScale.scale(feature.getProperties()[attribute]).replace("rgb", "rgba").replace(")", ", 0.8)")
                }),
                stroke: new Stroke({
                    color: colorScale.scale(feature.getProperties()[attribute]),
                    width: 3
                }),
                text: new Text({
                    font: "16px Calibri,sans-serif",
                    fill: new Fill({
                        color: "#000"
                    }),
                    stroke: new Stroke({
                        color: "#FFF",
                        width: 3
                    }),
                    text: feature.getProperties()[attribute] ? feature.getProperties()[attribute] : "Kein Wert vorhanden"
                })
            }));
            foundDistrictFeatures.push(foundFeature);
        });
        this.trigger("setLegend", colorScale.legend);
        this.set("districtFeatures", foundDistrictFeatures);
    },

    /**
     * gives the district features the default style
     * @param {Object[]} features - all styled district features
     * @returns {void}
     */
    unStyleDistrictFeatures: function (features) {
        features.forEach((feature) => {
            feature.setStyle(new Style({
                fill: new Fill({
                    color: "rgba(255, 255, 255, 0)"
                }),
                stroke: new Stroke({
                    color: "#3399CC",
                    width: 5
                })
            }));
        });
    },

    reset: function () {
        this.setStatisticsFeatures([]);
        this.set("districtFeatures", []);
    },

    /**
     * sets the statistics features
     * @param {ol.Feature[]} value - features
     * @returns {void}
     */
    setStatisticsFeatures: function (value) {
        this.set("statisticsFeatures", value);
    }

});

export default LayerModel;
