import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";
import "./style.less";
import { Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryCollection from "ol/geom/GeometryCollection";
import InfoTemplate from "text-loader!./info.html";

const ReachabilityView = Backbone.View.extend({
    events: {
        "click #create-isochrones": "createIsochrones",
        "click button#Submit": "checkIfSelected",
        "change #coordinate": "setCoordinateFromInput",
        "focus #coordinate": "registerClickListener",
        "blur #coordinate": "unregisterClickListener",
        "change #path-type": "setPathType",
        "change #range": "setRange",
        "click #help": "showHelp"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.render(model, value);
                    this.createMapLayer(this.model.get("mapLayerName"));
                }
                else {
                    Radio.trigger("SelectDistrict", "resetBboxGeometry");
                    this.clearMapLayer(this.model.get("mapLayerName"));
                    this.clearInput();
                }
            },
            "change:coordinate": function (model, value) {
                this.rerenderCoordinate(value);
            }
        });
    },
    model: {},
    template: _.template(Template),
    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.renderDropDownView(this.model.get("dropDownModel"));
        }
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({ model: dropdownModel });

        this.$el.find("#isochrones-layer").html(dropdownView.render().el);
    },
    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name);

        newLayer.setVisible(false);
    },
    clearMapLayer: function (name) {
        const mapLayer = Radio.request("Map", "getLayerByName", name);

        mapLayer.getSource().clear();
        mapLayer.setVisible(false);
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
            Radio.request("OpenRoute", "requestIsochrones", pathType, coordinate, [range / 4, range / 2, range])
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
                    mapLayer.setVisible(true);
                    this.model.set("isochroneFeatures", newFeatures);

                    const layerlist = _.union(Radio.request("Parser", "getItemsByAttributes", { typ: "WFS", isBaseLayer: false }), Radio.request("Parser", "getItemsByAttributes", { typ: "GeoJSON", isBaseLayer: false })),
                        polygonGeometry = this.model.get("isochroneFeatures")[this.model.get("steps") - 1].getGeometry(),
                        geometryCollection = new GeometryCollection([polygonGeometry]);

                    Radio.trigger("BboxSettor", "setBboxGeometryToLayer", layerlist, geometryCollection)
                });
        }
        else {
            this.inputReminder();
        }
    },
    styleFeatures: function (features) {
        for (let i = features.length - 1; i >= 0; i--) {
            features[i].setStyle(new Style({
                fill: new Fill({
                    color: `rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.1 * i + 0.3})`
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
    }
});

export default ReachabilityView;
