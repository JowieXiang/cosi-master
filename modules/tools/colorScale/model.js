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
     * @returns {function, object} - returns both the scale function and a legend with value/color-pairs for visualization.
     */

    generateColorScale (values = [0, 1], colorspace = Chromatic.interpolateRdYlGn, type = "sequential", defaultColor = "#3399CC") {
        var minValue = Math.min(...values),
            maxValue = Math.max(...values),
            scale,
            legend = {
                values: [],
                colors: []
            };

        // Check if more than one value has been submitted
        if (values.length > 1) {
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

            legend.values = this.interpolateValues(minValue, maxValue);
            legend.colors = this.createLegendValues(scale, legend.values);
        }

        // return default color if not
        else {
            scale = function () {
                return defaultColor;
            };
            legend = null;
        }

        return {scale, legend};
    },
    interpolateValues: function (min, max, steps = 5) {
        var values = [min],
            step = (max - min) / (steps - 1);

        for (let i = 0; i < steps - 1; i++) {
            values.push(values[i] + step);
        }

        return values;
    },
    createLegendValues: function (scale, values) {
        var colors = [];

        values.forEach((val) => {
            colors.push(scale(val));
        });

        return colors;
    }
});

export default ColorScale;