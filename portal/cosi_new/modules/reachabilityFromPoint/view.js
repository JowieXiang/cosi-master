import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";
import "./style.less";
import { Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryCollection from "ol/geom/GeometryCollection";
import InfoTemplate from "text-loader!./info.html";
import ReachabilityResultView from "./resultView";

const ReachabilityFromPointView = Backbone.View.extend({
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
        "click #backward": "toModeSelection",
        "click #clear": function () {
            this.clearMapLayer();
            this.clearResult();
            this.hideDashboardButton();
        },
        "click #show-result": "updateResult",
        "click #hh-request": "requestInhabitants"
        // "click .isochrone-origin": "zoomToOrigin"

    },
    initialize: function () {
        const channel = Radio.channel("ReachabilityFromPoint");

        this.registerClickListener();
        channel.on({
            "zoomToOrigin": this.zoomToOrigin
        }, this);
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));

                if (value) {
                    this.registerSetCoordListener();
                    this.render(model, value);
                    this.createMapLayer(this.model.get("mapLayerName"));
                    if (this.model.get("isochroneFeatures").length > 0) {
                        this.initializeUi();
                        this.setIsochroneAsBbox();
                    }
                    this.listenTo(Radio.channel("Searchbar"), {
                        "hit": this.setSearchResultToOrigin
                    });
                }
                else {
                    this.unregisterSetCoordListener();
                    Radio.trigger("SelectDistrict", "revertBboxGeometry");
                    Radio.trigger("Alert", "alert:remove");
                    if (mapLayer.getSource().getFeatures().length === 0) {
                        this.clearInput();
                    }
                    if (!this.model.get("setBySearch")) {
                        Radio.trigger("MapMarker", "hideMarker");
                    }
                }
            },
            "change:coordinate": function (model, value) {
                this.rerenderCoordinate(value);
            }
        });
    },
    model: {},
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.renderDropDownView(this.model.get("dropDownModel"));
        this.renderLegend();
        this.$el.find("#show-in-dashboard").hide();
        this.$el.find("#hh-request").hide();
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

        if (mapLayer.getSource().getFeatures().length > 0) {
            mapLayer.getSource().clear();
            this.model.set("isochroneFeatures", []);
            Radio.trigger("SelectDistrict", "revertBboxGeometry");
        }
    },
    hideDashboardButton: function () {
        this.$el.find("#show-in-dashboard").hide();
        this.$el.find("#hh-request").hide();
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
                    _.each(newFeatures, feature => {
                        feature.set("featureType", this.model.get("featureType"));
                    });
                    this.model.set("rawGeoJson", Radio.request("GraphicalSelect", "featureToGeoJson", newFeatures[0]));
                    this.styleFeatures(newFeatures, coordinate);

                    mapLayer.getSource().clear(); // Persistence of more than one isochrones?
                    mapLayer.getSource().addFeatures(newFeatures.reverse());
                    this.model.set("isochroneFeatures", newFeatures);
                    this.setIsochroneAsBbox();
                    this.clearResult();
                    this.hideDashboardButton();
                    this.$el.find("#hh-request").show();
                });
            Radio.trigger("Alert", "alert:remove");
        }
        else {
            this.inputReminder();
        }
    },
    initializeUi: function () {
        this.$el.find("#coordinate").val(`${this.model.get("coordinate")[0]},${this.model.get("coordinate")[1]}`);
        this.$el.find("#path-type").val(`${this.model.get("pathType")}`);
        this.$el.find("#range").val(`${this.model.get("range")}`);
    },
    setIsochroneAsBbox: function () {
        const layerlist = _.union(Radio.request("Parser", "getItemsByAttributes", { typ: "WFS", isBaseLayer: false }), Radio.request("Parser", "getItemsByAttributes", { typ: "GeoJSON", isBaseLayer: false })),
            polygonGeometry = this.model.get("isochroneFeatures")[this.model.get("steps") - 1].getGeometry(),
            geometryCollection = new GeometryCollection([polygonGeometry]);

        Radio.trigger("BboxSettor", "setBboxGeometryToLayer", layerlist, geometryCollection);
    },
    styleFeatures: function (features, coordinate) {
        for (let i = features.length - 1; i >= 0; i--) {
            features[i].setProperties({ coordinate });
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
    registerSetCoordListener: function () {
        this.setCoordListener = Radio.request("Map", "registerListener", "singleclick", this.setCoordinateFromClick.bind(this));
    },
    /**
     * unlisten click events when range input is blurred
     * @returns {void}
     */
    unregisterSetCoordListener: function () {
        Radio.trigger("Map", "unregisterListener", this.setCoordListener);
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
        this.model.set("setBySearch", false);
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
        this.$el.find("#coordinate").val(`${value[0]},${value[1]}`);
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
    inputReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Bitte füllen Sie alle Felder aus.</strong>",
            kategorie: "alert-warning"
        });
    },
    selectionReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Bitte wählen Sie mindestens ein Thema unter Fachdaten aus, zum Beispiel \"Sportstätten\".</strong>",
            kategorie: "alert-warning"
        });
    },
    updateResult: function () {
        const visibleLayerModels = Radio.request("ModelList", "getModelsByAttributes", { typ: "WFS", isBaseLayer: false, isSelected: true }),
            dataObj = { layers: [] };

        if (visibleLayerModels.length > 0) {
            Radio.trigger("Alert", "alert:remove");
            _.each(visibleLayerModels, layerModel => {
                const features = layerModel.get("layer").getSource().getFeatures();
                let idSelector;

                /**
                 * hard coded id selector for facility layers
                 */
                if (features[0].getProperties().schul_id) {
                    idSelector = features[0].getProperties().schulname ? "schulname" : "schul_id";
                }
                else if (features[0].getProperties().einrichtung) {
                    idSelector = features[0].getProperties().name ? "name" : "einrichtung";
                }
                else if (features[0].getProperties().Einrichtungsnummer) {
                    idSelector = features[0].getProperties().Name_normalisiert ? "Name_normalisiert" : "Einrichtungsnummer";
                }
                else if (features[0].getProperties().identnummer) {
                    idSelector = features[0].getProperties().anlagenname ? "anlagenname" : "identnummer";
                }

                // inscribe the coordinate to the feature for rendering to the resultView DOM Element
                // for zooming to feature by click
                features.forEach(feature => {
                    const geometry = feature.getGeometry(),
                        coord = geometry.getType() === "Point" ? geometry.getCoordinates().splice(0, 2) : Extent.getCenter(geometry.getExtent());

                    feature.set("coord", coord);
                });

                dataObj.layers.push({
                    layerName: layerModel.get("name"),
                    layerId: layerModel.get("id"),
                    features: features,
                    idSelector: idSelector
                });
            });
            dataObj.coordinate = Proj.transform(this.model.get("coordinate"), "EPSG:4326", "EPSG:25832");

            this.model.set("dataObj", dataObj);

            this.resultView = new ReachabilityResultView({ model: this.model });
            this.$el.find("#result").html(this.resultView.render().$el);
            this.$el.find("#show-in-dashboard").show();
        }
        else {
            this.selectionReminder();
        }
    },
    renderLegend: function () {
        const steps = this.model.get("steps"),
            range = this.model.get("range");

        if (range > 0) {
            this.$el.find("#legend").empty();
            for (let i = steps - 1; i >= 0; i--) {
                this.$el.find("#legend").append(`
                <svg width="15" height="15">
                    <circle cx="7.5"  cy="7.5" r="7.5" style="fill:rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.1 * (i + 1) + 0.3}); stroke-width: .5; stroke: #E3E3E3;" />
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
                    <circle cx="7.5"  cy="7.5" r="7.5" style="fill:rgba(${200 - 100 * i}, ${100 * i}, 3, ${0.1 * i + 0.3}); stroke-width: .5; stroke: #E3E3E3;" />
                </svg>
                <span>0</span>
                `);
            }
        }
    },
    toModeSelection: function () {
        this.model.set("isActive", false);
        Radio.request("ModelList", "getModelByAttributes", { name: "Erreichbarkeitsanalyse" }).set("isActive", true);
    },
    requestInhabitants: function () {
        Radio.trigger("GraphicalSelect", "onDrawEnd", this.model.get("rawGeoJson"), "einwohnerabfrage", true);
    },
    /**
     * set search result from the searchbar to origin coordinates
     * @returns {void}
     */
    setSearchResultToOrigin: function () {
        const overlayPosition = Radio.request("Map", "getOverlayById", this.model.get("markerId")).getPosition(),
            // handels both polygon features and point features
            parsedPosition = overlayPosition.map(item => typeof item === "string" ? parseFloat(item) : item),
            coordinate = Proj.transform(parsedPosition, "EPSG:25832", "EPSG:4326");

        this.model.set("coordinate", coordinate);
        this.model.set("setBySearch", true);
    },

    // listen  to click event and trigger setGfiParams
    registerClickListener: function () {
        this.clickListener = Radio.request("Map", "registerListener", "click", this.selectIsochrone.bind(this));
    },

    unregisterClickListener: function () {
        Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        this.stopListening(Radio.channel("Map"), this.clickEventKey);
    },

    // select isochrone on click
    selectIsochrone: function (evt) {
        const features = [];

        Radio.request("Map", "getMap").forEachFeatureAtPixel(evt.pixel, (feature) => {
            features.push(feature);
        });
        //  check "featureType" for the isochrone layer
        if (_.contains(features.map(feature => feature.getProperties().featureType), this.model.get("featureType"))) {
            const modelList = Radio.request("ModelList", "getModelsByAttributes", { isActive: true });

            _.each(modelList, model => {
                if (model.get("isActive")) {
                    model.set("isActive", false);
                }
            });
            if (!this.model.get("isActive")) {
                this.model.set("isActive", true);
            }
        }
    }
});

export default ReachabilityFromPointView;
