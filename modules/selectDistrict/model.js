import {Fill, Stroke, Style} from "ol/style.js";


const SelectDistrict = Backbone.Model.extend({
    defaults: {
        selectedDistricts: [],
        isActive: false,
        districtLayer: Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"})
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
        this.setClickEventKey(Radio.request("Map", "registerListener", "click", this.getVectorGFIParams.bind(this)));
    },

    unlisten: function () {
        Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
    },

    // get the district layer
    getVectorGFIParams: function (evt) {
        var vectorGfiParams = [],
            districtLayer = Radio.request("ModelList", "getModelByAttributes", {"name": "Stadtteile"}),
            features = Radio.request("Map", "getFeaturesAtPixel", evt.map.getEventPixel(evt.originalEvent), {
                layerFilter: function (layer) {
                    return layer.get("name") === districtLayer.get("name");
                },
                hitTolerance: districtLayer.get("hitTolerance")
            });

        // change feature fill color
        const style = new Style({
            fill: new Fill({color: "#000"}),
            stroke: new Stroke({color: "#000"})
        });
        features[0].setStyle(style);
        // push selected district to selectedDistricts
        this.pushSelectedDistrict(features[0]);
        return vectorGfiParams;
    },

    resetSelectedDistricts: function () {
        _.each(this.get("selectedDistricts"), function (feature) {
            const style = new Style({
                fill: new Fill({color: "#FFFFFF"}),
                stroke: new Stroke({color: "#FFFFFF"})
            });

            feature.setStyle(style);
        });
        this.set("selectedDistricts", []);
    },

    pushSelectedDistrict: function (feature) {
        this.set({
            "selectedDistricts": this.get("selectedDistricts").concat(feature)
        });
    },

    getSelectedDistricts: function () {
        return this.get("selectedDistricts");
    },

    // the clickEventKey is only present in this model
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
