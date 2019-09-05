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

    /**
     * generates a function to use for color generation from values
     * @param {number[]} values - Array of all values to build the scale from. Default: [0, 1]
     * @param {d3.interpolator or color[]} colorspace - colorspace of the scale, either 2 values for linearScale or d3.interpolator from d3-scale-chromatic. Default: "interpolateSpectral"
     * @param {string} type - type of the scale. Possbile values: "sequential", "linear".
     * @returns {function}
     */

    generateColorScale (values = [0, 1], colorspace = Chromatic.interpolateRdYlGn, type = "sequential") {
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
                    .interpolator(colorspace)
                    .domain([minValue, maxValue]);
                break;
        }

        return scale;
    }
});

export default ColorScale;