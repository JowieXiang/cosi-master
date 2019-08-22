import { Select, Modify, Draw } from "ol/interaction.js";
import {  Fill, Stroke, Style } from "ol/style.js";
import { GeoJSON } from "ol/format.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiLine from "ol/geom/MultiLineString.js";
import { fromCircle as circPoly } from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import Tool from "../core/modelList/tool/model";

const SelectDistrict = Backbone.Model.extend({
    defaults: {
        selectedDistricts: [],
        isActive: false
    },
    initialize: function () {
        console.log("initialized!!!!");
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {

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
    // set selectedDistricts
    setSelectedDistricts: function (value) {
        this.set("selectedDistricts", value);
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
        var vectorGfiParams = [];
        var districtLayer = Radio.request("ModelList", "getModelByAttributes", { "name": "Stadtteile" });



        var features = Radio.request("Map", "getFeaturesAtPixel", evt.map.getEventPixel(evt.originalEvent), {
            layerFilter: function (layer) {
                return layer.get("name") === districtLayer.get("name");
            },
            hitTolerance: districtLayer.get("hitTolerance")
        });
        // var    modelAttributes = _.pick(districtLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");

        // _.each(features, function (featureAtPixel) {
        //     // Feature
        //     if (_.has(featureAtPixel.getProperties(), "features") === false) {
        //         vectorGfiParams.push(this.prepareVectorGfiParam(modelAttributes, featureAtPixel));
        //     }
        //     // Cluster Feature
        //     else {
        //         _.each(featureAtPixel.get("features"), function (feature) {
        //             vectorGfiParams.push(this.prepareVectorGfiParam(modelAttributes, feature));
        //         }, this);
        //     }
        // }, this);
        
        let style = new Style({
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#000' }),
        });
        features[0].setStyle(style);
        console.log(features[0]);


        return vectorGfiParams;
    },

    // the clickEventKey is only present in this model
    setClickEventKey: function (value) {
        this.set("clickEventKey", value);
    },
    getIsActive: function () {
        return this.get("isActive");
    },
    toggleIsActive: function () {

        let newState = !this.getIsActive();
        this.set("isActive", newState);
    },
});

export default SelectDistrict;
