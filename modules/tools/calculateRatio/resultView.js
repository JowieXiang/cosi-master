import ResultTemplate from "text-loader!./resultTemplate.html";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import ExportButtonView from "../../snippets/exportButton/view";


const ResultView = Backbone.View.extend({
    model: {},
    template: _.template(ResultTemplate),
    textStyle: new Style({}),
    render: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        const attr = this.model.toJSON(),
            results = this.model.getResults();

        this.$el.html(this.template(attr));
        this.$el.find("#export-button").append(this.exportButtonView.render().el);

        if (results !== {}) {
            this.createTextLabels(results);
        }

        return this;
    },

    /**
     * creates TextLabels on a new ol.layer on the map
     * @param {Object} results - results as "stadtteil": {ratio, facilities, demographics}.
     * @returns {void}
     */
    createTextLabels: function (results) {
        var layer = Radio.request("Map", "createLayerIfNotExists", "ratio_info_layer"),
            source = new VectorSource(),
            features = Radio.request("SelectDistrict", "getSelectedDistricts"),
            values = [],
            selector = Radio.request("SelectDistrict", "getSelector");

        for (const district in results) {
            values.push(results[district].ratio);
        }

        const colorScale = Radio.request("ColorScale", "getColorScaleByValues", values);

        _.each(features, (feature) => {
            feature.setStyle(new Style({
                stroke: new Stroke({
                    color: colorScale.scale(results[feature.getProperties()[selector]].ratio),
                    width: 5
                }),
                text: new Text({
                    font: "16px Calibri,sans-serif",
                    fill: new Fill({
                        color: "#FFF"
                    }),
                    stroke: new Stroke({
                        color: colorScale.scale(results[feature.getProperties()[selector]].ratio),
                        width: 3
                    }),
                    text: results[feature.getProperties()[selector]].ratio.toFixed(2)
                })
            }));
        });
        source.addFeatures(features);
        layer.setSource(source);
        layer.setZIndex(10);
    }
});

export default ResultView;
