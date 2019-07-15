import proj4 from "proj4";
import Tool from "../../core/modelList/tool/model";
import {Circle, Fill, Style, Text} from "ol/style.js";
import {KML} from "ol/format.js";

const ImportTool = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        text: "",
        features: [],
        format: new KML({extractStyles: true}),
        renderToWindow: true,
        glyphicon: "glyphicon-import"
    }),

    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                var drawLayer = Radio.request("Map", "createLayerIfNotExists", "import_draw_layer");

                if (value && this.get("layer") === undefined) {
                    this.set("layer", drawLayer);
                    this.set("source", drawLayer.getSource());
                }
            }
        });
    },

    setText: function (value) {
        this.set("text", value);
    },

    setFeatures: function (value) {
        this.set("features", value);
    },

    setSource: function (value) {
        this.set("source", value);
    },
    setLayer: function (value) {
        this.set("layer", value);
    },
    setFormat: function (value) {
        this.set("format", value);
    },

    importKML: function () {
        this.getFeaturesFromKML();
        this.transformFeatures();
        this.setStyle();
        this.featuresToMap();
        this.emptyInput();

    },
    // nach import:kml input leeren und button-style zurücksetzen
    emptyInput: function () {
        $("#fakebutton").html("Datei auswählen (keine ausgewählt)");
        if (this.get("text") !== "") {
            this.setText("");
            $("#fakebutton").toggleClass("btn-primary");
            $("#btn_import").prop("disabled", true);
        }
    },
    // features von KML (in "text" gespeichert) einlesen
    getFeaturesFromKML: function () {
        var features;

        if (this.get("text") !== "") {
            features = this.get("format").readFeatures(this.get("text"));

            this.setFormat(this.get("format"));
            this.setFeatures(features);
        }
        else {
            Radio.trigger("Alert", "alert", "Bitte wählen Sie zuerst eine KML-Datei zum Importieren aus");
        }
    },

    // Workaround der Styles für Punkte und Text
    setStyle: function () {
        var features = this.get("features"),
            kml = $.parseXML(this.get("text")),
            pointStyleColors = [],
            pointStyleTransparencies = [],
            pointStyleRadiuses = [],
            pointStyleCounter = 0,
            textFonts = [];

        // kml parsen und eigenen pointStyle auf Punkt-Features anwenden
        $(kml).find("Point").each(function (i, point) {
            var placemark = point.parentNode,
                pointStyle,
                color,
                transparency,
                radius,
                textFont;

            if ($(placemark).find("name")[0]) {
                textFont = $(placemark).find("font")[0];
                textFont = this.parseStringBetween(textFont, ">", "<");
                textFonts.push(textFont);
                pointStyleColors.push(undefined);
                pointStyleTransparencies.push(undefined);
                pointStyleRadiuses.push(undefined);
            }
            // kein Text
            else {
                pointStyle = $(placemark).find("pointstyle")[0];
                color = $(pointStyle).find("color")[0];
                transparency = $(pointStyle).find("transparency")[0];
                radius = $(pointStyle).find("radius")[0];

                // rgb in array schreiben
                color = this.parseStringBetween(color, ">", "<");
                pointStyleColors.push(color);
                // transparenz in array schreiben
                transparency = this.parseStringBetween(transparency, ">", "<");
                pointStyleTransparencies.push(transparency);
                // punktradius in array schreiben
                radius = this.parseStringBetween(radius, ">", "<");
                radius = parseInt(radius, 10);
                pointStyleRadiuses.push(radius);
                textFonts.push(undefined);
            }
        }.bind(this));

        _.each(features, function (feature) {
            var type = feature.getGeometry().getType(),
                featureStyleFunction = feature.getStyleFunction(),
                styles = featureStyleFunction(feature),
                style = styles[0];

            // wenn Punkt-Geometrie
            if (type === "Point") {
                // wenn Text
                if (feature.get("name") !== undefined) {
                    feature.setStyle(this.getTextStyle(feature.get("name"), style, textFonts[pointStyleCounter]));
                }
                // wenn Punkt
                else {
                    style = new Style({
                        image: new Circle({
                            radius: pointStyleRadiuses[pointStyleCounter],
                            fill: new Fill({
                                color: "rgba(" + pointStyleColors[pointStyleCounter] + ", " + pointStyleTransparencies[pointStyleCounter] + ")"
                            })
                        })
                    });

                    feature.setStyle(style);
                }
                pointStyleCounter++;
            }
        }, this);


    },
    parseStringBetween: function (string, startChar, endChar) {
        var parsedString = "";

        parsedString = new XMLSerializer().serializeToString(string);
        parsedString = parsedString.split(startChar)[1].split(endChar)[0];
        return parsedString;
    },

    getTextStyle: function (name, style, font) {
        return new Style({
            text: new Text({
                text: name,
                textAlign: "left",
                font: font,
                fill: style.getText().getFill(),
                scale: style.getText().getScale()
            })
        });
    },

    // Koordinatentransformation
    transformFeatures: function () {
        var features = this.get("features");

        _.each(features, function (feature) {
            var transCoord = this.transformCoords(feature.getGeometry(), this.getProjections("EPSG:4326", "EPSG:25832"));

            feature.getGeometry().setCoordinates(transCoord, "XY");
        }, this);
        this.setFeatures(features);
    },

    getProjections: function (sourceProj, destProj) {
        //            proj4.defs(sourceProj, "+proj=utm +zone=" + zone + "ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");

        return {
            sourceProj: proj4(sourceProj),
            destProj: proj4(destProj)
        };
    },
    transformCoords: function (geometry, projections) {
        var transCoord = [];

        switch (geometry.getType()) {
            case "Polygon": {
                transCoord = this.transformPolygon(geometry.getCoordinates(), projections, this);
                break;
            }
            case "Point": {
                transCoord = this.transformPoint(geometry.getCoordinates(), projections);
                break;
            }
            case "LineString": {
                transCoord = this.transformLine(geometry.getCoordinates(), projections, this);
                break;
            }
            default: {
                Radio.trigger("Alert", "alert", "Unbekannte Geometry: <br><strong>" + geometry.getType());
            }
        }
        return transCoord;
    },
    transformPolygon: function (coords, projections, context) {
        var transCoord = [];

        // multiple Points
        _.each(coords, function (points) {
            _.each(points, function (point) {
                transCoord.push(context.transformPoint(point, projections));
            });
        }, this);
        return [transCoord];
    },
    transformLine: function (coords, projections, context) {
        var transCoord = [];

        // multiple Points
        _.each(coords, function (point) {
            transCoord.push(context.transformPoint(point, projections));
        }, this);
        return transCoord;
    },
    transformPoint: function (point, projections) {
        point.pop();
        return proj4(projections.sourceProj, projections.destProj, point);
    },
    // Features in die Karte laden
    featuresToMap: function () {
        var features = this.get("features"),
            source = this.get("source");

        source.addFeatures(features);
    }

});

export default ImportTool;
