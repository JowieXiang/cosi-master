import ResultTemplate from "text-loader!./resultTemplate.html";
import {Fill, Stroke, Style, Text} from "ol/style.js";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";


const ResultView = Backbone.View.extend({
    events: {
        "click #push-dashboard": "pushToDashboard"
    },
    model: {},
    template: _.template(ResultTemplate),
    textStyle: new Style({}),
    render: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        const attr = this.model.toJSON(),
            results = this.model.getResults();

        attr.isModified = this.model.get("adjustParameterView").model.get("isModified");

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

        Radio.trigger("ColorCodeMap", "reset");

        for (const district in results) {
            values.push(results[district].coverage);
        }

        const colorScale = Radio.request("ColorScale", "getColorScaleByValues", values);

        _.each(features, (feature) => {
            feature.setStyle(new Style({
                fill: new Fill({
                    color: colorScale.scale(results[feature.getProperties()[selector]].coverage).replace("rgb", "rgba").replace(")", ", 0.8)")
                }),
                stroke: new Stroke({
                    color: colorScale.scale(results[feature.getProperties()[selector]].coverage),
                    width: 3
                }),
                text: new Text({
                    font: "16px Calibri,sans-serif",
                    fill: new Fill({
                        color: "#FFF"
                    }),
                    stroke: new Stroke({
                        color: "#000",
                        width: 2
                    }),
                    text: results[feature.getProperties()[selector]].coverage.toFixed(2)
                })
            }));
        });
    },
    pushToDashboard: function () {
        this.$el.find("#push-dashboard-button").empty();
        Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
            name: `Angebotsdeckung: ${this.model.getNumerators().join(", ")} : ${this.model.getDenominators().join(", ")}`,
            glyphicon: "glyphicon-tasks",
            width: "full",
            scalable: true
        });
    }
});

export default ResultView;