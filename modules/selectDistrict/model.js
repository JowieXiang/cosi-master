import { Circle, Fill, Stroke, Style } from "ol/style.js";


const SelectDistrict = Backbone.Model.extend({
    defaults: {
        selectedDistricts: [],
        isActive: false,
        districtLayer: Radio.request("ModelList", "getModelByAttributes", { "name": "Stadtteile" })
    },
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                // on map ready
            }
        }, this);
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.listen();
                }
                else {
                    this.unlisten();
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
        let visibleWFSLayers = Radio.request("ModelList", "getModelsByAttributes", { isVisibleInMap: true, typ: "WFS" });
        let districtLayer = Radio.request("ModelList", "getModelByAttributes", { "name": "Stadtteile" });
        if (visibleWFSLayers.includes(districtLayer)) {
            var features = Radio.request("Map", "getFeaturesAtPixel", evt.map.getEventPixel(evt.originalEvent), {
                    layerFilter: function (layer) {
                        return layer.get("name") === districtLayer.get("name");
                    },
                    hitTolerance: districtLayer.get("hitTolerance")
                });
            console.log()
            // change feature fill color
            const style = new Style({
                fill: new Fill({ color: "rgba(255,255,255,0.8)" })
            });
            features[0].setStyle(style);
            // push selected district to selectedDistricts
            this.pushSelectedDistrict(features[0]);
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
    }
});

export default SelectDistrict;
