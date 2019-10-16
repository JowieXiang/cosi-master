import Tool from "../../../../modules/core/modelList/tool/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import SliderModel from "../../../../modules/snippets/slider/model";
import {Fill, Style} from "ol/style.js";
import MappingJson from "../../assets/mapping.json";

const TimeSeriesModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        renderToWindow: false,
        attribute_prefix: "jahr_",
        isRunning: false,
        name: "Zeitstrahl Analyse",
        glyphicon: "glyphicon-time",
        mappingJson: MappingJson
    }),

    initialize: function () {
        // this.superInitialize();
        console.info("init");
        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (!isActive) {
                    // this.unStyleFeatures(this.get("selectedLayer").get("layer").getSource().getFeatures());
                    Radio.trigger("ModelList", "setModelAttributesById", this.get("selectedLayer"), {isSelected: false});
                    this.trigger("remove");
                }
                else {
                    this.run();
                }
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": this.checkLayerById
        });

        if (this.get("isActive")) {
            this.run();
        }
    },

    /**
     * starts the tool
     * @returns {void}
     */
    run: function () {
        const scope = Radio.request("SelectDistrict", "getScope");
        console.info(scope);
        this.set("scope", scope);
        const features = Radio.request("FeaturesLoader", "getDistrictsByType", scope);
        console.info(features);
        this.set("category", Object.keys(MappingJson)[1]);
        console.info(this.get("mappingJson"));
        // this.setLayerList(this.get("layerIds"));
        this.trigger("render");
        this.setDropDownModel(MappingJson);
        // this.setSelectedLayer(this.get("layerList").at(0));
        // Radio.trigger("ModelList", "setModelAttributesById", this.get("layerList").at(0), {isSelected: true});
        this.setSliderModel(features);
    },

    /**
     * sets the list of layers that are to be displayed in the time series
     * @param {string[]} layerIds - the ids for the layer
     * @returns {void}
     */
    setLayerList: function (layerIds) {
        const layerList = [];

        layerIds.forEach(function (layerId) {
            let layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

            if (layer === undefined) {
                Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
                layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
            }
            layerList.push(layer);
        });

        this.set("layerList", new Backbone.Collection(layerList));
    },

    /**
     * sets the selection list for the time series
     * @param {Backbone.Collection} layerList - list of available layers
     * @returns {void}
     */
    setDropDownModel: function (layerList) {
        const dropdownModel = new DropdownModel({
            name: "Thema",
            type: "string",
            values: Object.values(layerList),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: Object.values(layerList)[1]
        });

        this.listenTo(dropdownModel, {
            "valuesChanged": this.dropDownCallback
        }, this);
        this.trigger("renderDropDownView", dropdownModel);
    },

    /**
     * callback function for the "valuesChanged" event in the dropdown model
     * selects or deselects the layer based on the dropdown selection
     * @param {Backbone.Model} valueModel - the value model which was selected or deselected
     * @param {boolean} isSelected - flag if value model is selected or not
     * @returns {void}
     */
    dropDownCallback: function (valueModel, isSelected) {
        const layer = this.getLayerByName(valueModel.get("value"));

        Radio.trigger("ModelList", "setModelAttributesById", layer.get("id"), {isSelected: isSelected});
        if (isSelected) {
            this.setSelectedLayer(layer);
            this.setSliderModel(layer);
        }
    },

    /**
     * sets the slider for the time series
     * @param {Backbone.Model} layer - the selected layer
     * @returns {void}
     */
    setSliderModel: function (features) {
        // const features = layer.get("layer").getSource().getFeatures();

        // if (features.length > 0) {
            const sliderValues = this.getSliderValues(features[0], this.get("attribute_prefix")),
                sliderModel = new SliderModel({
                    snippetType: "slider",
                    values: sliderValues,
                    type: "integer",
                    preselectedValues: sliderValues[0]
                });

            this.listenTo(sliderModel, {
                "valuesChanged": this.sliderCallback
            }, this);

            this.set("sliderModel", sliderModel);
            this.sliderCallback(undefined, sliderValues[0]);
            this.trigger("renderSliderView", sliderModel);
        // }
    },

    /**
     * gets the values for the time slider
     * @param {ol.Feature} feature - just a ol feature
     * @param {string} attribute_prefix - time unit prefix
     * @returns {string[]} values of the given time unit
     */
    getSliderValues: function (feature, attribute_prefix) {
        const values = [];

        Object.keys(feature.getProperties()).forEach(function (key) {
            if (key.includes(attribute_prefix)) {
                const index = key.indexOf("_") + 1;

                values.push(parseInt(key.substr(index), 10));
            }
        });

        return values.sort();
    },

    /**
     * callback function for the "valuesChanged" event in the slider model
     * collects the data for the graph
     * @param {Backbone.Model} valueModel - the value model which is selected
     * @param {number} sliderValue - the current value of the slider
     * @returns {void}
     */
    sliderCallback: function (valueModel, sliderValue) {
        console.info(this.get("category"));
        const features = Radio.request("FeaturesLoader", "getDistrictsByCategory", this.get("scope"), this.get("category")),
        // const features = this.get("selectedLayer").get("layer").getSource().getFeatures(),
            graphData = [];

        features.forEach(function (feature) {
            graphData.push(feature.getProperties());
        });
console.info(features);
console.info(graphData);
        // this.styleFeatures(features, this.get("attribute_prefix") + sliderValue);
        this.trigger("renderGraph", graphData, sliderValue, this.getMaxYAxisValue(graphData, this.get("attribute_prefix"), this.get("sliderModel").get("values")));
    },

    /**
     * styles the features as well as the bar chart
     * @param {Object[]} features - the features of the selected layer
     * @param {string} attribute - style is depending on this attribute
     * @returns {void}
     */
    styleFeatures: function (features, attribute) {
        const values = features.map(function (feature) {
                return feature.get(attribute);
            }),
            maxValue = Math.max(...values),
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, maxValue]);

        _.each(features, (feature) => {
            feature.setStyle(new Style({
                fill: new Fill({
                    color: colorScale.scale(feature.getProperties()[attribute])
                })
            }));
        });
    },

    /**
     * checks if the selected layer is equal to the layer of the loaded features
     * @param {string} id - the id of a layer
     * @returns {void}
     */
    checkLayerById: function (id) {
        if (this.get("selectedLayer") && this.get("selectedLayer").get("id") === id) {
            this.setSliderModel(this.get("selectedLayer"));
        }
    },

    /**
     * starts the running of the time series
     * @returns {void}
     */
    runningTimeSeries: function () {
        const sliderModel = this.get("sliderModel"),
            sliderModelValues = sliderModel.get("values"),
            sliderModelValue = sliderModel.get("valuesCollection").at(0).get("value"),
            indexOfValue = sliderModelValues.indexOf(sliderModelValue);

        if (indexOfValue < sliderModelValues.length - 1 && this.get("isRunning")) {
            sliderModel.get("valuesCollection").trigger("updateValue", sliderModelValues[indexOfValue + 1]);
            setTimeout(this.runningTimeSeries.bind(this), 1500);
        }
        // stop the running
        else {
            this.setIsRunning(false);
            this.trigger("stopRunning");
        }
    },

    /**
     * gets the max value for the y-axis
     * @param {object[]} graphData - data for graph
     * @param {string} prefix - time unit prefix
     * @param {number[]} sliderValues - values of the slider
     * @returns {number} max
     */
    getMaxYAxisValue: function (graphData, prefix, sliderValues) {
        let maxValue = 0;

        sliderValues.forEach(function (value) {
            const maxValues = graphData.map(function (data) {
                return data[prefix + value];
            });

            maxValue = Math.max(...maxValues, maxValue);
        });

        return maxValue;
    },

    /**
     * gets a layer by name
     * @param {string} layerName - the name of a layer
     * @returns {Backbone.Model} the layer
     */
    getLayerByName: function (layerName) {
        return this.get("layerList").findWhere({name: layerName});
    },

    /**
     * gives the features a "null-style"
     * @param {Object[]} features - all styled features
     * @returns {void}
     */
    unStyleFeatures: function (features) {
        _.each(features, (feature) => {
            feature.setStyle(null);
        });
    },

    setSelectedLayer: function (layer) {
        this.set("selectedLayer", layer);
    },

    setIsRunning: function (value) {
        this.set("isRunning", value);
    }
});

export default TimeSeriesModel;
