import Tool from "../../core/modelList/tool/model";
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style.js';

const AgeGroupSliderModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        layerIds: [],
        timeInterval: 2000,
        title: null,
        progressBarWidth: 10,
        activeLayer: { layerId: "" },
        windowsInterval: null,
        renderToWindow: true,
        glyphicon: "glyphicon-film",
        currentLayer: null
    }),

    initialize: function () {
        const invalidLayerIds = this.checkIfAllLayersAvailable(this.get("layerIds"));

        this.superInitialize();
        this.setProgressBarWidth(this.get("layerIds"));

        if (invalidLayerIds.length > 0) {
            Radio.trigger("Alert", "alert", "Konfiguration des Werkzeuges: " + this.get("name") + " fehlerhaft. <br>Bitte prüfen Sie folgende LayerIds: " + invalidLayerIds + "!");
        }

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.checkIfLayermodelExist(this.get("layerIds"));
                    if (Radio.request("SelectDistrict", "getSelectedDistricts").length > 0) {
                        _.each(this.get("layerIds"), layer => {
                            var populationLayer = Radio.request("ModelList", "getModelsByAttributes", { id: layer.layerId })[0];
                            var mouseHoverField = Radio.request("Parser", "getItemsByAttributes", { id: layer.layerId })[0].mouseHoverField;
                            var selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties().stadtteil);

                            populationLayer.get("layer").getSource().on('change', function (evt) {
                                let source = evt.target;
                                if (source.getState() === 'ready') {
                                    var selectedFeatures = source.getFeatures().filter(feature => {
                                        return _.contains(selectedDistricts, feature.getProperties().stadtteil)
                                    });
                                    if (selectedFeatures.length > 0) {
                                        var newLayer = Radio.request("Map", "createLayerIfNotExists", layer.layerId + "_layer");
                                        var newSource = new VectorSource();
                                        var values = selectedFeatures.map(feature => parseFloat(feature.getProperties()[mouseHoverField])),
                                            colorScale = Radio.request("ColorScale", "getColorScaleByValues", values);
                                        var newFeatures = [];
                                        _.each(selectedFeatures, feature => newFeatures.push(feature.clone()));
                                        _.each(newFeatures, (feature) => {
                                            feature.setStyle(new Style({
                                                fill: new Fill({
                                                    color: colorScale(parseFloat(feature.getProperties()[mouseHoverField])),
                                                }),
                                                stroke: new Stroke({
                                                    color: colorScale(parseFloat(feature.getProperties()[mouseHoverField])),
                                                    width: 3
                                                })
                                            }));
                                        });
                                        newSource.addFeatures(newFeatures);
                                        newLayer.setSource(newSource);
                                        newLayer.setVisible(false);
                                    }
                                }

                            });
                        });
                    }
                }
            },

            "change:activeLayer": function (model, value) {
                if (Radio.request("SelectDistrict", "getSelectedDistricts").length > 0) {
                    //set all layer invisible
                    _.each(this.get("layerIds"), layer => {
                        let thisLayer = Radio.request("Map", "getLayerByName", layer.layerId + "_layer");
                        thisLayer.setVisible(false);
                    });
                    if (this.get("activeLayer").layerId !== "") {
                        // for each of the timeline layers
                        let currentLayer = Radio.request("Map", "getLayerByName", this.get("activeLayer").layerId + "_layer");;
                        currentLayer.setVisible(true);
                    } 
                }
                // else {
                //     alert("please first select features")
                // }
            }
        });
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
        _.each(this.get("layerIds"), function (layer) {
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
        return _.findIndex(this.get("layerIds"), function (layer) {
            return layer.layerId === this.get("activeLayer").layerId;
        }, this);
    },

    /**
     * Findet die activeLayerId anhand des index und initiiert Speicherung
     * @param {integer} index index in layerIds
     * @returns {void}
     */
    setActiveIndex: function (index) {
        this.setActiveLayer(this.get("layerIds")[index]);
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
            max = this.get("layerIds").length - 1;

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
            max = this.get("layerIds").length - 1;

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

        layers.forEach(function (layerObject) {
            if (
                !Radio.request("RawLayerList", "getLayerAttributesWhere", { id: layerObject.layerId }) ||
                !Radio.request("Parser", "getItemByAttributes", { id: layerObject.layerId })
            ) {
                invalidLayers.push(layerObject.layerId);
            }
        });

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
        if (layerIds.length <= 10) {
            this.set("progressBarWidth", Math.round(100 / layerIds.length));
        }
        else {
            this.set("progressBarWidth", 10);
        }
    },

    /*
    * setter for activeLayerId
    * @param {object} value activeLayer
    * @returns {void}
    */
    setActiveLayer: function (value) {
        this.set("activeLayer", value);
    }
});

export default AgeGroupSliderModel;
