import {Fill, Stroke, Style} from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Tool from "../core/modelList/tool/model";

const SelectDistrict = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedDistricts: [],
        districtLayer: Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"}),
        deactivateGFI: true,
        // default ol style http://geoadmin.github.io/ol3/apidoc/ol.style.html
        defaultStyle: new Style({
            fill: new Fill({
                color: "rgba(255, 255, 255, 0.4)"
            }),
            stroke: new Stroke({
                color: "#3399CC",
                width: 1.25
            })
        }),
        selectedStyle: new Style({
            fill: new Fill({
                color: "rgba(255, 255, 255, 0)"
            }),
            stroke: new Stroke({
                color: "#3399CC",
                width: 3
            })
        }),
        channel: Radio.channel("SelectDistrict")
    }),
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.listen();
                }
                else {
                    if (this.get("selectedDistricts").length > 0) {
                        Radio.trigger("Map", "zoomToExtent", this.getSelectedGeometries().getExtent());
                        this.setBboxGeometryToLayer(Radio.request("ModelList", "getCollection"), Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}));
                    }
                    this.unlisten();
                }
            }
        });

        this.get("channel").reply({
            "getSelectedDistricts": this.getSelectedDistricts
        }, this);
    },

    // listen  to click event and trigger setGfiParams
    listen: function () {
        this.resetSelectedDistricts();
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
                isFeatureSelected = this.getSelectedDistricts().find(function (feature) {
                    return feature.getId() === features[0].getId();
                });

            // if already selected remove district from selectedDistricts
            if (isFeatureSelected) {
                this.removeSelectedDistrict(features[0], this.getSelectedDistricts());
                features[0].setStyle(this.get("defaultStyle"));
            }
            // push selected district to selectedDistricts
            else {
                this.pushSelectedDistrict(features[0]);
                features[0].setStyle(this.get("selectedStyle"));
            }
        }
    },
    pushSelectedDistrict: function (feature) {
        this.set({
            "selectedDistricts": this.get("selectedDistricts").concat(feature)
        });
    },

    /**
     * removes a district from the selected district list
     * @param {ol.Feature} feature - selected district
     * @param {ol.Feature[]} selectedFeatures - all selected districts
     * @returns {void}
     */
    removeSelectedDistrict: function (feature, selectedFeatures) {
        const index = selectedFeatures.indexOf(feature);

        this.set({
            "selectedDistricts": selectedFeatures.splice(index, 1)
        });
    },

    resetSelectedDistricts: function () {
        _.each(this.get("selectedDistricts"), function (feature) {
            feature.setStyle(this.get("defaultStyle"));
        }, this);
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
        this.set("isActive", !this.getIsActive());
    },

    /**
     * sets the bbox geometry for all vector layers and updates already loaded layers
     * @param {Backbone.Collection} modelList - the whole model list
     * @param {Object[]} itemList - all available vector layers(WFS)
     * @returns {void}
     */
    setBboxGeometryToLayer: function (modelList, itemList) {
        itemList.forEach(function (item) {
            const model = modelList.get(item.id);

            // layer already exists in the model list
            if (model) {
                model.set("bboxGeometry", this.getSelectedGeometries());
                // updates layers that have already been loaded
                if (model.has("layer") && model.get("layer").getSource().getFeatures().length > 0) {
                    model.updateSource();
                }
            }
            // for layers that are not yet in the model list
            else {
                item.bboxGeometry = this.getSelectedGeometries();
            }
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
    },
    getSelectedStyle () {
        return this.get("selectedStyle");
    },
    getDeselectedStyle () {
        return this.get("deselectedStyle");
    }
});

export default SelectDistrict;
