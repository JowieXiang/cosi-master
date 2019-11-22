import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";
import "./style.less";
import { Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryCollection from "ol/geom/GeometryCollection";
import InfoTemplate from "text-loader!./info.html";
import resultTemplate from "text-loader!./resultTemplate.html";

const ReachabilityView = Backbone.View.extend({
    events: {
        "click #create-isochrones": "createIsochrones",
        "click button#Submit": "checkIfSelected",
        "change #coordinate": "setCoordinateFromInput",
        "change #path-type": "setPathType",
        "change #range": function (e) {
            this.setRange(e);
            this.renderLegend(e);
        },
        "click #help": "showHelp",
        "click #show-in-dashboard": "showInDashboard",
        "click #backward": "toModeSelection",
        "click #clear": function () {
            this.clearMapLayer();
            this.clearResult();
            this.hideDashboardButton();
        },
        "click #show-result": "updateResult"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.$el.find("#show-result").prop("disabled", true);
                    this.registerClickListener();
                    this.render(model, value);
                    this.createMapLayer(this.model.get("mapLayerName"));
                    if (this.model.get("isochroneFeatures").length > 0) {
                        this.updateResult();
                        this.setIsochroneAsBbox();
                    }
                }
                else {
                    this.unregisterClickListener();
                    Radio.trigger("SelectDistrict", "revertBboxGeometry");
                    this.clearInput();
                    Radio.trigger("MapMarker", "hideMarker");
                }
            },
            "change:coordinate": function (model, value) {
                this.rerenderCoordinate(value);
            }
        });
    },
    model: {},
    template: _.template(Template),
    dashboardTemplate: _.template(resultTemplate),
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.renderDropDownView(this.model.get("dropDownModel"));
        this.renderLegend();
        this.$el.find("#show-in-dashboard").hide();
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({ model: dropdownModel });

        this.$el.find("#isochrones-layer").html(dropdownView.render().el);
    },
    createMapLayer: function (name) {
        // returns the existing layer if already exists
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name);

        newLayer.setMap(Radio.request("Map", "getMap"));
        newLayer.setVisible(true);
    },
    clearMapLayer: function () {
        const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));

        mapLayer.getSource().clear();
        this.model.set("isochroneFeatures", []);
        Radio.trigger("SelectDistrict", "revertBboxGeometry");
    },
    hideDashboardButton: function () {
        this.$el.find("#show-in-dashboard").hide();
    },
    clearResult: function () {
        this.$el.find("#result").empty();
    },
    clearInput: function () {
        this.model.set("coordinate", []);
        this.model.set("pathType", "");
        this.model.set("range", 0);
    },
    createIsochrones: function () {
        // coordinate has to be in the format of [[lat,lon]] for the request
        const coordinate = [this.model.get("coordinate")],
            pathType = this.model.get("pathType"),
            range = this.model.get("range") * 60;

        if (coordinate.length > 0 && pathType !== "" && range !== 0) {
            Radio.request("OpenRoute", "requestIsochrones", pathType, coordinate, [range * 0.33, range * 0.67, range])
                .then(res => {
                    // reverse JSON object sequence to render the isochrones in the correct order
                    const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
                        json = JSON.parse(res),
                        reversedFeatures = [...json.features].reverse();

                    json.features = reversedFeatures;
                    let newFeatures = this.parseDataToFeatures(JSON.stringify(json));

                    newFeatures = this.transformFeatures(newFeatures, "EPSG:4326", "EPSG:25832");
                    this.styleFeatures(newFeatures);

                    mapLayer.getSource().clear();
                    mapLayer.getSource().addFeatures(newFeatures.reverse());
                    this.model.set("isochroneFeatures", newFeatures);
                    this.setIsochroneAsBbox();
                    this.clearResult();
                    this.hideDashboardButton();
                });
        }
        else {
            this.inputReminder();
        }
    },
    setIsochroneAsBbox: function () {
        const layerlist = _.union(Radio.request("Parser", "getItemsByAttributes", { typ: "WFS", isBaseLayer: false }), Radio.request("Parser", "getItemsByAttributes", { typ: "GeoJSON", isBaseLayer: false })),
            polygonGeometry = this.model.get("isochroneFeatures")[this.model.get("steps") - 1].getGeometry(),
            geometryCollection = new GeometryCollection([polygonGeometry]);

        Radio.trigger("BboxSettor", "setBboxGeometryToLayer", layerlist, geometryCollection);
    },
    styleFeatures: function (features) {
        for (let i = features.length - 1; i >= 0; i--) {
            features[i].setStyle(new Style({
                fill: new Fill({
                    color: `rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.05 * i + 0.1})`
                }),
                stroke: new Stroke({
                    color: "white",
                    width: 1
                })
            }));
        }
    },
    /**
     * listen for click events on the map when range input is focused
     * @returns {void}
     */
    registerClickListener: function () {
        this.clickListener = Radio.request("Map", "registerListener", "singleclick", this.setCoordinateFromClick.bind(this));
    },
    /**
     * unlisten click events when range input is blurred
     * @returns {void}
     */
    unregisterClickListener: function () {
        Radio.trigger("Map", "unregisterListener", this.clickListener);
    },
    /**
     * set coordinate value in model according to click
     * @param {object} evt - click-on-map event
     * @returns {void}
     */
    setCoordinateFromClick: function (evt) {
        const coordinate = Proj.transform(evt.coordinate, "EPSG:25832", "EPSG:4326");

        Radio.trigger("MapMarker", "showMarker", evt.coordinate);
        this.model.set("coordinate", coordinate);
    },
    /**
     * set coordinate value in model according to input value
     * @param {object} evt - change coordinate input event
     * @returns {void}
     */
    setCoordinateFromInput: function (evt) {

        const coordinate = [evt.target.value.split(",")[0].trim(), evt.target.value.split(",")[1].trim()];

        this.model.set("coordinate", coordinate);

    },
    /**
     * rerender coordinate input box
     * @param {object} value - coordinate value
     * @returns {void}
     */
    rerenderCoordinate: function (value) {
        this.$el.find("#coordinate").val(`${value[0]},${value[1]}`);
    },
    /**
     * set pathType value in model
     * @param {object} evt - select change event
     * @returns {void}\
     */
    setPathType: function (evt) {
        this.model.set("pathType", evt.target.value);
    },
    /**
     * set range value in model
     * @param {object} evt - input change event
     * @returns {void}
     */
    setRange: function (evt) {
        this.model.set("range", evt.target.value);
    },

    /**
     * Tries to parse data string to ol.format.GeoJson
     * @param   {string} data string to parse
     * @throws Will throw an error if the argument cannot be parsed.
     * @returns {object}    ol/format/GeoJSON/features
     */
    parseDataToFeatures: function (data) {
        const geojsonReader = new GeoJSON();
        let jsonObjects;

        try {
            jsonObjects = geojsonReader.readFeatures(data);
        }
        catch (err) {
            console.error("GeoJSON cannot be parsed.");
        }

        return jsonObjects;
    },
    /**
     * Transforms features between CRS
     * @param   {feature[]} features Array of ol.features
     * @param   {string}    crs      EPSG-Code of feature
     * @param   {string}    mapCrs   EPSG-Code of ol.map
     * @returns {void}
     */
    transformFeatures: function (features, crs, mapCrs) {
        _.each(features, function (feature) {
            var geometry = feature.getGeometry();

            if (geometry) {
                geometry.transform(crs, mapCrs);
            }
        });
        return features;
    },
    showHelp: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    },
    // reminds user to select district before using the ageGroup slider
    inputReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Please make sure all input information are provided</strong>",
            kategorie: "alert-warning"
        });
    },
    selectionReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Please open at least one layer in Fachdaten, for example \"Sportstätten\"</strong>",
            kategorie: "alert-warning"
        });
    },
    updateResult: function () {
        const visibleLayerModels = Radio.request("ModelList", "getModelsByAttributes", { typ: "WFS", isBaseLayer: false, isSelected: true }),
            dataObj = { layerNames: [], features: {} };

        if (visibleLayerModels.length > 0) {
            _.each(visibleLayerModels, layerModel => {
                dataObj.layerNames.push(layerModel.get("name"));
                dataObj.features[layerModel.get("name")] = layerModel.get("layer").getSource().getFeatures();
            });
            this.$el.find("#result").html(this.dashboardTemplate(dataObj));
            this.$el.find("#show-in-dashboard").show();
        }
        else {
            this.selectionReminder();
        }
    },
    // show results in dashboard
    showInDashboard: function () {
        const visibleLayerModels = Radio.request("ModelList", "getModelsByAttributes", { typ: "WFS", isBaseLayer: false, isSelected: true }),
            dataObj = { layerNames: [], features: {} };

        _.each(visibleLayerModels, layerModel => {
            dataObj.layerNames.push(layerModel.get("name"));
            dataObj.features[layerModel.get("name")] = layerModel.get("layer").getSource().getFeatures();
        });

        Radio.trigger("Dashboard", "destroyWidgetById", "reachability");
        Radio.trigger("Dashboard", "append", this.dashboardTemplate(dataObj), "#dashboard-containers", {
            id: "reachability",
            name: "Erreichbarkeit ab einem Referenzpunkt",
            glyphicon: "glyphicon-road"
        });
    },
    renderLegend: function () {
        const steps = this.model.get("steps"),
            range = this.model.get("range");

        if (range > 0) {
            this.$el.find("#legend").empty();
            for (let i = steps - 1; i >= 0; i--) {
                this.$el.find("#legend").append(`
                <svg width="15" height="15">
                    <circle cx="7.5"  cy="7.5" r="7.5" style="fill:rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.1 * (i + 1) + 0.3});" />
                </svg>
                <span>${Number.isInteger(range * ((steps - i) / 3)) ? range * ((steps - i) / 3) : (range * ((steps - i) / 3)).toFixed(2)}  </span>
                `);
            }
        }
        else {
            this.$el.find("#legend").empty();
            for (let i = steps - 1; i >= 0; i--) {
                this.$el.find("#legend").append(`
                <svg width="15" height="15">
                    <circle cx="7.5"  cy="7.5" r="7.5" style="fill:rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.1 * i + 0.3});" />
                </svg>
                <span>0</span>
                `);
            }
        }
    },
    toModeSelection: function () {
        this.model.set("isActive", false);
        Radio.request("ModelList", "getModelByAttributes", { name: "Erreichbarkeitsanalyse" }).set("isActive", true);
    }
});

export default ReachabilityView;
