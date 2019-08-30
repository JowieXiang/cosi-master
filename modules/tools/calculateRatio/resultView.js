import ResultTemplate from "text-loader!./resultTemplate.html";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style, Text} from "ol/style.js";


const ResultView = Backbone.View.extend({
    model: {},
    template: _.template(ResultTemplate),
    textStyle: new Style({

    }),
    render: function () {
        const attr = this.model.toJSON(),
            results = this.model.getResults();
        let currentResult;

        this.$el.html(this.template(attr));

        if (results !== {}) {
            for (const district in results) {
                currentResult = `<tr><th>${district}</th><td>${(1000 * results[district]).toFixed(2)}</td></tr>`;
                this.$el.find(".table").append(currentResult);
            }

            this.createTextLabels(results);
        }

        return this;
    },

    /**
     * creates TextLabels on a new ol.layer on the map
     * @param {Object} results - results as "stadtteil": value pairs.
     * @returns {void}
     */
    createTextLabels: function (results) {
        var layer = Radio.request("Map", "createLayerIfNotExists", "ratio_info_layer"),
            source = new VectorSource(),
            features = Radio.request("SelectDistrict", "getSelectedDistricts"),
            colorScale = Radio.request("ColorScale", "getColorScaleByValues", _.values(results));

        _.each(features, (feature) => {
            feature.setStyle(new Style({
                text: new Text({
                    font: "16px Calibri,sans-serif",
                    fill: new Fill({
                        color: "#FFF"
                    }),
                    stroke: new Stroke({
                        color: colorScale(results[feature.getProperties().stadtteil]),
                        width: 3
                    }),
                    text: (1000 * results[feature.getProperties().stadtteil]).toFixed(2)
                })
            }));
        });
        source.addFeatures(features);
        layer.setSource(source);
    }
});

export default ResultView;