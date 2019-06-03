import Tool from "../../core/modelList/tool/model";
import SnippetDropdownModel from "../../snippets/dropdown/model";
import SnippetCheckboxModel from "../../snippets/checkbox/model";
import {GeoJSON} from "ol/format.js";
import Overlay from "ol/Overlay.js";
import {Draw} from "ol/interaction.js";
import {createBox} from "ol/interaction/Draw.js";
import {Circle} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";

const EinwohnerabfrageModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        renderToWindow: true,
        // checkbox snippet for alkis adressen layer
        checkBoxAddress: undefined,
        // checkbox snippet for zensus raster layer
        checkBoxRaster: undefined,
        drawInteraction: undefined,
        isCollapsed: undefined,
        isCurrentWin: undefined,
        // circle overlay (tooltip) - shows the radius
        circleOverlay: new Overlay({
            offset: [15, 0],
            positioning: "center-left"
        }),
        tooltipOverlay: new Overlay({
            offset: [15, 20],
            positioning: "top-left"
        }),
        data: {},
        dataReceived: false,
        requesting: false,
        snippetDropdownModel: {},
        values: {
            "Rechteck aufziehen": "Box",
            "Kreis aufziehen": "Circle",
            "Fläche zeichnen": "Polygon"
        },
        currentValue: "",
        metaDataLink: undefined,
        // mrh meta data id
        mrhId: "46969C7D-FAA8-420A-81A0-8352ECCFF526",
        // fhh meta data id
        fhhId: "B3FD9BD5-F614-433F-A762-E14003C300BF",
        fhhDate: undefined,
        tooltipMessage: "Klicken zum Starten und Beenden",
        tooltipMessagePolygon: "Klicken um Stützpunkt hinzuzufügen",
        uniqueIdList: [],
        glyphicon: "glyphicon-wrench",
        rasterLayerId: "13023",
        alkisAdressLayerId: "9726"
    }),

    initialize: function () {
        this.superInitialize();

        this.setCheckBoxAddress(new SnippetCheckboxModel({
            isSelected: false,
            label: "ALKIS Adressen anzeigen (ab 1: 20.000)"
        }));
        this.setCheckBoxRaster(new SnippetCheckboxModel({
            isSelected: false,
            label: "Raster Layer anzeigen (ab 1: 100.000)"
        }));

        this.listenTo(this, {
            "change:isActive": this.setStatus
        });
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaData": this.fetchedMetaData
        });
        this.listenTo(this.snippetDropdownModel, {
            "valuesChanged": this.createDrawInteraction
        });
        this.listenTo(this.get("checkBoxRaster"), {
            "valuesChanged": this.toggleRasterLayer
        });
        this.listenTo(this.get("checkBoxAddress"), {
            "valuesChanged": this.toggleAlkisAddressLayer
        });
        this.listenTo(Radio.channel("ModelList"), {
            "updateVisibleInMapList": function () {
                this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
                this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
            }
        });
        this.on("change:isActive", this.handleCswRequests, this);
        this.createDomOverlay("circle-overlay", this.get("circleOverlay"));
        this.createDomOverlay("tooltip-overlay", this.get("tooltipOverlay"));
        this.setDropDownSnippet(new SnippetDropdownModel({
            name: "Geometrie",
            type: "string",
            displayName: "Geometrie auswählen",
            values: _.allKeys(this.get("values")),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: _.allKeys(this.get("values"))[0]
        }));
        this.setMetaDataLink(Radio.request("RestReader", "getServiceById", "2").get("url"));
    },
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.attr, cswObj.parsedData);
        }
    },
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return _.contains(uniqueIdList, uniqueId);
    },
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
    },
    updateMetaData: function (attr, parsedData) {
        if (attr === "fhhDate") {
            this.setFhhDate(parsedData.date);
        }
    },
    /**
     * Reset State when tool becomes active/inactive
     * @returns {void}
     */
    reset: function () {
        this.setData({});
        this.setDataReceived(false);
        this.setRequesting(false);
    },
    /**
     * Called when the wps modules returns a request
     * @param  {string} response - the response xml of the wps
     * @param  {number} status - the HTTPStatusCode
     * @returns {void}
     */
    handleResponse: function (response, status) {
        var parsedData;

        this.setRequesting(false);
        parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.einwohner;

        if (status === 200) {
            if (parsedData.ErrorOccured === "yes") {
                this.handleWPSError(parsedData);
            }
            else {
                this.handleSuccess(parsedData);
            }
        }
        else {
            this.resetView();
        }
        this.trigger("renderResult");
    },
    /**
     * Displays Errortext if the WPS returns an Error
     * @param  {String} response received by wps
     * @returns {void}
     */
    handleWPSError: function (response) {
        Radio.trigger("Alert", "alert", JSON.stringify(response.ergebnis));
    },
    /**
     * Used when statuscode is 200 and wps did not return an error
     * @param  {String} response received by wps
     * @returns {void}
     */
    handleSuccess: function (response) {
        var obj;

        try {
            obj = JSON.parse(response.ergebnis);
            this.prepareDataForRendering(obj);
            this.setData(obj);
            this.setDataReceived(true);
        }
        catch (e) {
            Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + JSON.stringify(response));
            this.resetView();
            (console.error || console.warn).call(console, e.stack || e);
        }
    },
    /**
     * Iterates ofer response properties
     * @param  {object} response -
     * @returns {void}
     */
    prepareDataForRendering: function (response) {
        _.each(response, function (value, key, list) {
            var stringVal = "";

            if (!isNaN(value)) {
                if (key === "suchflaeche") {
                    stringVal = this.chooseUnitAndPunctuate(value);
                }
                else {
                    stringVal = Radio.request("Util", "punctuate", value);
                }
                list[key] = stringVal;
            }
            else {
                list[key] = value;
            }

        }, this);
    },
    /**
     * Chooses unit based on value, calls panctuate and converts to unit and appends unit
     * @param  {number} value -
     * @param  {number} maxDecimals - decimals are cut after maxlength chars
     * @returns {string} unit
     */
    chooseUnitAndPunctuate: function (value, maxDecimals) {
        var newValue;

        if (value < 250000) {
            return Radio.request("Util", "punctuate", value.toFixed(maxDecimals)) + " m²";
        }
        if (value < 10000000) {
            newValue = value / 10000.0;

            return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " ha";
        }
        newValue = value / 1000000.0;

        return Radio.request("Util", "punctuate", newValue.toFixed(maxDecimals)) + " km²";
    },

    /**
     * Used to hide Geometry and Textoverlays if request was unsuccessful for any reason
     * @returns {void}
     */
    resetView: function () {
        var layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer");

        if (layer) {
            layer.getSource().clear();
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
        }
    },
    /**
     * Handles (de-)activation of this Tool
     * @param {object} model - tool model
     * @param {boolean} value flag is tool is ctive
     * @returns {void}
     */
    setStatus: function (model, value) {
        var selectedValues;

        if (value) {
            this.checksSnippetCheckboxLayerIsLoaded(this.get("rasterLayerId"), this.get("checkBoxRaster"));
            this.checksSnippetCheckboxLayerIsLoaded(this.get("alkisAdressLayerId"), this.get("checkBoxAddress"));
            selectedValues = this.get("snippetDropdownModel").getSelectedValues();
            this.createDrawInteraction(selectedValues.values[0] || _.allKeys(this.get("values"))[0]);
        }
        else {
            // this.setIsCurrentWin(false);
            if (!_.isUndefined(this.get("drawInteraction"))) {
                this.get("drawInteraction").setActive(false);
            }
            Radio.trigger("Map", "removeOverlay", this.get("circleOverlay"));
            Radio.trigger("Map", "removeOverlay", this.get("tooltipOverlay"));
        }
    },

    /**
     * runs the csw requests once and removes this callback from the change:isCurrentWin event
     * because both requests only need to be executed once
     * @returns {void}
     */
    handleCswRequests: function () {
        var metaIds = [
            {
                metaId: this.get("fhhId"),
                attr: "fhhDate"
            }
        ];

        if (this.get("isActive")) {
            _.each(metaIds, function (metaIdObj) {
                var uniqueId = _.uniqueId(),
                    cswObj = {};

                this.get("uniqueIdList").push(uniqueId);
                cswObj.metaId = metaIdObj.metaId;
                cswObj.keyList = ["date"];
                cswObj.uniqueId = uniqueId;
                cswObj.attr = metaIdObj.attr;
                Radio.trigger("CswParser", "getMetaData", cswObj);
            }, this);

            this.off("change:isActive", this.handleCswRequests);
        }
    },

    /**
     * creates a draw interaction and adds it to the map.
     * @param {string} drawType - drawing type (Box | Circle | Polygon)
     * @returns {void}
     */
    createDrawInteraction: function (drawType) {
        var that = this,
            value = this.get("values")[drawType],
            layer = Radio.request("Map", "createLayerIfNotExists", "ewt_draw_layer"),
            createBoxFunc = createBox(),
            drawInteraction = new Draw({
                // destination for drawn features
                source: layer.getSource(),
                // drawing type
                // a circle with four points is internnaly used as Box, since type "Box" does not exist
                type: value === "Box" ? "Circle" : value,
                // is called when a geometry's coordinates are updated
                geometryFunction: value === "Polygon" ? undefined : function (coordinates, opt_geom) {
                    if (value === "Box") {
                        return createBoxFunc(coordinates, opt_geom);
                    }
                    // value === "Circle"
                    return that.snapRadiusToInterval(coordinates, opt_geom);
                }
            });

        this.setCurrentValue(value);
        this.toggleOverlay(value, this.get("circleOverlay"));
        Radio.trigger("Map", "addOverlay", this.get("tooltipOverlay"));

        this.setDrawInteractionListener(drawInteraction, layer);
        this.setDrawInteraction(drawInteraction);
        Radio.trigger("Map", "registerListener", "pointermove", this.showTooltipOverlay.bind(this), this);
        Radio.trigger("Map", "addInteraction", drawInteraction);
    },
    snapRadiusToInterval: function (coordinates, opt_geom) {
        var radius = Math.sqrt(Math.pow(coordinates[1][0] - coordinates[0][0], 2) + Math.pow(coordinates[1][1] - coordinates[0][1], 2)),
            geometry;

        radius = this.precisionRound(radius, -1);
        geometry = opt_geom || new Circle(coordinates[0]);
        geometry.setRadius(radius);

        this.showOverlayOnSketch(radius, coordinates[1]);
        return geometry;
    },
    /**
     * sets listeners for draw interaction events
     * @param {ol.interaction.Draw} interaction -
     * @param {ol.layer.Vector} layer -
     * @returns {void}
     */
    setDrawInteractionListener: function (interaction, layer) {
        var that = this;

        interaction.on("drawstart", function () {
            layer.getSource().clear();
        }, this);

        interaction.on("drawend", function (evt) {
            var geoJson = that.featureToGeoJson(evt.feature);

            that.makeRequest(geoJson);
        }, this);

        interaction.on("change:active", function (evt) {
            if (evt.oldValue) {
                layer.getSource().clear();
                Radio.trigger("Map", "removeInteraction", evt.target);
            }
        });
    },
    /**
     * @param  {object} geoJson -
     * @returns {void}
     */
    makeRequest: function (geoJson) {
        this.setDataReceived(false);
        this.setRequesting(true);
        this.trigger("renderResult");

        Radio.trigger("WPS", "request", "1001", "einwohner_ermitteln.fmw", {
            "such_flaeche": JSON.stringify(geoJson)
        }, this.handleResponse.bind(this));
    },
    prepareData: function (geoJson) {
        var prepared = {};

        prepared.type = geoJson.getType();
        prepared.coordinates = geoJson.geometry;
    },
    /**
     * calculates the circle radius and places the circle overlay on geometry change
     * @param {number} radius - circle radius
     * @param {number[]} coords - point coordinate
     * @returns {void}
     */
    showOverlayOnSketch: function (radius, coords) {
        var circleOverlay = this.get("circleOverlay");

        circleOverlay.getElement().innerHTML = this.roundRadius(radius);
        circleOverlay.setPosition(coords);
    },
    showTooltipOverlay: function (evt) {
        var coords = evt.coordinate,
            tooltipOverlay = this.get("tooltipOverlay"),
            currentValue = this.get("currentValue");

        if (currentValue === "Polygon") {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessagePolygon");
        }
        else {
            tooltipOverlay.getElement().innerHTML = this.get("tooltipMessage");
        }
        tooltipOverlay.setPosition(coords);
    },

    precisionRound: function (number, precision) {
        var factor = Math.pow(10, precision);

        return Math.round(number * factor) / factor;
    },
    /**
     * converts a feature to a geojson
     * if the feature geometry is a circle, it is converted to a polygon
     * @param {ol.Feature} feature - drawn feature
     * @returns {object} GeoJSON
     */
    featureToGeoJson: function (feature) {
        var reader = new GeoJSON(),
            geometry = feature.getGeometry();

        if (geometry.getType() === "Circle") {
            feature.setGeometry(fromCircle(geometry));
        }
        return reader.writeGeometryObject(feature.getGeometry());
    },

    /**
     * adds or removes the circle overlay from the map
     * @param {string} type - geometry type
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    toggleOverlay: function (type, overlay) {
        if (type === "Circle") {
            Radio.trigger("Map", "addOverlay", overlay);
        }
        else {
            Radio.trigger("Map", "removeOverlay", overlay);
        }
    },

    /**
     * rounds the circle radius
     * @param {number} radius - circle radius
     * @return {string} the rounded radius
     */
    roundRadius: function (radius) {
        if (radius > 500) {
            return (Math.round(radius / 1000 * 100) / 100) + " km";
        }
        return (Math.round(radius * 10) / 10) + " m";
    },

    /**
     * creates a div element for the circle overlay
     * and adds it to the overlay
     * @param {string} id -
     * @param {ol.Overlay} overlay - circleOverlay
     * @returns {void}
     */
    createDomOverlay: function (id, overlay) {
        var element = document.createElement("div");

        element.setAttribute("id", id);
        overlay.setElement(element);
    },

    /**
     * checks if snippetCheckboxLayer is loaded and toggles the button accordingly
     * @param {String} layerId - id of the addressLayer
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snbippet checkbox model for a layer
     * @returns {void}
     */
    checksSnippetCheckboxLayerIsLoaded: function (layerId, snippetCheckboxModel) {
        var model = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            isVisibleInMap = !_.isUndefined(model) ? model.get("isVisibleInMap") : false;

        if (isVisibleInMap) {
            snippetCheckboxModel.setIsSelected(true);
        }
        else {
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * show or hide the zensus raster layer
     * @param {boolean} value - true | false
     * @returns {void}
     */
    toggleRasterLayer: function (value) {
        var layerId = this.get("rasterLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxRaster"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * show or hide the alkis adressen layer
     * @param {boolean} value - true | false
     * @returns {void}
     */
    toggleAlkisAddressLayer: function (value) {
        var layerId = this.get("alkisAdressLayerId");

        this.addModelsByAttributesToModelList(layerId);
        if (value) {
            this.checkIsModelLoaded(layerId, this.get("checkBoxAddress"));
        }
        this.setModelAttributesByIdToModelList(layerId, value);
    },

    /**
     * if the model does not exist, add Model from Parser to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (layerId) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", {id: layerId}))) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    },

    /**
     * checks whether the model has been loaded.
     * If it is not loaded, a corresponding error message is displayed and switches snippetCheckbox off
     * @param {String} layerId id of the layer to be toggled
     * @param {SnippetCheckboxModel} snippetCheckboxModel - snbippet checkbox model for a layer
     * @returns {void}
     */
    checkIsModelLoaded: function (layerId, snippetCheckboxModel) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", {id: layerId}))) {
            Radio.trigger("Alert", "alert", "Der Layer mit der ID: " + layerId + " konnte nicht geladen werden, da dieser im Portal nicht zur Verfügung steht!");
            snippetCheckboxModel.setIsSelected(false);
        }
    },

    /**
     * sets selected and visibility to ModelList via Radio.trigger
     * @param {String} layerId id of the layer to be toggled
     * @param {boolean} value - true | false
     * @returns {void}
     */
    setModelAttributesByIdToModelList: function (layerId, value) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: value,
            isVisibleInMap: value
        });
    },

    setCheckBoxAddress: function (value) {
        this.set("checkBoxAddress", value);
    },

    setCheckBoxRaster: function (value) {
        this.set("checkBoxRaster", value);
    },

    setData: function (value) {
        this.set("data", value);
    },

    setDataReceived: function (value) {
        this.set("dataReceived", value);
    },

    setRequesting: function (value) {
        this.set("requesting", value);
    },

    setDropDownSnippet: function (value) {
        this.set("snippetDropdownModel", value);
    },

    setFhhDate: function (value) {
        this.set("fhhDate", value);
    },

    setDrawInteraction: function (value) {
        this.set("drawInteraction", value);
    },

    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    setCurrentValue: function (value) {
        this.set("currentValue", value);
    },

    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    },

    setMetaDataLink: function (value) {
        this.set("metaDataLink", value);
    }
});

export default EinwohnerabfrageModel;
