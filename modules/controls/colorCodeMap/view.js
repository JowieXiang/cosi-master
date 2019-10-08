import template from "text-loader!./template.html";
import LayerList from "./layer/list";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";
import * as Chromatic from "d3-scale-chromatic";

const ColorCodeMapView = Backbone.View.extend({
    events: {
        "change select": function (e) {
            this.onSelect(e);
        }
    },
    initialize: function () {
        this.createColorCodeLayer();
        this.render();
        this.layerList = new LayerList();
        this.style = {
            chromaticScheme: Chromatic.interpolateBlues,
            opacity: 0.8
        };
        this.listenTo(Radio.channel("ColorCodeMap"), {
            "districtsLoaded": function () {
                this.setOptions();
            }
        });
    },
    template: _.template(template),
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    onSelect: function (e) {
        const selectedLayer = this.layerList.filter(function (layer) {
            return layer.get("layerName").trim() === e.target.value.trim();
        })[0];

        if (selectedLayer !== undefined) {
            this.clearColorLayerFeatures();
            this.setColorLayerFeatures(selectedLayer);
            this.showColorCodeLayer();
        }
        else {
            this.hideColorCodeLayer();
            this.clearColorLayerFeatures();
        }
        this.$el.find("#color-code-layer-selector").selectpicker("refresh");

    },
    setOptions: function () {
        const select = this.$el.find("#color-code-layer-selector");

        select.empty().append("<option> - clear - </option>");
        this.layerList.forEach(layer => {
            select.append(`<option>${layer.get("layerName")}</option>`);
        });
        select.selectpicker("refresh");
    },
    createColorCodeLayer: function () {
        if (Radio.request("Map", "getLayerByName", "colorCode") === undefined) {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", "colorCode"),
                newSource = new VectorSource();

            newLayer.setSource(newSource);
            newLayer.setVisible(false);
        }
    },
    showColorCodeLayer: function () {
        const colorCodeLayer = Radio.request("Map", "getLayerByName", "colorCode");

        if (colorCodeLayer !== undefined) {
            colorCodeLayer.setVisible(true);
        }
    },
    hideColorCodeLayer: function () {
        if (Radio.request("Map", "getLayerByName", "colorCode")) {
            const colorCodeLayer = Radio.request("Map", "getLayerByName", "colorCode");

            colorCodeLayer.setVisible(false);
        }
    },
    clearColorLayerFeatures: function () {
        const colorCodeLayer = Radio.request("Map", "getLayerByName", "colorCode");

        if (colorCodeLayer !== undefined) {
            colorCodeLayer.getSource().clear();
        }
    },
    setColorLayerFeatures: function (selectedLayer) {
        const layerId = selectedLayer.get("layerId"),
            selector = Radio.request("SelectDistrict", "getSelector") === "statgebiet" ? "stat_gebiet" : Radio.request("SelectDistrict", "getSelector"),
            districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties()[selector]),
            featureCollection = Radio.request("FeaturesLoader", "getAllFeaturesByAttribute", { id: layerId }),
            selectedFeatures = featureCollection.filter(feature => {
                return _.contains(districtNames, feature.getProperties()[selector]);
            });

        if (selectedFeatures.length > 0) {
            const colorCodeLayer = Radio.request("Map", "getLayerByName", "colorCode"),
                newFeatures = [],
                field = "jahr_2018",
                values = selectedFeatures.map(feature => feature.getProperties()[field]),
                colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, this.style.chromaticScheme);

            // Add the generated legend style to the Legend Portal
            Radio.trigger("StyleWFS", "addDynamicLegendStyle", "colorCode", colorScale.legend);

            _.each(selectedFeatures, feature => newFeatures.push(feature.clone()));
            _.each(newFeatures, (feature) => {
                feature.setStyle(new Style({
                    fill: new Fill({
                        color: colorScale.scale(parseFloat(feature.getProperties()[field]))
                    }),
                    stroke: new Stroke({
                        color: colorScale.scale(parseFloat(feature.getProperties()[field])),
                        width: 3
                    })
                }));
            });
            colorCodeLayer.getSource().addFeatures(newFeatures);
            colorCodeLayer.setOpacity(this.style.opacity);
        }
    }


});

export default ColorCodeMapView;
