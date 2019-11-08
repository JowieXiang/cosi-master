import ResultTemplate from "text-loader!./resultTemplate.html";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";


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
        var features = Radio.request("SelectDistrict", "getSelectedDistricts"),
            values = [],
            selector = Radio.request("SelectDistrict", "getSelector");

        for (const district in results) {
            values.push(results[district].ratio);
        }

        const colorScale = Radio.request("ColorScale", "getColorScaleByValues", values);

        _.each(features, (feature) => {
            feature.setStyle(new Style({
                fill: new Fill({
                    color: "rgba(255, 255, 255, 0)"
                }),
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
    }
});

export default ResultView;
