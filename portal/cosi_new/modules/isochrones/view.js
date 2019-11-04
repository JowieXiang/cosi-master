import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import * as Proj from "ol/proj.js";
import "./style.less";
import { Fill, Stroke, Style } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON";

const IsoChronesView = Backbone.View.extend({
    events: {
        "click #create-isochrones": "createIsochrones",
        "click button#Submit": "checkIfSelected",
        "change #coordinate": "setCoordinateFromInput",
        "focus #coordinate": "registerClickListener",
        "blur #coordinate": "unregisterClickListener",
        "change #path-type": "setPathType",
        "change #range": "setRange"
    },
    initialize: function () {
        this.scopeDropdownView = new SnippetDropdownView({
            model: this.model.get("scopeDropdownModel")
        });

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                this.render(model, value);
                this.createMapLayer("IsoChrones_name");
                this.featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", {
                    id: "12868"
                });
                console.log("this.featureCollection: ", this.featureCollection);
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
        }
        return this;
    },
    createMapLayer: function (name) {
        const newLayer = Radio.request("Map", "createLayerIfNotExists", name);

        newLayer.setVisible(false);
    },
    createIsochrones: function () {
        const openrouteUrl = this.model.get("openrouteUrl"),
            key = this.model.get("key"),
            coordinate = this.model.get("coordinate"),
            pathType = this.model.get("pathType"),
            range = this.model.get("range") * 60;

        if (coordinate.length > 0 && pathType !== "" && range !== 0) {
            this.openRouteRequest(openrouteUrl, key, pathType, coordinate, range).then(res => {
                const mapLayer = Radio.request("Map", "getLayerByName", "IsoChrones_name"),
                    json = JSON.parse(res),
                    reversedFeatures = [...json.features].reverse();

                json.features = reversedFeatures;
                let newFeatures = this.parseDataToFeatures(JSON.stringify(json));

                newFeatures = this.transformFeatures(newFeatures, "EPSG:4326", "EPSG:25832");
                mapLayer.getSource().clear();
                this.styleFeatures(newFeatures);
                mapLayer.getSource().addFeatures(newFeatures.reverse());
                mapLayer.setVisible(true);
            });
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
    openRouteRequest: function (baseUrl, key, pathType, coordinate, range) {
        return new Promise(function (resolve, reject) {
            // const body = '{"locations":[[9.9937,53.5511],[9.9937,53.5511]],"range":[300,200]}',
            const queryBody = `{"locations":[${JSON.stringify(coordinate)}],"range":[${range / 4},${range / 2},${range}]}`,
                url = baseUrl + pathType.trim();
            var xhr = new XMLHttpRequest();

            xhr.open("POST", url);
            xhr.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', key);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(queryBody);
        });
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
    }
});

export default IsoChronesView;
