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
        "change #range": function (e) {
            this.setRange(e);
            this.renderLegend(e);
        },
        "click #help": "showHelp",
        "click #backward": "toModeSelection"
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
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(attr));
        this.renderDropDownView();
        this.renderLegend();
        return this;
    },
    renderDropDownView: function () {
        this.model.setDropDownModel();
        const dropdownView = new SnippetDropdownView({ model: this.model.get("dropDownModel") });

        this.$el.find("#select-layer").html(dropdownView.render().el);
    },
    setFacilityLayers: function (models) {
        const facilityLayerModels = models.filter(model => model.get("isFacility") === true);

        if (facilityLayerModels.length > 0) {
            const facilityNames = facilityLayerModels.map(model => model.get("featureType").trim());

            this.model.set("facilityNames", facilityNames);
        }
        else {
            this.model.set("facilityNames", []);
        }
        this.renderDropDownView();
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
                promiseList.push(Radio.request("OpenRoute", "requestIsochrones", pathType, coordinates, [range, range * 0.67, range * 0.33])
                    .then(res => {
                        // reverse JSON object sequence to render the isochrones in the correct order
                        // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
                        const json = JSON.parse(res),
                            reversedFeatures = [...json.features].reverse(),
                            groupedFeatures = [[], [], []];

                        for (let i = 0; i < reversedFeatures.length; i = i + 3) {
                            groupedFeatures[i % 3].push(reversedFeatures[i]);
                            groupedFeatures[(i + 1) % 3].push(reversedFeatures[i + 1]);
                            groupedFeatures[(i + 2) % 3].push(reversedFeatures[i + 2]);
                        }
                        json.features = reversedFeatures;
                        return groupedFeatures;
                    }));
            });
            Promise.all(promiseList).then((groupedFeaturesList) => {
                const mapLayer = Radio.request("Map", "getLayerByName", this.model.get("mapLayerName"));
                let layerUnion, layerUnionFeatures;

                mapLayer.getSource().clear();
                for (let i = 0; i < 3; i++) {
                    let layeredList = groupedFeaturesList.map(groupedFeatures => groupedFeatures[i]);

                    layeredList = [].concat(...layeredList);
                    layerUnion = layeredList[0];

                    for (let j = 0; j < layeredList.length; j++) {
                        layerUnion = union(layerUnion, layeredList[j]);
                    }
                    layerUnionFeatures = this.parseDataToFeatures(JSON.stringify(layerUnion));

                    layerUnionFeatures = this.transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");
                    this.styleFeatures(layerUnionFeatures);
                    mapLayer.getSource().addFeatures(layerUnionFeatures);

                }

                mapLayer.setVisible(true);
                // this.model.set("isochroneFeatures", unionList);
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
                    color: `rgba(200 , 3, 3, ${0.1 * i + 0.3})`
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
    },
    renderLegend: function () {
        const steps = this.model.get("steps"),
            range = this.model.get("range");

        if (this.model.get("range") > 0) {
            this.$el.find("#legend").empty();
            for (let i = steps - 1; i >= 0; i--) {
                this.$el.find("#legend").append(`
                <svg width="20" height="20">
                    <rect width="20"  height="20" style="fill:rgba(200 , 3, 3, ${0.3 * (i + 1)});stroke-width:.5;stroke:rgb(0,0,0)" />
                </svg>
                <span style="font-size: 20px;">${Number.isInteger(range * ((steps - i) / 3)) ? range * ((steps - i) / 3) : (range * ((steps - i) / 3)).toFixed(2)}  </span>
                `);
            }
        }
        else {
            this.$el.find("#legend").empty();
            for (let i = steps - 1; i >= 0; i--) {
                this.$el.find("#legend").append(`
                <svg width="20" height="20">
                    <circle cx="10" cy="10" r="10" style="fill:rgba(0, 0, 0, 0);stroke-width:.5;stroke:rgb(0,0,0)" />
                </svg>
                <span style="font-size: 20px;">0</span>
                `);
            }
        }
    },
    toModeSelection: function () {
        this.model.set("isActive", false);
        Radio.request("ModelList", "getModelByAttributes", {name: "Erreichbarkeitsanalyse"}).set("isActive", true);
    }
});

export default ServiceCoverageView;
