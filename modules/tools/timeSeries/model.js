import Tool from "../../core/modelList/tool/model";
import DropdownModel from "../../snippets/dropdown/model";
import SliderModel from "../../snippets/slider/model";

const TimeSeriesModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        renderToWindow: false,
        attribute_prefix: "jahr_",
        isRunning: false
    }),

    initialize: function () {
        this.superInitialize();

        this.listenToOnce(this, {
            "change:isActive": function () {
                this.setLayerList(this.get("layerIds"));
                this.trigger("render");
                this.setDropDownModel(this.get("layerList"));
                this.setSelectedLayer(this.get("layerList").at(0));
                Radio.trigger("ModelList", "setModelAttributesById", this.get("layerList").at(0), {isSelected: true});
                this.setSliderModel(this.get("selectedLayer"));
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": this.checkLayerById
        });

        if (this.get("isActive")) {
            this.setLayerList(this.get("layerIds"));
            this.trigger("render");
            this.setDropDownModel(this.get("layerList"));
            this.setSelectedLayer(this.get("layerList")[0].at(0));
            // auch gleich features selecten??s
            Radio.trigger("ModelList", "setModelAttributesById", this.get("layerList").at(0), {isSelected: true});
            this.setSliderModel(this.get("selectedLayer"));
        }
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
            values: layerList.pluck("name"),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: layerList.pluck("name")[0]
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
            Radio.trigger("ModelList", "setModelAttributesById", this.get("layerList").at(0), {isSelected: true});
            this.setSliderModel(layer);
        }
    },

    /**
     * sets the slider for the time series
     * @param {Backbone.Model} layer - the selected layer
     * @returns {void}
     */
    setSliderModel: function (layer) {
        const features = layer.get("layer").getSource().getFeatures();

        if (features.length > 0) {
            const values = this.getSliderValues(features[0], this.get("attribute_prefix")),
                sliderModel = new SliderModel({
                    snippetType: "slider",
                    values: values,
                    type: "integer",
                    preselectedValues: values[1]
                });

            this.listenTo(sliderModel, {
                "valuesChanged": this.sliderCallback
            }, this);

            this.set("sliderModel", sliderModel);
            this.sliderCallback(undefined, values[1]);
            this.trigger("renderSliderView", sliderModel);
        }
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
        const features = this.get("selectedLayer").get("layer").getSource().getFeatures(),
            graphData = [];

        features.forEach(function (feature) {
            graphData.push(feature.getProperties());
        });

        this.trigger("renderGraph", graphData, sliderValue);
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
     * gets a layer by name
     * @param {string} layerName - the name of a layer
     * @returns {Backbone.Model} the layer
     */
    getLayerByName: function (layerName) {
        return this.get("layerList").findWhere({name: layerName});
    },

    setSelectedLayer: function (layer) {
        this.set("selectedLayer", layer);
    },

    setIsRunning: function (value) {
        this.set("isRunning", value);
    }
});

export default TimeSeriesModel;
