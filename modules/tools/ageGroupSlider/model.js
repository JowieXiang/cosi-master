import Tool from "../../core/modelList/tool/model";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";
import * as Chromatic from "d3-scale-chromatic";

const AgeGroupSliderModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        layerIds: [],
        scope: "",
        timeInterval: 2000,
        title: null,
        progressBarWidth: 10,
        activeLayer: {
            layerId: ""
        },
        windowsInterval: null,
        renderToWindow: true,
        glyphicon: "glyphicon-film",
        currentLayer: null,
        featureCollections: [],
        style: {
            chromaticScheme: Chromatic.interpolateBlues,
            opacity: 0.8
        }

    }),

    initialize: function () {
        this.setScope(Radio.request("SelectDistrict", "getScope"));

        const invalidLayerIds = this.checkIfAllLayersAvailable(this.get("layerIds")[this.get("scope")]);

        this.superInitialize();

        if (invalidLayerIds.length > 0) {
            Radio.trigger("Alert", "alert", "Konfiguration des Werkzeuges: " + this.get("name") + " fehlerhaft. <br>Bitte prüfen Sie folgende LayerIds: " + invalidLayerIds + "!");
        }

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                if (this.getScope() !== "") {
                    const timeLineLayerIds = this.get("layerIds")[this.get("scope")].map(layer => layer.layerId),
                        currentLayerIds = this.get("featureCollections").map(collection => collection.layerId);

                    if (_.contains(timeLineLayerIds, layerId) && !_.contains(currentLayerIds, layerId)) {
                        this.pushFeatureCollection(layerId, features);

                        if (this.get("featureCollections")) {
                            this.setProgressBarWidth(this.get("layerIds")[this.get("scope")]);
                            this.clearColorCodeLayers();
                            this.createColorCodeLayers();
                            this.addFeaturesToColorCodeLayers();
                        }
                    }
                }
            }
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {
                this.setScope(Radio.request("SelectDistrict", "getScope"));
                this.checkIfLayermodelExist(this.get("layerIds")[this.get("scope")]);
            }
        });

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.selectDistrictReminder();
                }
            },
            "change:activeLayer": function () {
                if (Radio.request("SelectDistrict", "getSelectedDistricts").length > 0) {
                    this.setAllColorCodeLayerInvisible();
                    if (this.get("activeLayer").layerId !== "") {
                        this.showActiveColorCodeLayer();
                    }
                }
            }
        });
    },

    // push feature collection to this model
    pushFeatureCollection: function (layerId, features) {
        var featureCollections = this.get("featureCollections");

        featureCollections.push({
            "layerId": layerId,
            "collection": features
        });
        this.set("featureCollections", featureCollections);
    },

    // reminds user to select district before using the ageGroup slider
    selectDistrictReminder: function () {
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");

        if (selectedDistricts.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong> Bitte wählen Sie zuerst die Gebiet mit 'Gebiet wählen' im Werkzeugmenü aus</strong>",
                kategorie: "alert-warning"
            });
        }
    },
    // set active color-code layer visible
    showActiveColorCodeLayer: function () {
        console.log("visible");
        const activeLayer = Radio.request("Map", "getLayerByName", this.get("activeLayer").layerId + "_colorcoded");

        if (activeLayer !== undefined) {
            activeLayer.setVisible(true);
        }
    },
    //  hide all color-code layers
    setAllColorCodeLayerInvisible: function () {
        _.each(this.get("layerIds")[this.get("scope")], layer => {
            if (Radio.request("Map", "getLayerByName", layer.layerId + "_colorcoded")) {
                const thisLayer = Radio.request("Map", "getLayerByName", layer.layerId + "_colorcoded");

                thisLayer.setVisible(false);
            }
        });
    },
    // clear all features from color-code layers
    clearColorCodeLayers: function () {
        _.each(this.get("layerIds")[this.get("scope")], layer => {
            var colorCodeLayer = Radio.request("Map", "getLayerByName", layer.layerId + "_colorcoded");

            if (colorCodeLayer !== undefined) {
                colorCodeLayer.getSource().clear();
            }
        });

    },

    createColorCodeLayers: function () {
        _.each(this.get("layerIds")[this.get("scope")], layer => {
            if (Radio.request("Map", "getLayerByName", layer.layerId + "_colorcoded") === undefined) {
                const newLayer = Radio.request("Map", "createLayerIfNotExists", layer.layerId + "_colorcoded"),
                    newSource = new VectorSource();

                newLayer.setSource(newSource);
                newLayer.setVisible(false);
            }
        });
    },

    addFeaturesToColorCodeLayers: function () {
        console.log("styling");
        // Workaround for inconsistent naming of "Statistische Gebiete"-selector
        const selector = Radio.request("SelectDistrict", "getSelector"),
            districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties()[selector]);

        if (this.get("layerIds")[this.get("scope")].length === this.get("featureCollections").length) {
            _.each(this.get("layerIds")[this.get("scope")], layer => {
                const featureCollection = this.get("featureCollections").filter(collection => collection.layerId === layer.layerId)[0],
                    field = Radio.request("Parser", "getItemsByAttributes", { id: layer.layerId })[0].mouseHoverField,
                    colorCodeLayer = Radio.request("Map", "getLayerByName", layer.layerId + "_colorcoded"),
                    selectedFeatures = featureCollection.collection.filter(feature => {
                        return _.contains(districtNames, feature.getProperties()[selector]);
                    });

                if (selectedFeatures.length > 0) {
                    let propSelector = field;
                    const values = selectedFeatures.map((feature) => {
                            const props = feature.getProperties();
                            let val;

                            if (field === "dynamic") {
                                for (const prop in props) {
                                    if (prop.includes("jahr_")) {
                                        val = props[prop];
                                        propSelector = prop;
                                        break;
                                    }
                                }
                                return parseFloat(val);
                            }
                            return parseFloat(feature.getProperties()[field]);
                        }),
                        colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, this.get("style").chromaticScheme),
                        newFeatures = [];

                    // Add the generated legend style to the Legend Portal
                    Radio.trigger("StyleWFS", "addDynamicLegendStyle", layer.layerId, colorScale.legend);
                    console.log(layer.layerId, colorScale.legend);

                    _.each(selectedFeatures, feature => newFeatures.push(feature.clone()));
                    _.each(newFeatures, (feature) => {
                        feature.setStyle(new Style({
                            fill: new Fill({
                                color: colorScale.scale(parseFloat(feature.getProperties()[propSelector]))
                            }),
                            stroke: new Stroke({
                                color: colorScale.scale(parseFloat(feature.getProperties()[propSelector])),
                                width: 3
                            })
                        }));
                    });
                    colorCodeLayer.getSource().addFeatures(newFeatures);
                    colorCodeLayer.setOpacity(this.get("style").opacity);
                }
            });
        }
    },

    reset: function () {
        this.stopInterval();
        this.set("activeLayer", { layerId: "" });
    },

    /**
     * Prüft ob das Layermodel schon existiert
     * @param   {object[]}  layerIds Konfiguration der Layer aus config.json
     * @returns {void}
     */
    checkIfLayermodelExist: function (layerIds) {
        _.each(layerIds, function (layer) {
            if (Radio.request("ModelList", "getModelsByAttributes", { id: layer.layerId }).length === 0) {
                this.addLayerModel(layer.layerId);
            }
        }, this);
    },

    /**
     * Fügt das Layermodel kurzzeitig der Modellist hinzu um prepareLayerObject auszuführen und entfernt das Model dann wieder.
     * @param   {string}  layerId    Id des Layers
     * @returns {void}
     */
    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", { id: layerId });
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);
    },

    /**
     * Ermittelt die Sichtbarkeit der layerIds
     * @param   {string} activeLayerId id des activeLayer
     * @returns {void}
     */
    toggleLayerVisibility: function (activeLayerId) {
        _.each(this.get("layerIds")[this.get("scope")], function (layer) {
            var status = layer.layerId === activeLayerId;

            this.sendModification(layer.layerId, status);
        }, this);
    },

    /**
     * Triggert übers Radio die neue Sichtbarkeit
     * @param   {string}    layerId layerId
     * @param   {boolean}   status  Sichtbarkeit true / false
     * @returns {void}
     */
    sendModification: function (layerId, status) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status
        });
    },

    /**
     * Findet den index im layerIds-Array zur activeLayerId oder liefert -1
     * @returns {integer}   index im Array mit activeLayerId
     */
    getActiveIndex: function () {
        return _.findIndex(this.get("layerIds")[this.get("scope")], function (layer) {
            return layer.layerId === this.get("activeLayer").layerId;
        }, this);
    },

    /**
     * Findet die activeLayerId anhand des index und initiiert Speicherung
     * @param {integer} index index in layerIds
     * @returns {void}
     */
    setActiveIndex: function (index) {
        this.setActiveLayer(this.get("layerIds")[this.get("scope")][index]);
        this.toggleLayerVisibility(this.get("activeLayer").layerId);
    },

    /**
     * Setter des Windows Intervals. Bindet an this.
     * @param {function} func                Funktion, die in this ausgeführt werden soll
     * @param {integer}  autorefreshInterval Intervall in ms
     * @returns {void}
     */
    setWindowsInterval: function (func, autorefreshInterval) {
        this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
    },

    /**
     * Startet das windows-Interval einmalig.
     * @returns {void}
     */
    startInterval: function () {
        var windowsInterval = this.get("windowsInterval"),
            timeInterval = this.get("timeInterval");

        if (_.isNull(windowsInterval)) {
            this.forwardLayer();
            this.setWindowsInterval(this.forwardLayer, timeInterval);
        }
    },

    /**
     * Stoppt das windows-Interval
     * @returns {void}
     */
    stopInterval: function () {
        var windowsInterval = this.get("windowsInterval");

        if (!_.isUndefined(windowsInterval)) {
            clearInterval(windowsInterval);
            this.set("windowsInterval", null);
        }
    },

    /**
     * Findet den vorherigen index im Array in einer Schleife.
     * @returns {void}
     */
    backwardLayer: function () {
        var index = this.getActiveIndex(),
            max = this.get("layerIds")[this.get("scope")].length - 1;

        if (index > 0) {
            this.setActiveIndex(index - 1);
        }
        else {
            this.setActiveIndex(max);
        }
    },

    /**
     * Findet den nächsten index im Array in einer Schleife.
     * @returns {void}
     */
    forwardLayer: function () {
        var index = this.getActiveIndex(),
            max = this.get("layerIds")[this.get("scope")].length - 1;

        if (index > -1 && index < max) {
            this.setActiveIndex(index + 1);
        }
        else {
            this.setActiveIndex(0);
        }
    },

    /**
     * Prüft, ob alle Layer, die der Layerslider nutzen soll, auch definiert sind und ein title Attribut haben
     * @param   {object[]}  layers Konfiguration der Layer aus config.json
     * @returns {object}   Invalid Layer oder undefined
     */
    checkIfAllLayersAvailable: function (layers) {
        var invalidLayers = [];

        if (this.getScope() !== "") {
            layers.forEach(function (layerObject) {
                if (
                    !Radio.request("RawLayerList", "getLayerAttributesWhere", { id: layerObject.layerId }) ||
                    !Radio.request("Parser", "getItemByAttributes", { id: layerObject.layerId })
                ) {
                    invalidLayers.push(layerObject.layerId);
                }
            });
        }

        return invalidLayers;
    },

    /**
     * setter for isCollapsed
     * @param {boolean} value isCollapsed
     * @returns {void}
     */
    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * setter for isCurrentWin
     * @param {boolean} value isCurrentWin
     * @returns {void}
     */
    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    /*
    * setter for layerIds
    * @param {object[]} value layerIds
    * @returns {void}
    */
    setLayerIds: function (value) {
        this.set("layerIds", value);
    },

    /*
    * setter for title
    * @param {string} value title
    * @returns {void}
    */
    setTitle: function (value) {
        this.set("title", value);
    },

    /*
    * setter for timeInterval
    * @param {integer} value timeInterval
    * @returns {void}
    */
    setTimeInterval: function (value) {
        this.set("timeInterval", value);
    },

    /*
    * setter for progressBarWidth
    * @param {object[]} layerIds layerIds zum Ermitteln der width
    * @returns {void}
    */
    setProgressBarWidth: function (layerIds) {
        // Mindestbreite der ProgressBar ist 10%.
        if (layerIds) {
            if (layerIds.length <= 10) {
                this.set("progressBarWidth", Math.round(100 / layerIds.length));
            }
            else {
                this.set("progressBarWidth", 10);
            }
        }
    },

    /*
    * setter for activeLayerId
    * @param {object} value activeLayer
    * @returns {void}
    */
    setActiveLayer: function (value) {
        this.set("activeLayer", value);
    },
    setScope: function (scope) {
        this.set("scope", scope);
    },
    getScope () {
        return this.get("scope");
    }
});

export default AgeGroupSliderModel;
