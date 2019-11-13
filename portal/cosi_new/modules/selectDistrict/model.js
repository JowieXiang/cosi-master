import {Fill, Stroke, Style} from "ol/style.js";
import GeometryCollection from "ol/geom/GeometryCollection";
import Tool from "../../../../modules/core/modelList/tool/model";
import SnippetDropdownModel from "../../../../modules/snippets/dropdown/model";
import * as Extent from "ol/extent";
import * as Polygon from "ol/geom/Polygon";

const SelectDistrict = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        id: "selectDistrict",
        selectedDistricts: [],
        districtLayer: [], // e.g.  {name: "Statistische Gebiete", selector: "statgebiet", layerIds:[]}
        districtLayerNames: ["Statistische Gebiete", "Stadtteile"],
        districtLayerIds: ["6071", "1694"],
        districtLayersLoaded: [],
        buffer: 500,
        isReady: false,
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
        channel: Radio.channel("SelectDistrict"),
        bboxGeometry: null
    }),
    initialize: function () {
        this.superInitialize();
        this.getUrlQuery();
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
                    this.getScopeFromDropdown();
                }
                else {
                    if (this.get("selectedDistricts").length > 0) {
                        let bboxGeometry;

                        if (this.getBuffer() > 0) {
                            bboxGeometry = new GeometryCollection(this.getSelectedGeometries()
                                .getGeometries()
                                .map(geom => {
                                    return Polygon.fromExtent(Extent.buffer(geom.getExtent(), this.getBuffer()));
                                }));
                        }
                        else {
                            bboxGeometry = this.getSelectedGeometries();
                        }

                        this.set("bboxGeometry", bboxGeometry);
                        this.setBboxGeometry(bboxGeometry);

                        // set map view to bbox
                        Radio.trigger("Map", "zoomToExtent", this.getSelectedGeometries().getExtent());
                        // triggers "selectionChanged"
                        this.get("channel").trigger("selectionChanged", this.getSelectedGeometries().getExtent().toString(), this.get("activeScope"), this.getSelectedDistrictNames(this.get("selectedDistricts")));
                        Radio.trigger("Map", "zoomToExtent", this.getSelectedGeometries().getExtent());
                    }
                    else {
                        this.set("bboxGeometry", null);
                    }
                    this.unlisten();
                }
            }
        });

        this.listenTo(this.get("scopeDropdownModel"), {
            "valuesChanged": this.getScopeFromDropdown
        }, this);

        this.listenTo(Radio.channel("Layer"), "featuresLoaded", function (id) {
            if (!this.get("isReady")) {
                this.checkDistrictLayersLoaded(id);
                // console.info("featuresLoaded");
                // this.getScopeFromDropdown();
            }
        });

        this.get("channel").reply({
            "getSelectedDistricts": this.getSelectedDistricts,
            "getScope": this.getScope,
            "getSelector": this.getSelector,
            "getScopeAndSelector": this.getScopeAndSelector,
            "getDistrictLayer": this.getDistrictLayer,
            "getBuffer": this.getBuffer,
            "setSelectedDistrictsToFeatures": this.setSelectedDistrictsToFeatures
        }, this);

        this.get("channel").on({
            "zoomToDistrict": this.zoomAndHighlightFeature,
            "revertBboxGeometry": this.revertBboxGeometry
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
        const districtLayer = Radio.request("ModelList", "getModelByAttributes", {"name": this.getScope()}),
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
    setFeaturesByScopeAndIds (scope, ids, buffer) {
        this.setBuffer(buffer);
        this.setScope(scope);
        const layer = Radio.request("ModelList", "getModelByAttributes", {name: scope}),
            features = layer.get("layerSource").getFeatures().filter(feature => ids.includes(feature.getProperties()[this.getSelector()]));

        if (features && features.length !== 0) {
            this.set("selectedDistricts", features);
            features.forEach(function (feature) {
                feature.setStyle(this.get("selectedStyle"));
            }, this);
            this.toggleIsActive();
        }
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
        this.get("channel").trigger("reset");
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
        this.get("channel").trigger("selectionChanged", this.getSelectedDistricts());
    },


    getScopeFromDropdown: function () {
        const scope = this.get("scopeDropdownModel").getSelectedValues().values[0];

        if (this.get("isActive")) {
            this.setScope(scope);
        }
    },
    setScope: function (scope) {
        this.set("activeScope", scope);
        if (scope && scope !== "" && this.get("districtLayer").length !== 0) {
            this.set("activeSelector", this.get("districtLayer").find(el => el.name === scope).selector);
        }
        this.toggleScopeLayers();
    },
    getScope: function () {
        return this.get("activeScope");
    },
    toggleScopeLayers: function () {
        _.each(this.get("districtLayerNames"), (layerName) => {
            const layer = Radio.request("ModelList", "getModelByAttributes", {"name": layerName});

            if (layerName !== this.getScope()) {
                layer.setIsVisibleInMap(false);
            }
            else {
                layer.setIsVisibleInMap(true);
            }
        });
    },
    checkDistrictLayersLoaded: function (id) {
        const name = Radio.request("ModelList", "getModelByAttributes", {"id": id}).get("name");

        if (this.get("districtLayerNames").includes(name)) {
            if (!this.get("districtLayersLoaded").includes(name)) {
                this.get("districtLayersLoaded").push(name);
            }
        }

        if (_.isEqual(this.get("districtLayerNames").sort(), this.get("districtLayersLoaded").sort())) {
            this.setIsActive(true);
            this.set("isReady", true);

            if (this.get("urlQuery")) {
                this.setFeaturesByScopeAndIds(...this.get("urlQuery"));
                this.getScopeFromDropdown();
            }
        }
    },
    zoomAndHighlightFeature: async function (districtName, onlySelected = true) {
        let districts = this.getSelectedDistricts(),
            extent;

        if (!onlySelected) {
            const getLayerSource = Promise.resolve(Radio.request("ModelList", "getModelByAttributes", {"name": this.getScope()}).get("layerSource")),
                layerSource = await getLayerSource;

            districts = layerSource.getFeatures();
        }

        _.each(districts, (feature) => {
            if (feature.getProperties()[this.getSelector()] === districtName) {
                extent = feature.getGeometry().getExtent();
            }
        });
        if (extent) {
            Radio.trigger("Map", "zoomToExtent", extent, {padding: [20, 20, 20, 20]});
        }
    },
    getSelector: function () {
        return this.get("activeSelector");
    },
    getScopeAndSelector: function () {
        return {
            scope: this.getScope(),
            selector: this.getSelector()
        };
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

    /**
     * returns the names of the districts
     * @param {ol.Feature[]} districts - the selected districts
     * @returns {string[]} names - a list of the names of the selected districts
     */
    getSelectedDistrictNames: function (districts) {
        var names = [];

        districts.forEach(function (district) {
            if (district.get("statgebiet")) {
                names.push(district.get("statgebiet"));
            }
            else {
                names.push(district.get("stadtteil"));
            }
        });
        return names;
    },

    setBuffer: function (val) {
        this.set("buffer", val);
    },
    getBuffer: function () {
        return this.get("buffer");
    },
    getSelectedStyle: function () {
        return this.get("selectedStyle");
    },
    getDeselectedStyle: function () {
        return this.get("deselectedStyle");
    },
    getDistrictLayer: function () {
        return this.get("districtLayer");
    },
    getUrlQuery () {
        const query = window.location.search.split("&").filter(q => q.includes("scope") || q.includes("selectedDistricts") || q.includes("buffer"));

        if (query.length > 0) {
            this.set("urlQuery", [
                query[0].substring(query[0].indexOf("=") + 1).replace("%20", " "),
                query[1].substring(query[1].indexOf("=") + 1).split(","),
                query[2].substring(query[1].indexOf("=") + 1)
            ]);
        }
    },
    setBboxGeometry: function (bboxGeometry) {
        const layerlist = _.union(Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}), Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false}));

        Radio.trigger("BboxSettor", "setBboxGeometryToLayer", layerlist, bboxGeometry);
    },
    /**
     * revert bboxGeometry back to previous state (this function is used by Reachability)
     *
     */
    revertBboxGeometry: function () {
        if (this.get("bboxGeometry")) {
            this.setBboxGeometry(this.get("bboxGeometry"));
        }
    },
    setSelectedDistrictsToFeatures: function (features) {
        const that = this;

        this.resetSelectedDistricts();
        this.set("selectedDistricts", features);
        _.each(features, feature => {
            feature.setStyle(that.get("selectedStyle"));
        });

        // reset bboxGeometry
        const bboxGeometry = Polygon.fromExtent(Extent.buffer(this.getSelectedGeometries().getExtent(), this.getBuffer()));

        this.set("bboxGeometry", bboxGeometry);
        this.setBboxGeometry(bboxGeometry);
        this.get("channel").trigger("selectionChanged", features);

    }
});

export default SelectDistrict;
