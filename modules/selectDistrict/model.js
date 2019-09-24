import { Fill, Stroke, Style } from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Geometry from 'ol/geom/Geometry';
import Tool from "../core/modelList/tool/model";
import SnippetDropdownModel from "../snippets/dropdown/model";

const SelectDistrict = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedDistricts: [],
        districtLayer: [], // e.g.  {name: "Statistische Gebiete", selector: "statgebiet", layerIds:[]}
        districtLayerNames: [],
        districtLayersLoaded: [],
        scopeDropdownModel: {},
        activeScope: "", // e.g. "Stadtteile" or "Statistische Gebiete"
        activeSelector: "", // e.g. "stadtteil" or "statgebiet"
        deactivateGFI: true,
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
                width: 5
            })
        }),
        channel: Radio.channel("SelectDistrict")
    }),
    initialize: function () {
        this.superInitialize();
        this.set({
            "districtLayerNames": this.get("districtLayer").map(layer => layer.name)
        });
        this.set("scopeDropdownModel", new SnippetDropdownModel({
            name: "Bezugseinheit",
            type: "string",
            displayName: "Bezugseinheit auswählen",
            values: this.get("districtLayerNames"),
            snippetType: "dropdown",
            isMultiple: false,
            preselectedValues: this.get("districtLayerNames")[0]
        }));

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.listen();
                }
                else {
                    if (this.get("selectedDistricts").length > 0) {
                        Radio.trigger("Map", "zoomToExtent", this.getSelectedGeometries().getExtent());
                        const layerlist = _.union(Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}), Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false}));

                        this.setBboxGeometryToLayer(Radio.request("ModelList", "getCollection"), layerlist);
                    }
                    this.get("channel").trigger("selectionChanged");
                    this.unlisten();
                }
            }
        });

        this.listenTo(this.get("scopeDropdownModel"), {
            "valuesChanged": this.setScope
        }, this);

        this.listenTo(Radio.channel("Layer"), "featuresLoaded", function (id) {
            this.checkDistrictLayersLoaded(id);
            this.setScope();
        });

        this.get("channel").reply({
            "getSelectedDistricts": this.getSelectedDistricts,
            "getScope": this.getScope,
            "getSelector": this.getSelector,
            "getScopeAndSelector": this.getScopeAndSelector,
            "getDistrictLayer": this.getDistrictLayer
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
        const districtLayer = Radio.request("ModelList", "getModelByAttributes", { "name": this.getScope() }),
            features = Radio.request("Map", "getFeaturesAtPixel", evt.map.getEventPixel(evt.originalEvent), {
                layerFilter: function (layer) {
                    return layer.get("name") === districtLayer.get("name");
                },
                hitTolerance: districtLayer.get("hitTolerance")
            }),
            isFeatureSelected = this.getSelectedDistricts().find(function (feature) {
                return feature.getId() === features[0].getId();
            });

        if (features) {
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

        selectedFeatures.splice(index, 1);
        this.set({
            "selectedDistricts": selectedFeatures
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
        this.get("channel").trigger("districtSelectionChanged", this.getSelectedDistricts());
    },

    /**
     * sets the bbox geometry for all vector layers and updates already loaded layers
     * @param {Backbone.Collection} modelList - the whole model list
     * @param {Object[]} itemList - all available vector layers(WFS)
     * @returns {void}
     */
    setBboxGeometryToLayer: function (modelList, itemList) {
        console.info(modelList);
        console.info(itemList);
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
    setScope: function () {
        const scope = this.get("scopeDropdownModel").getSelectedValues().values[0];

        this.set("activeScope", scope);

        if (scope && scope !== "") {
            this.set("activeSelector", this.get("districtLayer").find(el => el.name === scope).selector);
        }

        this.toggleScopeLayers();
    },
    getScope: function () {
        return this.get("activeScope");
    },
    toggleScopeLayers: function () {
        _.each(this.get("districtLayerNames"), (layerName) => {
            const layer = Radio.request("ModelList", "getModelByAttributes", { "name": layerName });

            if (layerName !== this.getScope()) {
                layer.setIsVisibleInMap(false);
            }
            else {
                layer.setIsVisibleInMap(true);
            }
        });
    },
    checkDistrictLayersLoaded: function (id) {
        const name = Radio.request("ModelList", "getModelByAttributes", { "id": id }).get("name");

        if (this.get("districtLayerNames").includes(name)) {
            if (!this.get("districtLayersLoaded").includes(name)) {
                this.get("districtLayersLoaded").push(name);
            }
        }

        if (_.isEqual(this.get("districtLayerNames"), this.get("districtLayersLoaded"))) {
            this.setScope();
            this.toggleScopeLayers();
        }
    },
    getSelector: function () {
        return this.get("activeSelector");
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
    getSelectedStyle: function () {
        return this.get("selectedStyle");
    },
    getDeselectedStyle: function () {
        return this.get("deselectedStyle");
    },
    getDistrictLayer: function () {
        return this.get("districtLayer");
    }
});

export default SelectDistrict;
