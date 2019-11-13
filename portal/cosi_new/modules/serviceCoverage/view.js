import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";
import "./style.less";
import { Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";
import InfoTemplate from "text-loader!./info.html";
import union from "turf-union";

const ServiceCoverageView = Backbone.View.extend({
    events: {
        "click #create-isochrones": "createIsochrones",
        "click button#Submit": "checkIfSelected",
        "change #path-type": "setPathType",
        "change #range": "setRange",
        "click #service-coverage-help": "showHelp"
    },
    initialize: function () {

        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": function (models) {
                this.setFacilityLayers(models);
            }
        });

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.render(model, value);
                    this.createMapLayer(this.model.get("mapLayerName"));
                }
                else {
                    this.clearInput();
                    this.clearMapLayer(this.model.get("mapLayerName"));
                    Radio.trigger("Alert", "alert:remove");
                }
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

        this.$el.find("#select-layer").html(dropdownView.render().el);
    },
    setFacilityLayers: function (models) {
        const facilityLayerModels = models.filter(model => model.get("isFacility") === true)

        if (facilityLayerModels.length > 0) {
            const facilityNames = facilityLayerModels.map(model => model.get("featureType").trim());

            this.model.get("dropDownModel").set("values", facilityNames);
            this.renderDropDownView(this.model.get("dropDownModel"));
        }
        else {
            this.model.get("dropDownModel").set("values", []);
            this.renderDropDownView(this.model.get("dropDownModel"));
        }
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
    createIsochrones: function () {
        const pathType = this.model.get("pathType"),
            range = this.model.get("range") * 60,
            coordinatesList = [],
            promiseList = [];

        if (this.model.get("coordinates").length > 0 && pathType !== "" && range !== 0) {
            // group coordinates into groups of 5
            for (let i = 0; i < this.model.get("coordinates").length; i += 5) {
                const arrayItem = this.model.get("coordinates").slice(i, i + 5);

                coordinatesList.push(arrayItem);
            }
            // each group of 5 coordinates
            _.each(coordinatesList, coordinates => {
                promiseList.push(Radio.request("OpenRoute", "requestIsochrones", pathType, coordinates, [range])
                    .then(res => {
                        // reverse JSON object sequence to render the isochrones in the correct order
                        // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
                        const json = JSON.parse(res),
                            reversedFeatures = [...json.features].reverse();

                        json.features = reversedFeatures;
                        return json;
                    }));
            });
            Promise.all(promiseList).then((jsonList) => {
                const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName")),
                    jsonFeatures = jsonList.map(json => json.features),
                    flatFeatures = jsonFeatures.flat();

                let jsonUnion = flatFeatures[0];

                for (let i = 1; i < flatFeatures.length; i++) {
                    jsonUnion = union(jsonUnion, flatFeatures[i]);
                }

                let unionFeature = this.parseDataToFeatures(JSON.stringify(jsonUnion));

                unionFeature = this.transformFeatures(unionFeature, "EPSG:4326", "EPSG:25832");
                this.styleFeatures(unionFeature);

                mapLayer.getSource().clear();
                mapLayer.getSource().addFeatures(unionFeature);
                mapLayer.setVisible(true);
                this.model.set("isochroneFeatures", unionFeature);
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
                    color: "rgba(200 , 3, 3, 0.3)"
                }),
                stroke: new Stroke({
                    color: "white",
                    width: 1
                })
            }));
        }
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
    clearInput: function () {
        this.model.set("coordinates", []);
        this.model.set("pathType", "");
        this.model.set("range", 0);
    },
    // reminds user to select district before using the ageGroup slider
    inputReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Please make sure all input information are provided</strong>",
            kategorie: "alert-warning"
        });
    }
});

export default ServiceCoverageView;
