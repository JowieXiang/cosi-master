import Tool from "../../../../modules/core/modelList/tool/model";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import TimelineModel from "../../../../modules/tools/timeline/model";

const DashboardTableModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        tableView: [],
        filteredTableView: [],
        name: "",
        glyphicon: "",
        width: "60%",
        exportButtonModel: {},
        exportFilteredButtonModel: {},
        sortKey: "",
        timelineModel: new TimelineModel(),
        filterDropdownModel: {},
        scopeLayersLoaded: 0,
        correlationAttrs: []
    }),

    /**
     * @class DasboardTableModel
     * @extends Core.ModelList.Tool
     * @constructs
     * @property
     * @listens SelectDistrict#RadioTriggerSelectionChanged
     * @listens Dashboard#RadioTriggerDashboardOpen
     * @fires
     */

    initialize: function () {
        var channel = Radio.channel("Dashboard");

        this.superInitialize();

        this.set("exportButtonModel", new ExportButtonModel({
            tag: "Als CSV herunterladen",
            rawData: [],
            filename: "CoSI-Dashboard-Export",
            fileExtension: "csv"
        }));
        this.set("exportFilteredButtonModel", new ExportButtonModel({
            tag: "Als CSV herunterladen (gefiltert)",
            rawData: [],
            filename: "CoSI-Dashboard-Export-(gefiltert)",
            fileExtension: "csv"
        }));

        this.set("filterDropdownModel", new DropdownModel({
            name: "Filter",
            type: "string",
            displayName: "Tabelle filtern",
            values: [],
            snippetType: "dropdown",
            isMultiple: true,
            liveSearch: true,
            isGrouped: true
        }));

        this.listenTo(this.get("filterDropdownModel"), {
            "valuesChanged": this.filterTableView
        });

        // this.listenTo(Radio.channel("SelectDistrict"), {
        //     "selectionChanged": function () {
        //         this.set("sortKey", Radio.request("SelectDistrict", "getSelector"));
        //     }
        // }, this);

        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": this.getData
        }, this);

        this.listenTo(channel, {
            "dashboardOpen": this.prepareRendering
        }, this);

        this.listenTo(this, {
            "change:tableView": function () {
                this.set("filteredTableView", this.get("tableView"));
            },
            "change:filteredTableView": this.prepareRendering
        });
    },

    /**
     * @description Concats the new feature data with the exisiting data-table and triggers the rendering
     * @param {Array<ol.feature>} features - the features that contain the info to display
     * @param {string} layerId - the ID of the LayerModel of the data
     * @returns {void}
     */
    updateTable: function (features) {
        const table = features.reduce((newTable, feature) => {
            const properties = feature.getProperties(),
                distCol = newTable.find(col => col[CoSI.selector] === properties[CoSI.selector]);

            if (distCol) {
                return newTable.map((col) => {
                    if (col[CoSI.selector] === properties[CoSI.selector]) {
                        return {...col, ...Radio.request("Timeline", "createTimelineTable", [properties])[0]};
                    }
                    return col;
                });
            }
            return [...newTable, Radio.request("Timeline", "createTimelineTable", [properties])[0]];
        }, []);

        // Fill up gaps in the data due to data inconsistencies
        // Add total and mean values and filter table for excluded properties
        this.set("unsortedTable", this.calculateTotalAndMean(Radio.request("Timeline", "fillUpTimelineGaps", table, "Array")));

        // group table according to mapping.json
        // Set table
        this.set("tableView", this.groupTable(this.get("unsortedTable")));

        if (Radio.request("InfoScreen", "getIsWindowOpen")) {
            Radio.trigger("InfoScreen", "sendData", this.get("tableView"), "dashboardTable", "tableView");
            Radio.trigger("InfoScreen", "sendData", this.get("unsortedTable"), "dashboardTable", "unsortedTable");
        }
    },

    /**
     * @description prepares all nested views for rendering and triggers view
     * @returns {void}
     */
    prepareRendering: function () {
        // Update the filter dropdown list
        this.updateFilter();
        this.prepareExportLink();

        this.trigger("isReady");
    },

    /**
     * @description prepare exportLink and convert filtered table to readable obj
     * @returns {void}
     */
    prepareExportLink () {
        // Update Export Link
        this.get("exportButtonModel").set("rawData", this.flattenTable(this.get("tableView")));
        this.get("exportButtonModel").prepareForExport();

        this.get("exportFilteredButtonModel").set("rawData", this.flattenTable(this.get("filteredTableView")));
        this.get("exportFilteredButtonModel").prepareForExport();
    },

    flattenTable (data) {
        const flatData = this.flat(data.map(group => {
            const flatGroup = Object.values(Object.assign({}, group.values)),
                propertyNames = Object.keys(group.values);

            return flatGroup.map((prop, i) => {
                const flatProp = Object.assign({}, prop),
                    years = flatProp.Durchschnitt.map(val => val[0]);

                return years.map((year, j) => {
                    const flatYear = Object.assign({}, flatProp);

                    for (const district in flatYear) {
                        flatYear[district] = flatYear[district][j][1];
                    }

                    return {...{
                        Jahr: year,
                        Datensatz: propertyNames[i],
                        Kategorie: group.group
                    }, ...flatYear};
                });
            });
        }));

        return flatData;
    },

    flat (arr) {
        return arr.reduce((res, item) => {
            return item.length ? [...res, ...this.flat(item)] : [...res, item];
        }, []);
    },

    /**
     * @description sums up and averages all rows of the table
     * @param {Object} table the existing table (already filtered)
     * @returns {Object} the resulting table
     */
    calculateTotalAndMean: function (table) {
        if (table) {
            const properties = _.allKeys(table[0]);

            table.push({[CoSI.selector]: "Gesamt"}, {[CoSI.selector]: "Durchschnitt"});
            _.each(properties, (prop) => {
                if (prop !== CoSI.selector) {

                    // Check whether values in row are numbers or Arrays of numbers
                    if (!isNaN(parseFloat(table[0][prop])) && !Array.isArray(table[0][prop])) {
                        let total = 0;

                        // Add values for all columns
                        _.each(table, (col) => {
                            if (col[CoSI.selector] !== "Gesamt" && col[CoSI.selector] !== "Durchschnitt") {
                                total += parseFloat(col[prop]);
                            }
                            if (total !== 0) {

                                // write sum
                                if (col[CoSI.selector] === "Gesamt") {
                                    col[prop] = total;
                                }

                                // calculate and write average
                                if (col[CoSI.selector] === "Durchschnitt") {
                                    col[prop] = total / (table.length - 2);
                                }
                            }
                        });
                    }
                    else if (Array.isArray(table[0][prop])) {
                        const matrixTotal = [],
                            avgArr = [];

                        // Create Matrix from timeline values
                        _.each(table, (col) => {
                            if (col[CoSI.selector] !== "Gesamt" && col[CoSI.selector] !== "Durchschnitt") {
                                matrixTotal.push(col[prop]);
                            }
                            if (matrixTotal.length > 0) {
                                // sum up all columns of timeline and calculate average on the fly
                                if (col[CoSI.selector] === "Gesamt") {
                                    col[prop] = [];
                                    for (let i = 0; i < matrixTotal[0].length; i++) {
                                        let n = 0;

                                        col[prop].push([matrixTotal[0][i][0], 0]);
                                        for (let j = 0; j < matrixTotal.length; j++) {
                                            if (matrixTotal[j]) {
                                                col[prop][i][1] += isNaN(parseFloat(matrixTotal[j][i][1])) ? 0 : parseFloat(matrixTotal[j][i][1]);
                                                n += isNaN(parseFloat(matrixTotal[j][i][1])) ? 0 : 1;
                                            }
                                        }
                                        avgArr.push([col[prop][i][0], col[prop][i][1] / n]);
                                    }
                                }

                                // write average
                                if (col[CoSI.selector] === "Durchschnitt") {
                                    col[prop] = avgArr;
                                }
                            }
                        });
                    }
                }
            });
        }

        return table;
    },

    /**
     * @description groups the table Object according to mapping.json
     * @param {object} table the unsorted table
     * @returns {object} the grouped table
     */
    groupTable (table) {
        const values = Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"),
            groups = values.reduce((res, val) => {
                var match = res.find(el => el.group === val.group);

                if (match) {
                    match.values[val.value] = {};
                    table.forEach(col => {
                        match.values[val.value][col[CoSI.selector]] = col[val.value];
                    });
                    return res;
                }
                const newGroup = {
                    group: val.group,
                    values: {
                        [val.value]: {}
                    }
                };

                table.forEach(col => {
                    newGroup.values[val.value][col[CoSI.selector]] = col[val.value];
                });

                return [...res, newGroup];
            }, []);

        return groups;
    },

    /**
     * @description gets the data features from featuresLoader
     * @returns {void}
     */
    getData: function () {
        const features = Radio.request("FeaturesLoader", "getDistrictsByScope", Radio.request("SelectDistrict", "getScope"));

        if (features) {
            this.updateTable(features);
        }
    },

    /**
     * @description appends a chart to the dashboard widgets
     * @param {string[]} props the array of attributes to visualize
     * @param {string} type the diagram type (BarGraph, Linegraph)
     * @param {string} title the label for the diagram
     * @returns {void}
     */
    createChart (props, type, title) {
        let data, graph;

        if (type === "Linegraph") {
            data = this.getLineChartData(props);

            graph = Radio.request("GraphV2", "createGraph", {
                graphType: type,
                selector: document.createElement("div"),
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: data.data,
                attrToShowArray: data.xAttrs.map(prop => {
                    return {
                        attrName: prop,
                        attrClass: prop === "Durchschnitt" ? "average" : "district"
                    };
                }),
                xAttr: "year",
                xAxisLabel: {
                    offset: 5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: "Jahr"
                },
                yAxisLabel: {
                    offset: -5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: props[0]
                },
                margin: {
                    left: 40,
                    top: 25,
                    right: 20,
                    bottom: 40
                },
                width: $(window).width() * 0.4,
                height: $(window).height() * 0.4,
                svgClass: "dashboard-graph-svg",
                selectorTooltip: ".dashboard-tooltip",
                hasLineLabel: true
            });
        }
        else if (type === "BarGraph") {
            data = this.getBarChartData(props);

            graph = Radio.request("GraphV2", "createGraph", {
                graphType: type,
                selector: document.createElement("div"),
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: data,
                attrToShowArray: props,
                xAttr: CoSI.selector,
                xAxisLabel: {
                    offset: 5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: CoSI.selector
                },
                yAxisLabel: {
                    offset: -5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: props[0]
                },
                margin: {
                    left: 40,
                    top: 25,
                    right: 20,
                    bottom: 40
                },
                width: $(window).width() * 0.4,
                height: $(window).height() * 0.4,
                svgClass: "dashboard-graph-svg",
                selectorTooltip: ".dashboard-tooltip"
            });
        }

        Radio.trigger("Dashboard", "append", graph, "#dashboard-containers", {
            id: title,
            name: title,
            glyphicon: "glyphicon-stats"
        });
    },
    createCorrelation () {
        const attrsToShow = this.getAttrsForCorrelation(),
            data = this.getCorrelationChartData(this.getAttrsForCorrelation()),
            graph = Radio.request("GraphV2", "createGraph", {
                graphType: "ScatterPlot",
                selector: document.createElement("div"),
                scaleTypeX: "linear",
                scaleTypeY: "linear",
                dynamicAxisStart: true,
                data: data,
                refAttr: CoSI.selector,
                attrToShowArray: [attrsToShow[1]],
                xAttr: attrsToShow[0],
                xAxisLabel: {
                    offset: 5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: attrsToShow[0]
                },
                yAxisLabel: {
                    offset: -5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: attrsToShow[1]
                },
                margin: {
                    left: 40,
                    top: 25,
                    right: 20,
                    bottom: 40
                },
                width: $(window).width() * 0.4,
                height: $(window).height() * 0.4,
                dotSize: 3,
                svgClass: "dashboard-graph-svg",
                selectorTooltip: ".dashboard-tooltip"
            });

        Radio.trigger("Dashboard", "append", graph, "#dashboard-containers", {
            name: `Korrelation: ${attrsToShow[0]} (x) : ${attrsToShow[1]} (y)`,
            glyphicon: "glyphicon-flash"
        });
    },
    getBarChartData (props, year = "2018") {
        return this.get("unsortedTable")
            .filter(district => district[CoSI.selector] !== "Gesamt")
            .map((district) => {
                const districtProps = {
                    [CoSI.selector]: district[CoSI.selector]
                };

                props.forEach(prop => {
                    districtProps[prop] = district[prop].filter(value => value[0] === year)[0][1];
                });

                return districtProps;
            });
    },
    getCorrelationChartData (props) {
        const correlationData = this.get("unsortedTable")[0][props[0]].reduce((data, yearValue) => {
            const year = yearValue[0];

            return [...data, ...this.get("unsortedTable")
                .filter(district => district[CoSI.selector] !== "Gesamt")
                .map((district) => {
                    let hasVal = true;
                    const districtProps = {
                        [CoSI.selector]: district[CoSI.selector],
                        year: year
                    };

                    props.forEach(prop => {
                        if (district[prop].find(value => value[0] === year)) {
                            districtProps[prop] = district[prop].filter(value => value[0] === year)[0][1];
                        }
                        else {
                            hasVal = false;
                        }
                    });

                    return hasVal ? districtProps : null;
                }).filter(district => district)];
        }, [])
            .sort((a, b) => {
                return a[props[0]] - b[props[0]];
            });

        return correlationData;
    },
    getLineChartData (props) {
        const data = this.get("unsortedTable").map((district) => {
                let districtDataToGraph = {};

                for (const prop in district) {
                    if (props.includes(prop)) {
                        districtDataToGraph = {...districtDataToGraph, ...Object.fromEntries(district[prop])};
                    }
                    else if (prop === CoSI.selector) {
                        districtDataToGraph[prop] = district[prop];
                    }
                    else {
                        delete districtDataToGraph[prop];
                    }
                }

                return districtDataToGraph;
            }),
            districts = data.map(col => col[CoSI.selector]).filter(name => name !== "Gesamt"),
            years = Object.keys(data[0]).filter(key => key !== CoSI.selector),
            map = years.map(year => {
                const yearObj = {year: year};

                data.filter(col => col[CoSI.selector] !== "Gesamt").forEach(col => {
                    yearObj[col[CoSI.selector]] = col[year];
                });

                return yearObj;
            });

        return {data: map, xAttrs: districts};
    },
    zoomAndHighlightFeature: function (district) {
        const selector = CoSI.selector;
        let extent;

        _.each(Radio.request("SelectDistrict", "getSelectedDistricts"), (feature) => {
            if (feature.getProperties()[selector] === district) {
                extent = feature.getGeometry().getExtent();
            }
        });
        if (extent) {
            Radio.trigger("Map", "zoomToExtent", extent, {padding: [20, 20, 20, 20]});
        }
    },
    filterTableView: function () {
        const filterValues = this.get("filterDropdownModel").getSelectedValues().values,
            filteredTable = filterValues.length > 0 ? this.get("tableView").map(group => {
                const filteredGroup = {
                    group: group.group,
                    values: {}
                };

                for (const value in group.values) {
                    if (filterValues.includes(value)) {
                        filteredGroup.values[value] = group.values[value];
                    }
                }

                return filteredGroup;
            }).filter(group => Object.keys(group.values).length > 0) : this.get("tableView");

        this.set("filteredTableView", filteredTable);
        this.prepareExportLink();
    },
    updateFilter: function () {
        this.get("filterDropdownModel").set("values", Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    },
    addAttrForCorrelation (attr) {
        if (this.getAttrsForCorrelation().length < 2) {
            this.getAttrsForCorrelation().push(attr);
        }
        else {
            this.set("correlationAttrs", [attr]);
        }
        this.trigger("correlationValuesUpdated");
    },
    getAttrsForCorrelation () {
        return this.get("correlationAttrs");
    },
    deleteAttrsForCorrelation () {
        this.set("correlationAttrs", []);
        this.trigger("correlationValuesUpdated");
    }
});

export default DashboardTableModel;
