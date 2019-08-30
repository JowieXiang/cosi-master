import {scaleLinear, scaleSequential} from "d3-scale";
import * as Chromatic from "d3-scale-chromatic";

const ColorScale = Backbone.Model.extend({
    defaults: {},
    /**
     * @class ColorScale
     * @memberOf Tools.ColorScale
     * @constructs
     * @extends Backbone.Model
     * @listens Tools.ColorScale#RadioRequestGetColorScaleByValues
     */
    initialize: function () {
        const channel = Radio.channel("ColorScale");

        channel.reply({
            "getColorScaleByValues": function (values, colorspace, type) {
                return this.generateColorScale(values, colorspace, type);
            }
        }, this);
    },
    generateColorScale (values = [0, 1], colorspace = ["blue", "red"], type = "sequential") {
        var minValue = Math.min(...values),
            maxValue = Math.max(...values),
            scale;

        switch (type) {
            case "linear":
                scale = scaleLinear()
                    .range(colorspace)
                    .domain([minValue, maxValue]);
                break;
            default:
                scale = scaleSequential()
                    .interpolator(Chromatic.interpolateSpectral)
                    .domain([minValue, maxValue]);
                break;
        }

        return scale;
    }
});

export default ColorScale;