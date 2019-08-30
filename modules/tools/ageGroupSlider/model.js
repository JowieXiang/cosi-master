import Tool from "../../core/modelList/tool/model";

const AgeGroupSliderModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        layerIds: [],
        timeInterval: 2000,
        title: null,
        progressBarWidth: 10,
        activeLayer: { layerId: "" },
        windowsInterval: null,
        renderToWindow: true,
        glyphicon: "glyphicon-film"
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
                    _.each(this.get("layerIds"), function (layer) {
                        var layers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"})
                        console.log(layers);
                        let layerModel = Radio.request("ModelList", "getModelsByAttributes", { id: layer.layerId });
                        layerModel[0].get("layer").getSource().on('change', function (evt) {
                            const source = evt.target;
                            if (source.getState() === 'ready') {
                                const thisLayer = layerModel[0].get("layer");
                                const stylelistmodel = Radio.request("StyleList", "returnModelById", thisLayer.getProperties().id);
                                var styleFunction = function (feature) {
                                    return stylelistmodel.createStyle(feature, false);
                                };
                                // console.log(thisLayer.getSource().getFeatures()[0] ? layerModel[0].get("layer").getSource().getFeatures()[0].getProperties().bu18_prz : "not ready");
                                // layerModel[0].get("layer").setStyle(styleFunction);
                                // console.log("one layer is ready")
                            }
                        });
                    });
                } else {
                    /**
                     * change back to original style
                     */
                }
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
