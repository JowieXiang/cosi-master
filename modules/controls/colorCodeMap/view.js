import template from "text-loader!./template.html";
import LayerList from "./layer/list";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style.js";
import * as Chromatic from "d3-scale-chromatic";

const ColorCodeMapView = Backbone.View.extend({
    events: {
        "change select": function (e) {
            this.setAllColorCodeLayerInvisible();
            const selectedLayer = this.layerList.filter(function (layer) {
                return layer.get("layerName") === e.target.value;
            })[0];

            if (selectedLayer !== undefined) {
                this.showActiveColorCodeLayer(e);
            }
        }
    },
    initialize: function () {
        this.render();
        this.layerList = new LayerList();
        this.setOptions();
        this.style = {
            chromaticScheme: Chromatic.interpolateBlues,
            opacity: 0.8
        };
        this.listenTo(this.layerList, {
            "add": this.createColorCodeLayer
        });
        // this.listenTo(Radio.channel("SelectDistrict"), {
        //     "selectionChanged": function () {
        //         this.setOptions();
        //         this.clearColorLayerFeatures();
        //         this.setColorLayerFeatures();
        //     }
        // });
    },
    template: _.template(template),
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    setOptions: function () {
        const scope = Radio.request("SelectDistrict", "getScope"),
            selectedLayerGroup = this.layerList.filter(layer => layer.get("layerScope") === scope);

        this.$el.find("#color-code-layer-selector").empty();
        this.$el.find("#color-code-layer-selector").append("<option selected value> - clear - </option>");
        _.each(selectedLayerGroup, layer => {
            this.$el.find("#color-code-layer-selector").append(`<option>${layer.get("layerName")}</option>`);
        });
    },
    createColorCodeLayer: function (layerModel) {
        if (Radio.request("Map", "getLayerByName", layerModel.get("layerId") + "_colorcoded") === undefined) {
            const newLayer = Radio.request("Map", "createLayerIfNotExists", layerModel.get("layerId") + "_colorcoded"),
                newSource = new VectorSource();

            newLayer.setSource(newSource);
            newLayer.setVisible(false);
        }
    },
    showActiveColorCodeLayer: function (e) {
        const selectedLayerName = e.target.value,
            selectedLayer = this.layerList.filter(layer => layer.get("layerName") === selectedLayerName)[0],
            activeLayer = Radio.request("Map", "getLayerByName", selectedLayer.get("layerId") + "_colorcoded");

        if (activeLayer !== undefined) {
            activeLayer.setVisible(true);
        }
    },
    setAllColorCodeLayerInvisible: function () {
        this.layerList.forEach(layer => {
            if (Radio.request("Map", "getLayerByName", layer.get("layerId") + "_colorcoded")) {
                const thisLayer = Radio.request("Map", "getLayerByName", layer.get("layerId") + "_colorcoded");

                thisLayer.setVisible(false);
            }
        });
    },
    clearColorLayerFeatures: function () {
        this.layerList.forEach(layer => {
            const colorCodeLayer = Radio.request("Map", "getLayerByName", layer.get("layerId") + "_colorcoded");

            if (colorCodeLayer !== undefined) {
                colorCodeLayer.getSource().clear();
                colorCodeLayer.setVisible(false);
            }
        });
    },
    setColorLayerFeatures: function () {
        const scope = Radio.request("SelectDistrict", "getScope"),
            layerGroup = Radio.request("SelectDistrict", "getDistrictLayer").filter(item => item.name === scope)[0],
            layerIds = layerGroup.layerIds,
            selector = Radio.request("SelectDistrict", "getSelector"),
            districtNames = Radio.request("SelectDistrict", "getSelectedDistricts").map(feature => feature.getProperties()[selector]);

        _.each(layerIds, id => {
            const featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", id),
                selectedFeatures = featureCollection.filter(feature => {
                    return _.contains(districtNames, feature.getProperties()[selector]);
                });

            if (selectedFeatures.length > 0) {
                const colorCodeLayer = Radio.request("Map", "getLayerByName", id + "_colorcoded"),
                    newFeatures = [];

                let field = Radio.request("Parser", "getItemByAttributes", { id: id }).mouseHoverField;

                // eslint-disable-next-line one-var
                const values = selectedFeatures.map((feature) => {
                    const props = feature.getProperties();

                    if (field === "dynamic") {
                        field = Radio.request("Timeline", "getLatestFieldFromProperties", props);
                    }
                    return parseFloat(props[field]);
                }),
                    colorScale = Radio.request("ColorScale", "getColorScaleByValues", values, this.style.chromaticScheme);

                // Add the generated legend style to the Legend Portal
                Radio.trigger("StyleWFS", "addDynamicLegendStyle", id + "_colorcoded", colorScale.legend);

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
        });
    }


});

export default ColorCodeMapView;
