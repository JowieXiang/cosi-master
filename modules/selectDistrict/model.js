import {Circle, Fill, Stroke, Style} from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Tool from "../core/modelList/tool/model";

const SelectDistrict = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedDistricts: [],
        districtLayer: Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"}),
        deactivateGFI: true,
        channel: Radio.channel("SelectDistrict"),
        selectedStyle: new Style({
            fill: new Fill({color: "rgba(255,255,255,0)"}),
            stroke: new Stroke({
                color: "#3399CC",
                width: 3
            })
        }),
        deselectedStyle: new Style({
            fill: new Fill({
                color: "rgba(255,255,255,0.4)"
            }),
            stroke: new Stroke({
                color: "#3399CC",
                width: 1.25
            })
        })
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
                    // this.resetSelectedDistricts(); // We want to store the selected districts so that we can reuse the selection or modify it later!
                }
            }
        });

        this.get("channel").reply({
            "getSelectedDistricts": this.getSelectedDistricts
        }, this);
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
            });

            // check if any feature was selected at pixel
            if (features) {
                // check if the feature is already in the list, then deselect
                if (this.getSelectedDistricts().includes(features[0])) {
                    // change feature style
                    features[0].setStyle(this.getDeselectedStyle());

                    // remove selected district from selectedDistricts
                    this.removeSelectedDistrict(features[0]);
                }
                else {
                    // change feature style
                    features[0].setStyle(this.getSelectedStyle());

                    // push selected district to selectedDistricts
                    this.pushSelectedDistrict(features[0]);
                }
            }
        }
    },
    removeSelectedDistrict: function (feature) {
        this.set({
            "selectedDistricts": this.get("selectedDistricts").filter((featureInArray) => {
                return featureInArray !== feature;
            })
        });
    },
    pushSelectedDistrict: function (feature) {
        this.set({
            "selectedDistricts": this.get("selectedDistricts").concat(feature)
        });
    },

    resetSelectedDistricts: function () {
        _.each(this.get("selectedDistricts"), function (feature) {
            // default ol style http://geoadmin.github.io/ol3/apidoc/ol.style.html
            feature.setStyle(this.getDeselectedStyle());
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
        }, this)
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
