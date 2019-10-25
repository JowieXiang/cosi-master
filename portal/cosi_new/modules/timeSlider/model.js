import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import SliderModel from "../../../../modules/snippets/slider/model";
import {Fill, Style} from "ol/style.js";

const TimeSliderModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        renderToWindow: false,
        attribute_prefix: "jahr_",
        isRunning: false,
        name: "Zeitstrahl Analyse",
        glyphicon: "glyphicon-time"
    }),

    initialize: function () {
        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (!isActive) {
                    this.unStyleDistrictFeaturs(this.get("districtFeatures"));
                    this.trigger("remove");
                }
                else {
                    this.run();
                }
            }
        });
    },

    /**
     * starts the tool
     * @returns {void}
     */
    run: function () {
        // the used features
        this.setFeaturesByValueAndScope("Bevölkerung insgesamt", Radio.request("SelectDistrict", "getScope"));
        // data for the graph
        this.setFeaturesProperties(this.get("features"));
        this.trigger("render");
        // to do for stadtteile
        this.setDropDownModel(Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
        this.setSliderModel(this.get("features"));
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
            preselectedValues: valueList[0].value
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);
        this.trigger("renderDropDownView", dropdownModel);
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
            // the used features
            this.setFeaturesByValueAndScope(valueModel.get("value"), Radio.request("SelectDistrict", "getScope"));
            // data for the graph
            this.setFeaturesProperties(this.get("features"));
            this.setSliderModel(this.get("features"));
        }
    },

    /**
     * sets the slider for the time slider
     * @param {ol.Feature[]} features - the used features
     * @returns {void}
     */
    setSliderModel: function (features) {
        const sliderValues = this.getSliderValues(features, this.get("attribute_prefix")),
            sliderModel = new SliderModel({
                snippetType: "slider",
                values: sliderValues,
                type: "integer",
                preselectedValues: sliderValues[1]
            });

        this.listenTo(sliderModel, {
            "valuesChanged": this.sliderCallback
        }, this);

        this.set("sliderModel", sliderModel);
        this.setMaxYAxisValue(this.get("featuresProperties"), this.get("attribute_prefix"), sliderValues);
        // for the init call
        this.sliderCallback(undefined, sliderValues[1]);
        this.trigger("renderSliderView", sliderModel);
    },

    /**
     * gets the values for the time slider
     * @param {ol.Feature[]} features - the used features
     * @param {string} attribute_prefix - time unit prefix
     * @returns {string[]} values of the given time unit
     */
    getSliderValues: function (features, attribute_prefix) {
        const values = [];

        features.forEach(function (feature) {
            Object.keys(feature.getProperties()).forEach(function (key) {
                if (key.includes(attribute_prefix)) {
                    const index = key.indexOf("_") + 1;

                    values.push(parseInt(key.substr(index), 10));
                }
            });
        });

        // get all unique values
        return [...new Set(values.sort())];
    },

    /**
     * callback function for the "valuesChanged" event in the slider model
     * calls the styling function for the features and triggers renderGraph to the view
     * @param {Backbone.Model} valueModel - the value model which is selected
     * @param {number} sliderValue - the current value of the slider
     * @returns {void}
     */
    sliderCallback: function (valueModel, sliderValue) {
        this.styleDistrictFeaturs(this.get("features"), this.get("attribute_prefix") + sliderValue, this.get("maxYAxisValue"));
        this.trigger("renderGraph", this.get("featuresProperties"), sliderValue, this.get("maxYAxisValue"));
    },

    /**
     * styles the equivalent district features (have a geometry) of the used features (have no geometry)
     * use the same style for the district features as well as the bar chart
     * @param {ol.Features[]} features - the used features
     * @param {string} attribute - style is depending on this attribute
     * @param {number} max - max value for the color scale
     * @returns {void}
     */
    styleDistrictFeaturs: function (features, attribute, max) {
        const districtFeatures = this.getDistrictFeaturesByScope(Radio.request("SelectDistrict", "getScope")),
            foundDistrictFeatures = [],
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, max]);

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
        this.set("districtFeatures", foundDistrictFeatures);
    },

    /**
     * gives the district features a "null-style"
     * @param {Object[]} features - all styled features
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
     * starts the running of the time slider
     * @returns {void}
     */
    runningTimeSlider: function () {
        const sliderModel = this.get("sliderModel"),
            sliderModelValues = sliderModel.get("values"),
            sliderModelValue = sliderModel.get("valuesCollection").at(0).get("value"),
            indexOfValue = sliderModelValues.indexOf(sliderModelValue);

        if (indexOfValue < sliderModelValues.length - 1 && this.get("isRunning")) {
            sliderModel.get("valuesCollection").trigger("updateValue", sliderModelValues[indexOfValue + 1]);
            setTimeout(this.runningTimeSlider.bind(this), 1500);
        }
        // stop the running
        else {
            this.setIsRunning(false);
            this.trigger("stopRunning");
        }
    },

    setIsRunning: function (value) {
        this.set("isRunning", value);
    },

    /**
     * sets the used features
     * @param {string} value - the selected value in the dropdown
     * @param {string} scope - statgebiet | stadttteil
     * @returns {void}
     */
    setFeaturesByValueAndScope: function (value, scope) {
        this.set("features", Radio.request("FeaturesLoader", "getDistrictsByValue", scope, value));
    },

    /**
     * collects the data for the graph, conforms to the features properties
     * @param {ol.Feature[]} features - the used features
     * @returns {void}
     */
    setFeaturesProperties: function (features) {
        const featuresProperties = [];

        features.forEach(function (feature) {
            featuresProperties.push(feature.getProperties());
        });
        this.set("featuresProperties", featuresProperties);
    },

    /**
     * sets the max value for the y-axis
     * @param {object[]} featuresProperties - data for graph
     * @param {string} prefix - time unit prefix
     * @param {number[]} sliderValues - values of the slider
     * @returns {void}
     */
    setMaxYAxisValue: function (featuresProperties, prefix, sliderValues) {
        // to do für prozente
        let maxValue = 0;

        sliderValues.forEach(function (value) {
            const maxValues = featuresProperties.map(function (data) {
                return parseInt(data[prefix + value], 10) || 0;
            });

            maxValue = Math.max(...maxValues, maxValue);
        });

        this.set("maxYAxisValue", maxValue);
    }
});

export default TimeSliderModel;
