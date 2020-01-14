import {WFS} from "ol/format.js";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const ZoomToGeometry = Backbone.Model.extend(/** @lends ZoomToGeometry.prototype */{
    defaults: {
        layerId: "123456789",
        attribute: "bezirk_name",
        geometries: ["BEZIRK1", "BEZIRK2"],
        isRender: false
    },

    /**
     * @class  ZoomToGeometry
     * @extends Backbone.Model
     * @memberof ZoomToGeometry
     * @constructs
     * @description Zooms to a feature of a wfs. Can be used via the parametricURL call zoomToGeometry.
     * @property {string} layerId="123456789" Id from layer with geometries.
     * @property {string} attribute="bezirk_name" The attribute from the wfs.
     * @property {string[]} geometries="["BEZIRK1","BEZIRK2"]" Geometries to be zoomed on.
     * @property {string} isRender=false todo
     * @listens ZoomToGeometry#RadioTriggerZoomToGeometryZoomToGeometry
     * @listens ZoomToGeometry#RadioTriggerZoomToGeometrySetIsRender
     * @fires Core#RadioRequestParametricURLGetZoomToGeometry
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Core#RadioTriggerMapZoomToExtent
     */
    initialize: function () {
        const channel = Radio.channel("ZoomToGeometry"),
            name = Radio.request("ParametricURL", "getZoomToGeometry");

        channel.on({
            "zoomToGeometry": this.zoomToGeometry,
            "setIsRender": this.setIsRender
        }, this);

        if (name.length > 0) {
            this.zoomToGeometry(name, this.get("layerId"), this.get("attribute"));
        }

        Radio.trigger("Map", "registerListener", "postcompose", this.handlePostCompose, this);
    },

    /**
    * Zooms to a geometry loaded from a WFS.
    * @param {string} name - Name of the feature to zoom to.
    * @param {string} layerId - Id from WFS-layer.
    * @param {string} attribute - The attribute from the wfs.
    * @returns {void}
    **/
    zoomToGeometry: function (name, layerId, attribute) {
        const layerInformation = getLayerWhere({id: layerId});

        this.getGeometryFromWFS(name, attribute, layerInformation);
    },

    /**
     * Fetches the data from WFS.
     * @param {string} name - Name of the feature to zoom to.
     * @param {string} attribute - The attribute from the wfs.
     * @param {object} layerInformation - All information from a layer to be fetched.
     * @returns {void}
     */
    getGeometryFromWFS: function (name, attribute, layerInformation) {
        const url = new URL(layerInformation.url),
            params = {
                "SERVICE": "WFS",
                "VERSION": layerInformation.version,
                "REQUEST": "GetFeature",
                "TYPENAME": layerInformation.featureType
            };

        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        fetch(url)
            .then(response => response.text())
            .then(responseAsString => new window.DOMParser().parseFromString(responseAsString, "text/xml"))
            .then(responseXML => {
                this.zoomToFeature(responseXML, name, attribute);
            })
            .catch(error => {
                console.warn("The fetch of the data failed with the following error message: " + error);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Der parametrisierte Aufruf des Portals ist leider schief gelaufen!</strong> <br>"
                        + "<small>Details: Ein benötigter Dienst antwortet nicht.</small>",
                    kategorie: "alert-warning"
                });
            });
    },

    /**
    * Zooms to the feature loaded by the WFS.
    * @param {object} data - The GML String.
    * @param {string} name - Name of the features.
    * @param {string} attribute - GML attribute that is to be searched for the name.
    * @fires Core#RadioTriggerMapZoomToExtent
    * @returns {void}
    **/
    zoomToFeature: function (data, name, attribute) {
        const foundFeature = this.parseFeatures(data, name, attribute);
        let extent;

        if (foundFeature === undefined) {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Leider konnten die Objekte zu denen gezommt werden soll nicht geladen werden</strong> <br> <small>Details: Kein Objekt gefunden, dessen Attribut \"" + attribute + "\" den Wert \"" + name + "\" einnimmt.</small>",
                kategorie: "alert-warning"
            });
        }
        else {
            extent = this.calcExtent(foundFeature);
            Radio.trigger("Map", "zoomToExtent", extent);
        }
        this.setFeatureGeometry(foundFeature.getGeometry());
    },

    /**
    * Searches a GML string for a specific feature.
    * @param {object} data - The GML String.
    * @param {string} name - Name of the features.
    * @param {string} attribute - GML attribute that is to be searched for the name.
    * @returns {boolean | ol/feature} The WFS feature.
    **/
    parseFeatures: function (data, name, attribute) {
        const format = new WFS(),
            features = format.readFeatures(data),
            foundFeature = features.filter(function (feature) {

                if (!feature.getKeys().includes(attribute)) {
                    return false;
                }
                return feature.get(attribute).toUpperCase().trim() === name.toUpperCase().trim();
            });

        return foundFeature[0];
    },

    /**
     * Calculates the extent on the basis of a transferred feature.
     * With a multipolygon, the largest extent is taken.
     * @param {ol/feature} feature - Feature with one extension.
     * @returns {number[]} The extent to be zoom.
     */
    calcExtent: function (feature) {
        let coordLength = 0,
            polygonIndex = 0;

        feature.getGeometry().getPolygons().forEach(function (polygon, index) {
            if (polygon.getCoordinates()[0].length > coordLength) {
                coordLength = polygon.getCoordinates()[0].length;
                polygonIndex = index;
            }
        });

        return feature.getGeometry().getPolygon(polygonIndex).getExtent();
    },

    /**
     * todo
     * @param {*} evt - todo
     * @returns {void}
     */
    handlePostCompose: function (evt) {
        const canvas = evt.context,
            map = evt.target;

        if (this.get("isRender") === true && this.get("featureGeometry") !== undefined) {
            canvas.beginPath();
            this.drawOutsidePolygon(canvas, map.getSize());
            this.drawInsidePolygon(canvas, map);
            canvas.fillStyle = "rgba(0, 0, 0, 0.4)";
            canvas.fill();
            canvas.restore();
        }
    },

    /**
     * todo
     * @param {*} canvas - todo
     * @param {*} size - todo
     * @returns {void}
     */
    drawOutsidePolygon: function (canvas, size) {
        const height = size[1] * DEVICE_PIXEL_RATIO,
            width = size[0] * DEVICE_PIXEL_RATIO;

        canvas.moveTo(0, 0);
        canvas.lineTo(width, 0);
        canvas.lineTo(width, height);
        canvas.lineTo(0, height);
        canvas.lineTo(0, 0);
        canvas.closePath();
    },

    /**
     * Todo
     * For it to be recognized as an inner polygon, it must be drawn counterclockwise.
     * @param {*} canvas - todo
     * @param {ol/map} map - The map.
     * @returns {void}
     */
    drawInsidePolygon: function (canvas, map) {
        this.get("featureGeometry").getPolygons().forEach(polygon => {
            const coordinates = polygon.getCoordinates()[0].reverse();

            coordinates.forEach(coordinate => {
                const coord = map.getPixelFromCoordinate(coordinate);

                canvas.lineTo(coord[0] * DEVICE_PIXEL_RATIO, coord[1] * DEVICE_PIXEL_RATIO);
            });
            canvas.closePath();
        });
    },

    /**
     * Setter for featureGeometry.
     * @param {number[]} value - Geometry of a feature.
     * @returns {void}
     */
    setFeatureGeometry: function (value) {
        this.set("featureGeometry", value);
    },

    /**
     * Setter for isRender
     * @param {*} value - todo
     * @returns {void}
     */
    setIsRender: function (value) {
        this.set("isRender", value);
    }
});

export default ZoomToGeometry;
