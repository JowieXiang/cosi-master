import {Circle, Fill, Stroke, Style} from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Tool from "../core/modelList/tool/model";

const SelectDistrict = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedDistricts: [],
        districtLayer: Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"}),
        deactivateGFI: true,
    }),
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.listen();
                }
                else {
                    this.unlisten();
                    this.resetSelectedDistricts();
                }
            }
        });
    },

    // listen  to click event and trigger setGfiParams
    listen: function () {
        this.setClickEventKey(Radio.request("Map", "registerListener", "click", this.select.bind(this)));
    },

    unlisten: function () {
        Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
    },

    // select districts on click
    select: function (evt) {
        // check if layer is visible
        const visibleWFSLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"});

        if (visibleWFSLayers.includes(districtLayer)) {
            const features = Radio.request("Map", "getFeaturesAtPixel", evt.map.getEventPixel(evt.originalEvent), {
                    layerFilter: function (layer) {
                        return layer.get("name") === districtLayer.get("name");
                    },
                    hitTolerance: districtLayer.get("hitTolerance")
                }),
                style = new Style({
                    fill: new Fill({color: "rgba(255,255,255,0.8)"})
                });

            // change feature fill color
            features[0].setStyle(style);

            // push selected district to selectedDistricts
            this.pushSelectedDistrict(features[0]);
            features[0].setStyle(style);
            this.setBboxGeometryToLayer(Radio.request("ModelList", "getModelsByAttributes", {typ: "WFS"}));
        }
    },

    pushSelectedDistrict: function (feature) {
        this.set({
            "selectedDistricts": this.get("selectedDistricts").concat(feature)
        });
    },

    resetSelectedDistricts: function () {
        _.each(this.get("selectedDistricts"), function (feature) {
            // default ol style http://geoadmin.github.io/ol3/apidoc/ol.style.html
            const fill = new Fill({
                    color: "rgba(255,255,255,0.4)"
                }),
                stroke = new Stroke({
                    color: "#3399CC",
                    width: 1.25
                }),
                styles = [
                    new Style({
                        image: new Circle({
                            fill: fill,
                            stroke: stroke,
                            radius: 5
                        }),
                        fill: fill,
                        stroke: stroke
                    })
                ];

            feature.setStyle(styles);
        });
        this.set("selectedDistricts", []);
    },

    getSelectedDistricts: function () {
        return this.get("selectedDistricts");
    },

    setClickEventKey: function (value) {
        this.set("clickEventKey", value);
    },

    getIsActive: function () {
        return this.get("isActive");
    },

    toggleIsActive: function () {
        const newState = !this.getIsActive();

        this.set("isActive", newState);
        if (!this.get("isActive")) {
            this.resetSelectedDistricts();
        }
    },

    /**
     * sets the bbox geometry for all vector layers
     * @param {Backbone.Model[]} vectorLayerList - all available vector layers
     * @returns {void}
     */
    setBboxGeometryToLayer: function (vectorLayerList) {
        vectorLayerList.forEach(function (layer) {
            layer.set("bboxGeometry", this.getSelectedGeometries());
        }, this);
    },

    /**
     * returns all selected geometries
     * @returns {ol.geom.GeometryCollection} an array of ol.geom.Geometry objects
     */
    getSelectedGeometries: function () {
        const geometries = [];

        this.get("selectedDistricts").forEach(function (feature) {
            geometries.push(feature.getGeometry());
        });

        return new GeometryCollection(geometries);
    }
});

export default SelectDistrict;
