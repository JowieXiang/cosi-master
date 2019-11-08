import {scaleBand, scaleLinear} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {line} from "d3-shape";
import {select, event} from "d3-selection";
import "d3-transition";
import "./eval";
import * as d3 from "d3-array";

const GraphModelV2 = Backbone.Model.extend(/** @lends GraphModel.prototype */{
    defaults: {
        maxValue: 0,
        minValue: 0
    },

    /**
     * @class GraphModel
     * @memberOf Tools.Graph
     * @constructs
     * @extends Backbone.Model
     * @listens Tools.Graph#RadioTriggerGraphCreateGraph
     * @listens Tools.Graph#RadioRequestGraphGetGraphParams
     */
    initialize: function () {
        var channel = Radio.channel("GraphV2");

        channel.on({
            "createGraph": this.createGraph
        }, this);
        channel.reply({
            "createGraph": this.createGraph
        }, this);
        channel.reply({
            "getGraphParams": function () {
                return this.get("graphParams");
            }
        }, this);
    },

    /**
     * Creates the graph. Distinguishes betweeen
     * graphConfig.graphType === "Linegraph",
     * graphConfig.graphType === "BarGraph" and
     * graphConfig.graphType === "ScatterPlot".
     * @param {Object} graphConfig Graph configuration.
     * @returns {void}
     */
    createGraph: function (graphConfig) {
        var svg = select(graphConfig.selector);

        if (graphConfig.graphType === "Linegraph") {
            this.createLineGraph(graphConfig);
        }
        else if (graphConfig.graphType === "BarGraph") {
            this.createBarGraph(graphConfig);
        }
        else if (graphConfig.graphType === "ScatterPlot") {
            this.createScatterPlot(graphConfig);
        }

        return svg;
    },

    /**
     * Iterates over all objects and all attributes to find the max value.
     * @param {Object[]} data Data for graph.
     * @param {String[]} attrToShowArray Attribute array.
     * @return {number}  - maxData
     */
    createMaxValue: function (data, attrToShowArray) {
        var maxValue = 0;

        if (data !== undefined && attrToShowArray !== undefined) {
            data.forEach(function (obj) {
                attrToShowArray.forEach(function (attrToShow) {
                    if (obj[attrToShow] - maxValue > 0) {
                        maxValue = obj[attrToShow];
                    }
                });
            });
        }

        return maxValue;
    },

    /**
     * Creates an object with min- and max-value.
     * @param {Object[]} data Data for graph.
     * @param {String[]} attrToShowArray Attribute array.
     * @param {Object} axisTicks Ticks object.
     * @param {number} yAxisMaxValue - max value for the y-axis
     * @return {object} - Object with attribute "minValue" and "maxValue".
     */
    createValues: function (data, attrToShowArray, axisTicks, yAxisMaxValue) {
        var valueObj = {};

        if (!_.isUndefined(axisTicks) && _.has(axisTicks, "start") && _.has(axisTicks, "end")) {
            valueObj.minValue = axisTicks.start;
            valueObj.maxValue = axisTicks.end;
        }
        else {
            valueObj.minValue = 0;
            if (yAxisMaxValue) {
                valueObj.maxValue = yAxisMaxValue;
            }
            else {
                valueObj.maxValue = this.createMaxValue(data, attrToShowArray);
            }
        }

        return valueObj;
    },

    /**
     * Creates a d3 scale for x axis
     * @param {Object[]} data Data for graph.
     * @param {Number} width Width for scale.
     * @param {String} scaletype Enum of scaletype. Possible values are "ordinal" or "linear".
     * @param {String} attr Attribute name for x axis.
     * @param {Object} xAxisTicks Ticks object.
     * @returns {Object} - scaleX
     */
    createScaleX: function (data, width, scaletype, attr, xAxisTicks) {
        var rangeArray = [0, width],
            scale,
            valueObj;

        if (scaletype === "ordinal") {
            scale = this.createOrdinalScale(data, rangeArray, [attr]);
        }
        else if (scaletype === "linear") {
            valueObj = this.createValues(data, [attr], xAxisTicks);
            scale = this.createLinearScale(valueObj.minValue, valueObj.maxValue, rangeArray);
        }
        else {
            console.error("Unknown scaletype " + scaletype);
        }
        return scale;
    },
    /**
     * Creates a d3 scale for y axis.
     * @param {Object[]} data Data for graph.
     * @param {Number} height Height for scale.
     * @param {String} scaletype Enum of scaletype. Possible values are "ordinal" or "linear".
     * @param {String[]} attrToShowArray Array of attributes to be shown in graph.
     * @param {Object} yAxisTicks Ticks object.
     * @param {number} yAxisMaxValue - max value for the y-axis
     * @returns {Object} - scaleY
     */
    createScaleY: function (data, height, scaletype, attrToShowArray, yAxisTicks, yAxisMaxValue) {
        var rangeArray = [height, 0],
            scale,
            valueObj;

        if (scaletype === "ordinal") {
            scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
        }
        else if (scaletype === "linear") {
            valueObj = this.createValues(data, attrToShowArray, yAxisTicks, yAxisMaxValue);
            scale = this.createLinearScale(valueObj.minValue, valueObj.maxValue, rangeArray);
        }
        else {
            console.error("Unknown scaletype " + scaletype);
        }

        return scale;
    },

    /**
     * Creates an ordinal scale.
     * @param {Object[]} data Data for graph.
     * @param {Number[]} rangeArray Array of 2 numbers defining the range of the scale.
     * @param {String[]} attrArray Array of attributes to be shown in graph.
     * @returns {Object} - ordinalScale
     */
    createOrdinalScale: function (data, rangeArray, attrArray) {
        var values = [];

        _.each(data, function (d) {
            _.each(attrArray, function (attr) {
                values.push(d[attr]);
            });
        });
        values = _.uniq(values);
        return scaleBand()
            .range(rangeArray)
            .domain(values);
    },

    /**
     * Creates an linear scale.
     * @param {String/Number} minValue Min value for linear scale.
     * @param {String/Number} maxValue Max value for linear scale.
     * @param {Number[]} rangeArray Array of 2 numbers defining the range of the scale.
     * @returns {Object} - linearScale
     */
    createLinearScale: function (minValue, maxValue, rangeArray) {
        return scaleLinear()
            .range(rangeArray)
            .domain([minValue, maxValue])
            .nice();
    },

    /**
     * Creates the bottom axis of the graph.
     * @param {Object} scale Scale of bottom axis.
     * @param {Object} xAxisTicks Ticks for bottom axis.
     * @returns {Object} - axisBottom
     */
    createAxisBottom: function (scale, xAxisTicks) {
        var unit = !_.has(xAxisTicks, "unit") ? "" : " " + xAxisTicks.unit,
            d3Object;

        if (xAxisTicks === undefined) {
            d3Object = axisBottom(scale);
        }
        else if (_.has(xAxisTicks, "values") && !_.has(xAxisTicks, "factor")) {
            d3Object = axisBottom(scale)
                .tickValues(xAxisTicks.values)
                .tickFormat(function (d) {
                    return d + unit;
                });
        }
        else if (_.has(xAxisTicks, "values") && _.has(xAxisTicks, "factor")) {
            d3Object = axisBottom(scale)
                .ticks(xAxisTicks.values, xAxisTicks.factor)
                .tickFormat(function (d) {
                    return d + unit;
                });
        }

        return d3Object;
    },

    /**
     * Creates the axis on the left.
     * @param {Object} scale Scale of left axis.
     * @param {Object} yAxisTicks Ticks for left axis.
     * @returns {Object} - axisLeft
     */
    createAxisLeft: function (scale, yAxisTicks) {
        var d3Object;

        if (_.isUndefined(yAxisTicks) && !_.has(yAxisTicks, "ticks")) {
            d3Object = axisLeft(scale)
                .tickFormat(function (d) {
                    if (d % 1 === 0) {
                        return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    }
                    return false;

                });
        }
        else {
            d3Object = axisLeft(scale)
                .ticks(yAxisTicks.ticks, yAxisTicks.factor);
        }

        return d3Object;
    },

    /**
     * Creates a d3 line object.
     * @param {Object} scaleX Scale of x-axis.
     * @param {Object} scaleY Scale of y-axis.
     * @param {String} xAttr  Attribute name for x-axis.
     * @param {string} yAttrToShow Attribut name for y-axis.
     * @param {string} scaleTypeX Type of the x-scale
     * @returns {Object} - valueLine.
     */
    createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow, scaleTypeX) {
        return line()
            .x(function (d) {
                return scaleTypeX === "ordinal" ? scaleX(d[xAttr]) + (scaleX.bandwidth() / 2) : scaleX(d[xAttr]);
            })
            .y(function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .defined(function (d) {
                return !isNaN(d[yAttrToShow]);
            });
    },

    /**
     * Creates the basic structure of a graph.
     * @param {SVG} svg The svg.
     * @param {Object[]} data Data for graph.
     * @param {String} className Class name of point.
     * @param {Object} d3line D3 line object.
     * @param {String} tooltipDiv (optional)
     * @param {String} attrName (optional) name of Attr for hover
     * @returns {void}
     */
    appendDataToSvg: function (svg, data, className, d3line, tooltipDiv = null, attrName = null) {
        var dataToAdd = data.filter(function (obj) {
            return obj.yAttrToShow !== "-";
        });

        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                var y;

                if (svg.select(".graph-legend").size() > 0) {
                    y = svg.select(".graph-legend").node().getBBox().height;

                    return "translate(0, " + y + ")";
                }
                return "translate(0, 0)";
            })
            .append("g")
            .attr("class", "graph-diagram")
            .append("path")
            .data([dataToAdd])
            .attr("class", className)
            .attr("d", d3line)
            .on("mouseover", function () {
                if (tooltipDiv) {
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltipDiv.html(`<strong>${attrName}</strong>`)
                        .attr("style", "background-color: buttonface; border-radius: 4px; text-align: center;")
                        .style("left", (event.clientX - 25) + "px")
                        .style("top", (event.clientY - 35) + "px");
                }
            }, tooltipDiv)
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    }, tooltipDiv);
            }, tooltipDiv);
    },

    /**
     * Appends the x-axis to the svg.
     * @param {SVG} svg SVG.
     * @param {Object} xAxis x-axis.
     * @param {Object} xAxisLabel Definition of x-axis.
     * @param {String} [xAxisLabel.label] Text of label.
     * @param {String} [xAxisLabel.offset=0] Offset between x-axis and text.
     * @param {String} [xAxisLabel.textAnchor=middle] Text anchor of x-axis label.
     * @param {String} [xAxisLabel.fill=#000] Text fill color.
     * @param {String} [xAxisLabel.fontSize=10] Text font size.
     * @param {Number} [xAxisLabel.rotate] Value of Rotation.
     * @param {Number} width Width of SVG.
     * @returns {void}
     */
    appendXAxisToSvg: function (svg, xAxis, xAxisLabel, width) {
        var textOffset = _.isUndefined(xAxisLabel.offset) ? 0 : xAxisLabel.offset,
            textAnchor = _.isUndefined(xAxisLabel.textAnchor) ? "middle" : xAxisLabel.textAnchor,
            fill = _.isUndefined(xAxisLabel.fill) ? "#000" : xAxisLabel.fill,
            fontSize = _.isUndefined(xAxisLabel.fontSize) ? 10 : xAxisLabel.fontSize,
            label = _.isUndefined(xAxisLabel.label) ? null : [xAxisLabel.label],
            rotate = _.isUndefined(xAxisLabel.rotate) ? null : xAxisLabel.rotate,
            xAxisDraw = xAxis;

        xAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("transform", function () {
                // gibt den Hochwert des untersten Ticks zurück
                var tick = svg.select(".yAxisDraw .tick").attr("transform"),
                    transform = tick.substring(tick.indexOf("(") + 1, tick.indexOf(")")).split(/\s|,/); // blank oder Komma

                return "translate(0," + transform[1] + ")";
            })
            .attr("class", "xAxisDraw")
            .call(xAxisDraw);

        if (label) {
            xAxisDraw.append("text")
                .attr("x", width / 2)
                .attr("y", 18 + textOffset)
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label)
                .attr("class", "xAxisLabelText");
        }
        if (rotate) {
            this.rotateXAxisTexts(svg, rotate);
        }
    },

    /**
     * Appends the y-axis to the svg
     * @param {SVG} svg SVG.
     * @param {Object} yAxis y-axis.
     * @param {Object} yAxisLabel Definition of y-axis.
     * @param {String} [yAxisLabel.label] Text of label.
     * @param {String} [yAxisLabel.offset=0] Offset between y-axis and text.
     * @param {String} [yAxisLabel.textAnchor=middle] Text anchor of y-axis label.
     * @param {String} [yAxisLabel.fill=#000] Text fill color.
     * @param {String} [yAxisLabel.fontSize=10] Text font size.
     * @param {Number} height Height of SVG.
     * @returns {void}
     */
    appendYAxisToSvg: function (svg, yAxis, yAxisLabel, height) {
        var textOffset = _.isUndefined(yAxisLabel.offset) ? 0 : yAxisLabel.offset,
            textAnchor = _.isUndefined(yAxisLabel.textAnchor) ? "middle" : yAxisLabel.textAnchor,
            fill = _.isUndefined(yAxisLabel.fill) ? "#000" : yAxisLabel.fill,
            fontSize = _.isUndefined(yAxisLabel.fontSize) ? 10 : yAxisLabel.fontSize,
            label = _.isUndefined(yAxisLabel.label) ? null : [yAxisLabel.label],
            yAxisDraw = yAxis;

        yAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("class", "yAxisDraw")
            .call(yAxisDraw);

        if (label) {
            yAxisDraw.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - (height / 2))
                .attr("y", 0 - textOffset)
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label);
        }
    },

    /**
     * Appends line points to created line.
     * @param {SVG} svg Svg.
     * @param {Object[]} data Data for graph.
     * @param {Object} scaleX Scale for x-axis.
     * @param {Object} scaleY Scale for y-axis.
     * @param {string} scaleTypeX Type of x-Scale
     * @param {String} xAttr Attribute name for x-axis.
     * @param {String} yAttrToShow Attribute name for line point on y-axis.
     * @param {Selection} tooltipDiv Selection of the tooltip-div.
     * @param {Number} dotSize The size of the dots.
     * @param {String} className optional className for the dots.
     * @returns {void}
     */
    appendLinePointsToSvg: function (svg, data, scaleX, scaleY, scaleTypeX, xAttr, yAttrToShow, tooltipDiv, dotSize, className = null) {
        var dat = data.filter(function (obj) {
                return obj[yAttrToShow] !== "-";
            }),
            yAttributeToShow;

        svg.append("g").attr("class", " graph-points").selectAll("points")
            .data(dat)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return scaleTypeX === "ordinal" ? scaleX(d[xAttr]) + (scaleX.bandwidth() / 2) : scaleX(d[xAttr]);
            })
            .attr("cy", function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .attr("r", dotSize)

            .attr("x", function (d) {
                return scaleTypeX === "ordinal" ? scaleX(d[xAttr]) + (scaleX.bandwidth() / 2) : scaleX(d[xAttr]);
            })
            .attr("y", function (d) {
                return scaleY(d[yAttrToShow]) - 5;
            })
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", function (d) {
                return d.class || className;
            })
            .attr("attrname", yAttrToShow)
            .attr("attrval", function (d) {
                return d[yAttrToShow];
            })
            .on("mouseover", function (d) {
                yAttributeToShow = Number.isInteger(d[yAttrToShow]) ? parseInt(d[yAttrToShow], 10).toLocaleString("de-DE") : parseFloat(d[yAttrToShow]).toFixed(2).toLocaleString("de-DE");
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(`<strong>${yAttrToShow}:</strong> ${yAttributeToShow}`)
                    .attr("style", "background-color: buttonface; border-radius: 4px; text-align: center;")
                    .style("left", (event.clientX - 25) + "px")
                    .style("top", (event.clientY - 35) + "px");
            }, tooltipDiv)
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    }, tooltipDiv);
            }, tooltipDiv)
            .on("click", function (d) {
                yAttributeToShow = Number.isInteger(d[yAttrToShow]) ? parseInt(d[yAttrToShow], 10).toLocaleString("de-DE") : parseFloat(d[yAttrToShow]).toFixed(2).toLocaleString("de-DE");
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(`<strong>${yAttrToShow}:</strong> ${yAttributeToShow}`)
                    .attr("style", "background-color: buttonface; border-radius: 4px;")
                    .style("left", (event.clientX - 25) + "px")
                    .style("top", (event.clientY - 35) + "px");
                    // .style("left", (event.layerX - 25) + "px")
                    // .style("top", (event.layerY - 35) + "px");
            }, tooltipDiv);
    },

    appendLineLabel (svg, data, scaleX, scaleY, scaleTypeX, xAttr) {
        const dataToShow = data[data.length - 1],
            xAttrValue = dataToShow[xAttr],
            dataArray = Object.entries(dataToShow)
                .filter(d => d[0] !== xAttr)
                .map(d => {
                    return {
                        label: d[0],
                        y: parseFloat(d[1]),
                        x: parseFloat(xAttrValue)
                    };
                });

        svg.append("g").classed("line-labels", true)
            .selectAll("text")
            .data(dataArray)
            .enter()
            .append("text")
            .text(d => d.label)
            .attr("y", d => scaleY(d.y))
            .attr("x", d => {
                console.log(d.x, xAttr, dataToShow);
                return scaleTypeX === "ordinal" ? scaleX(d.x) + (scaleX.bandwidth() / 2) + 20 : scaleX(d.x) + 20;
            });
    },

    /**
     * Creates the SVG.
     * @param {String} selector Class of DOM element where svg gets appended.
     * @param {Number} left Left border of SVG.
     * @param {Number} top Right border of SVG.
     * @param {Number} width Width of SVG.
     * @param {Number} height Height of SVG.
     * @param {String} svgClass Class of SVG.
     * @returns {SVG} - SVG
     */
    createSvg: function (selector, left, top, width, height, svgClass) {
        return select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", svgClass)
            .append("g")
            .attr("class", "graph")
            .attr("transform", "translate(" + left + "," + top + ")");
    },

    /**
     * Creates a legend and adds it on the top left.
     * @param {SVG} svg SVG.
     * @param {Object[]} legendData Legend object.
     * @param {String} legendData.style Type of legend item "rect" for "<rect>" or "circle" for "<circle>".
     * @param {String} legendData.class Class of legend item.
     * @param {String} legendData.text Text of legend item.
     * @returns {void}
     */
    appendLegend: function (svg, legendData) {
        var legend = svg.append("g")
            .attr("class", "graph-legend")
            .style("height", "200 px")
            .selectAll("g")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "graph-legend-item")
            .attr("transform", function (d, i) {
                return "translate(" + -60 + "," + (-20 + (20 * i)) + ")";
            });

        legend.append(function (d) {
            return document.createElementNS("http://www.w3.org/2000/svg", d.style);
        })
            // Attribute für <rect>
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 0)
            .attr("y", 5)
            // Attribute für <circle>
            .attr("cx", 5)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("class", function (d) {
                return d.class;
            });

        legend.append("text")
            .attr("x", 20)
            .attr("y", 15)
            .text(function (d) {
                return d.text;
            });
    },
    /**
     * Flattens the attributeToShowArray and only returns an array of the attrNames.
     * @param {Object/String[]} attrToShowArray Array of objects or strings.
     * @returns {String[]} - Flattened Array.
     */
    flattenAttrToShowArray: function (attrToShowArray) {
        const flatAttrToShowArray = [];

        attrToShowArray.forEach(function (attrToShow) {
            if (typeof attrToShow === "object") {
                flatAttrToShowArray.push(attrToShow.attrName);
            }
            else {
                flatAttrToShowArray.push(attrToShow);
            }
        });
        return flatAttrToShowArray;
    },
    /**
     * Creates the linegraph.
     * @param {Object} graphConfig Graph config.
     * @param {String} graphConfig.selector Class for SVG to be appended to.
     * @param {String} graphConfig.scaleTypeX Type of x-axis.
     * @param {String} graphConfig.scaleTypeY Type of y-axis.
     * @param {Object[]} graphConfig.data Data for graph.
     * @param {String} graphConfig.xAttr Attribute name for x-axis.
     * @param {Object} graphConfig.xAxisLabel Object to define the label for x-axis.
     * @param {String} graphConfig.xAxisLabel.label Label for x-axis.
     * @param {Number} graphConfig.xAxisLabel.translate Translation offset for label for x-axis.
     * @param {Object} graphConfig.yAxisLabel Object to define the label for y-axis.
     * @param {String} graphConfig.yAxisLabel.label Label for y-axis.
     * @param {Number} graphConfig.yAxisLabel.offset Offset for label for y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray Array of attribute names or objects to be shown on y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrName Name of attribute to be shown.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrClass Class for line in graph.
     * @param {Object} graphConfig.margin Margin object for graph.
     * @param {Number} graphConfig.margin.top Top margin.
     * @param {Number} graphConfig.margin.right Right margin.
     * @param {Number} graphConfig.margin.bottom Bottom margin.
     * @param {Number} graphConfig.margin.left left margin.
     * @param {Number} graphConfig.width Width of SVG.
     * @param {Number} graphConfig.height Height of SVG.
     * @param {Object} graphConfig.xAxisTicks Ticks for x-axis.
     * @param {String} graphConfig.xAxisTicks.unit Unit of x-axis-ticks.
     * @param {Number/String[]} graphConfig.xAxisTicks.values Values for x-axis-ticks.
     * @param {Number} graphConfig.xAxisTicks.factor Factor for x-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks Ticks for y-axis.
     * @param {Object} graphConfig.yAxisTicks.ticks Values for y-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks.factor Factor for y-axis-ticks.
     * @param {String} graphConfig.svgClass Class of SVG.
     * @param {String} graphConfig.selectorTooltip Selector for tooltip div.
     * @param {Object[]} graphConfig.legendData Data for legend.
     * @param {String} graphConfig.legendData.class CSS class for legend object.
     * @param {String} graphConfig.legendData.text Text for legen object.
     * @returns {void}
     */
    createLineGraph: function (graphConfig) {
        var isMobile = Radio.request("Util", "isViewMobile"),
            selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel,
            yAxisLabel = graphConfig.yAxisLabel,
            attrToShowArray = graphConfig.attrToShowArray,
            flatAttrToShowArray = this.flattenAttrToShowArray(attrToShowArray),
            margin = graphConfig.margin,
            marginBottom = isMobile ? margin.bottom + 20 : margin.bottom,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - marginBottom,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
            scaleY = this.createScaleY(data, height, scaleTypeY, flatAttrToShowArray),
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            xAxis = this.createAxisBottom(scaleX, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            tooltipDiv = select(graphConfig.selectorTooltip),
            offset = 10,
            dotSize = graphConfig.dotSize || 5,
            valueLine,
            hasLineLabel = graphConfig.hasLineLabel;

        if (_.has(graphConfig, "legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }
        _.each(attrToShowArray, function (yAttrToShow) {
            if (typeof yAttrToShow === "object") {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow.attrName, scaleTypeX);
                this.appendDataToSvg(svg, data, yAttrToShow.attrClass, valueLine, tooltipDiv, yAttrToShow.attrName, hasLineLabel);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, scaleTypeX, xAttr, yAttrToShow.attrName, tooltipDiv, dotSize, yAttrToShow.attrClass);
            }
            else {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow, scaleTypeX);
                this.appendDataToSvg(svg, data, "line", valueLine);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, scaleTypeX, xAttr, yAttrToShow, tooltipDiv, dotSize);
            }
        }, this);
        // Add the Axis
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, height);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, width);

        if (isMobile) {
            this.rotateXAxisTexts(svg);
            this.translateXAxislabelText(svg, xAxisLabel.translate);
        }

        if (hasLineLabel) {
            this.appendLineLabel(svg, data, scaleX, scaleY, scaleTypeX, xAttr);
        }

        this.setGraphParams({
            scaleX: scaleX,
            scaleY: scaleY,
            tooltipDiv: tooltipDiv,
            margin: margin,
            offset: offset
        });

        return svg;
    },

    /**
     * Rotates the label on the x-axis by 45 degrees
     * @param {SVG} svg SVG.
     * @param {number} rotate - rotate value
     * @return {void}
     */
    rotateXAxisTexts: function (svg, rotate) {
        svg.select(".xAxisDraw").selectAll(".tick").selectAll("text")
            .attr("transform", "rotate(" + rotate + ") translate(17, -4)");
    },

    /**
     * Moves the label of the x-axis downwards
     * @param {SVG} svg SVG.
     * @param {Number} xAxisLabelTranslate Translation on the x-axis.
     * @return {void}
     */
    translateXAxislabelText: function (svg, xAxisLabelTranslate) {
        svg.select(".xAxisDraw").selectAll(".xAxisLabelText")
            .attr("transform", "translate(0, " + xAxisLabelTranslate + ")");
    },

    /**
     * ToDo.
     * @param {object} graphConfig ToDo.
     * @returns {void}
     */
    createBarGraph: function (graphConfig) {
        var selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel ? graphConfig.xAxisLabel : undefined,
            yAxisLabel = graphConfig.yAxisLabel ? graphConfig.yAxisLabel : undefined,
            yAxisMaxValue = graphConfig.yAxisLabel.maxValue ? graphConfig.yAxisLabel.maxValue : undefined,
            attrToShowArray = graphConfig.attrToShowArray,
            margin = graphConfig.margin,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - margin.bottom,
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr, xAxisTicks),
            scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray, yAxisTicks, yAxisMaxValue),
            xAxis = this.createAxisBottom(scaleX, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            barWidth = width / data.length;

        if (_.has(graphConfig, "legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }
        this.drawBars(svg, data, scaleX, scaleY, height, selector, barWidth, xAttr, attrToShowArray);
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, height);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, width);

        return svg;
    },

    /**
     * ToDo.
     * @param {*} svg ToDo.
     * @param {*} dataToAdd ToDo.
     * @param {*} x ToDo.
     * @param {*} y ToDo.
     * @param {*} height ToDo.
     * @param {*} selector ToDo.
     * @param {*} barWidth ToDo.
     * @param {*} xAttr ToDo.
     * @param {*} attrToShowArray ToDo.
     * @returns {void}
     */
    drawBars: function (svg, dataToAdd, x, y, height, selector, barWidth, xAttr, attrToShowArray) {
        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                var legendHeight;

                if (svg.select(".graph-legend").size() > 0) {
                    legendHeight = svg.select(".graph-legend").node().getBBox().height;

                    return "translate(0, " + legendHeight + ")";
                }
                return "translate(0, 0)";
            })
            .append("g")
            .attr("class", "graph-diagram");

        svg.select(".graph-diagram").selectAll("bars")
            .data(dataToAdd)
            .enter()
            .append("rect")
            .attr("class", typeof selector === "string" ? "bar" + selector.split(".")[1] : "bar")
            .attr("fill", function (d) {
                return Radio.request("ColorScale", "getColorScaleByValues", y.domain()).scale(d[attrToShowArray[0]]);
            })
            .attr("x", function (d) {
                return x(d[xAttr]);
            })
            .attr("y", function (d) {
                return y(d[attrToShowArray[0]]);
            })
            .attr("width", barWidth - 1)
            .attr("height", function (d) {
                return height - y(d[attrToShowArray[0]]);
            })
            .on("mouseover", function () {
                select(this);
            }, this)
            .append("title")
            .text(function (d) {
                return d[attrToShowArray[0]];
            });
    },

    /**
     * Creates the linegraph.
     * @param {Object} graphConfig Graph config.
     * @param {String} graphConfig.selector Class for SVG to be appended to.
     * @param {String} graphConfig.scaleTypeX Type of x-axis.
     * @param {String} graphConfig.scaleTypeY Type of y-axis.
     * @param {Object[]} graphConfig.data Data for graph.
     * @param {String} graphConfig.xAttr Attribute name for x-axis.
     * @param {Object} graphConfig.xAxisLabel Object to define the label for x-axis.
     * @param {String} graphConfig.xAxisLabel.label Label for x-axis.
     * @param {Number} graphConfig.xAxisLabel.translate Translation offset for label for x-axis.
     * @param {Object} graphConfig.yAxisLabel Object to define the label for y-axis.
     * @param {String} graphConfig.yAxisLabel.label Label for y-axis.
     * @param {Number} graphConfig.yAxisLabel.offset Offset for label for y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray Array of attribute names or objects to be shown on y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrName Name of attribute to be shown.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrClass Class for line in graph.
     * @param {Object} graphConfig.margin Margin object for graph.
     * @param {Number} graphConfig.margin.top Top margin.
     * @param {Number} graphConfig.margin.right Right margin.
     * @param {Number} graphConfig.margin.bottom Bottom margin.
     * @param {Number} graphConfig.margin.left left margin.
     * @param {Number} graphConfig.width Width of SVG.
     * @param {Number} graphConfig.height Height of SVG.
     * @param {Object} graphConfig.xAxisTicks Ticks for x-axis.
     * @param {String} graphConfig.xAxisTicks.unit Unit of x-axis-ticks.
     * @param {Number/String[]} graphConfig.xAxisTicks.values Values for x-axis-ticks.
     * @param {Number} graphConfig.xAxisTicks.factor Factor for x-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks Ticks for y-axis.
     * @param {Object} graphConfig.yAxisTicks.ticks Values for y-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks.factor Factor for y-axis-ticks.
     * @param {String} graphConfig.svgClass Class of SVG.
     * @param {String} graphConfig.selectorTooltip Selector for tooltip div.
     * @param {Object[]} graphConfig.legendData Data for legend.
     * @param {String} graphConfig.legendData.class CSS class for legend object.
     * @param {String} graphConfig.legendData.text Text for legen object.
     * @returns {void}
     */
    createScatterPlot: function (graphConfig) {
        var isMobile = Radio.request("Util", "isViewMobile"),
            selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            refAttr = graphConfig.refAttr,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel,
            yAxisLabel = graphConfig.yAxisLabel,
            attrToShowArray = graphConfig.attrToShowArray,
            flatAttrToShowArray = this.flattenAttrToShowArray(attrToShowArray),
            margin = graphConfig.margin,
            marginBottom = isMobile ? margin.bottom + 20 : margin.bottom,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - marginBottom,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
            scaleY = this.createScaleY(data, height, scaleTypeY, flatAttrToShowArray),
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            xAxis = this.createAxisBottom(scaleX, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            tooltipDiv = select(graphConfig.selectorTooltip),
            offset = 10,
            dotSize = graphConfig.dotSize || 5;

        if (_.has(graphConfig, "legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }
        _.each(attrToShowArray, function (yAttrToShow) {
            const attrData = this.evaluateData(data, xAttr, yAttrToShow),
                regressionLine = this.createRegressionLine(xAttr, scaleX, scaleY);

            console.log(attrData, regressionLine);

            this.appendPlotLayout(svg);
            // Add the scatterplot for each point in line
            this.appendDataToScatterPlot(svg, attrData, scaleX, scaleY, xAttr, refAttr, yAttrToShow, tooltipDiv, dotSize);
            // Add Regression-line and deviation val
            this.appendRegressionLine(svg, attrData, regressionLine);
        }, this);
        // Add the Axis
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, height);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, width);

        if (isMobile) {
            this.rotateXAxisTexts(svg);
            this.translateXAxislabelText(svg, xAxisLabel.translate);
        }

        this.setGraphParams({
            scaleX: scaleX,
            scaleY: scaleY,
            tooltipDiv: tooltipDiv,
            margin: margin,
            offset: offset
        });

        return svg;
    },

    evaluateData: function (data, xAttr, yAttr) {
        var dat = data.filter(function (obj) {
                return obj[yAttr] !== "-";
            }),
            xArr = dat.map(d => d[xAttr]),
            yArr = dat.map(d => d[yAttr]),
            xMean = d3.mean(xArr),
            yMean = d3.mean(yArr),
            xr = 0,
            yr = 0,
            term1 = 0,
            term2 = 0,
            a, b;

        // calculate coefficients
        for (let i = 0; i < dat.length; i++) {
            xr = xArr[i] - xMean;
            yr = yArr[i] - yMean;
            term1 += xr * yr;
            term2 += xr * xr;
        }
        a = term1 / term2;
        b = yMean - (a * xMean);
 
        // calculate average y
        for (let i = 0; i < dat.length; i++) {
            dat[i].yMean = b + (xArr[i] * a);
        }

        return dat;
    },

    createRegressionLine (xAttr, scaleX, scaleY) {
        return line()
            .x(function (d) {
                return scaleX(d[xAttr]);
            })
            .y(function (d) {
                return scaleY(d.yMean);
            });
    },

    appendRegressionLine (svg, data, d3line) {
        svg.append("g")
            .attr("class", "regression")
            .attr("transform", function () {
                var y;

                if (svg.select(".graph-legend").size() > 0) {
                    y = svg.select(".graph-legend").node().getBBox().height;

                    return "translate(0, " + y + ")";
                }
                return "translate(0, 0)";
            })
            .append("path")
            .data([data])
            .attr("class", "regression-line")
            .attr("d", d3line);
    },

    /**
     * Creates the basic structure of a graph.
     * @param {SVG} svg The svg.
     * @param {Object[]} data Data for graph.
     * @param {String} className Class name of point.
     * @param {Object} d3line D3 line object.
     * @param {String} tooltipDiv (optional)
     * @param {String} attrName (optional) name of Attr for hover
     * @returns {void}
     */
    appendPlotLayout: function (svg) {
        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                var y;

                if (svg.select(".graph-legend").size() > 0) {
                    y = svg.select(".graph-legend").node().getBBox().height;

                    return "translate(0, " + y + ")";
                }
                return "translate(0, 0)";
            })
            .append("g")
            .attr("class", "graph-diagram");
    },

    /**
     * Appends line points to created line.
     * @param {SVG} svg Svg.
     * @param {Object[]} data Data for graph.
     * @param {Object} scaleX Scale for x-axis.
     * @param {Object} scaleY Scale for y-axis.
     * @param {String} xAttr Attribute name for x-axis.
     * @param {String} refAttr the reference/context of each val pair
     * @param {String} yAttr Attribute name for line point on y-axis.
     * @param {Selection} tooltipDiv Selection of the tooltip-div.
     * @param {Number} dotSize The size of the dots.
     * @returns {void}
     */
    appendDataToScatterPlot: function (svg, data, scaleX, scaleY, xAttr, refAttr, yAttr, tooltipDiv, dotSize) {
        var dat = data.filter(function (obj) {
                return obj[yAttr] !== "-";
            }),
            refValues = dat.reduce((res, val) => {
                return res.includes(val[refAttr]) ? res : [...res, val[refAttr]];
            }, []),
            refColorScale = Radio.request("ColorScale", "getColorScaleByValues", [0, 1], "interpolateRainbow", refValues.length),
            refColors = Object.fromEntries(refValues.map((val, i) => [val, refColorScale.legend.colors[i]])),
            yAttributeToShow,
            xAttributeToShow,
            tooltipElement;

        svg.append("g").attr("class", " graph-points").selectAll("points")
            .data(dat)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return scaleX(d[xAttr]);
            })
            .attr("cy", function (d) {
                return scaleY(d[yAttr]);
            })
            .attr("r", dotSize)
            .attr("className", "graph-point")
            .attr("x", function (d) {
                return scaleX(d[xAttr]);
            })
            .attr("y", function (d) {
                return scaleY(d[yAttr]) - 5;
            })
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function (d) {
                return refColors[d[refAttr]];
            })
            .on("mouseover", function (d) {
                yAttributeToShow = Number.isInteger(d[yAttr]) ? parseInt(d[yAttr], 10).toLocaleString("de-DE") : parseFloat(d[yAttr]).toFixed(2).toLocaleString("de-DE");
                xAttributeToShow = Number.isInteger(d[xAttr]) ? parseInt(d[xAttr], 10).toLocaleString("de-DE") : parseFloat(d[xAttr]).toFixed(2).toLocaleString("de-DE");
                tooltipElement = $(`<table>
                    <tr class="prop"><th>${refAttr}</th><th>${xAttr}</th><th>${yAttr}</th></tr>
                    <tr class="val"><td>${d[refAttr]}</td><td>${xAttributeToShow}</td><td>${yAttributeToShow}</td></td>
                </table>`);

                for (const prop in d) {
                    if (![refAttr, xAttr, yAttr, "yMean"].includes(prop)) {
                        tooltipElement.find(".prop").append($(`<th>${prop === "year" ? "Jahr" : prop}</th>`));
                        tooltipElement.find(".val").append($(`<td>${d[prop]}</td>`));
                    }
                }

                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(tooltipElement.get(0).outerHTML)
                    .attr("style", "background-color: buttonface; border-radius: 4px; text-align: center;")
                    .style("right", (window.innerWidth - event.clientX - 25) + "px")
                    .style("top", (event.clientY + 20) + "px");
            }, tooltipDiv)
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    }, tooltipDiv);
            }, tooltipDiv);
    },

    /**
     * Setter for attribute "graphParams".
     * @param {Object} value Graph params.
     * @returns {void}
     */
    setGraphParams: function (value) {
        this.set("graphParams", value);
    }
});

export default GraphModelV2;