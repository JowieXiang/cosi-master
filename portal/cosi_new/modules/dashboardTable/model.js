import Tool from "../../../../modules/core/modelList/tool/model";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import TimelineModel from "../../../../modules/tools/timeline/model";

const DashboardTableModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        tableView: [],
        name: "",
        glyphicon: "",
        width: "60%",
        exportButtonModel: {},
        scope: "",
        sortKey: "",
        timelineModel: new TimelineModel(),
        filterDropdownModel: {},
        scopeLayersLoaded: 0
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
        this.set("scope", Radio.request("SelectDistrict", "getScope"));

        this.set("exportButtonModel", new ExportButtonModel({
            tag: "Als CSV herunterladen",
            rawData: this.get("tableView"),
            filename: "CoSI-Dashboard-Export",
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

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": function () {
                this.set("scope", Radio.request("SelectDistrict", "getScope"));
                this.set("sortKey", Radio.request("SelectDistrict", "getSelector"));
            }
        }, this);

        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": this.getData
        }, this);

        this.listenTo(channel, {
            "dashboardOpen": this.prepareRendering
        }, this);

        this.listenTo(this, {
            "change:tableView": this.prepareRendering
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
                distCol = newTable.find(col => col[this.get("sortKey")] === properties[this.get("sortKey")]);

            if (distCol) {
                return newTable.map((col) => {
                    if (col[this.get("sortKey")] === properties[this.get("sortKey")]) {
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
        }
    },

    /**
     * @description prepares all nested views for rendering and triggers view
     * @returns {void}
     */
    prepareRendering: function () {
        // Update the filter dropdown list
        this.updateFilter();

        // Update Export Link
        this.get("exportButtonModel").set("rawData", this.get("tableView"));
        this.get("exportButtonModel").prepareForExport();

        this.trigger("isReady");
    },

    /**
     * @description sums up and averages all rows of the table
     * @param {Object} table the existing table (already filtered)
     * @returns {Object} the resulting table
     */
    calculateTotalAndMean: function (table) {
        if (table) {
            const properties = _.allKeys(table[0]);

            table.push({[this.get("sortKey")]: "Gesamt"}, {[this.get("sortKey")]: "Durchschnitt"});
            _.each(properties, (prop) => {
                if (prop !== this.get("sortKey")) {

                    // Check whether values in row are numbers or Arrays of numbers
                    if (!isNaN(parseFloat(table[0][prop])) && !Array.isArray(table[0][prop])) {
                        let total = 0;

                        // Add values for all columns
                        _.each(table, (col) => {
                            if (col[this.get("sortKey")] !== "Gesamt" && col[this.get("sortKey")] !== "Durchschnitt") {
                                total += parseFloat(col[prop]);
                            }
                            if (total !== 0) {

                                // write sum
                                if (col[this.get("sortKey")] === "Gesamt") {
                                    col[prop] = total;
                                }

                                // calculate and write average
                                if (col[this.get("sortKey")] === "Durchschnitt") {
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
                            if (col[this.get("sortKey")] !== "Gesamt" && col[this.get("sortKey")] !== "Durchschnitt") {
                                matrixTotal.push(col[prop]);
                            }
                            if (matrixTotal.length > 0) {
                                // sum up all columns of timeline and calculate average on the fly
                                if (col[this.get("sortKey")] === "Gesamt") {
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
                                if (col[this.get("sortKey")] === "Durchschnitt") {
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

    groupTable (table) {
        const values = Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"),
            groups = values.reduce((res, val) => {
                var match = res.find(el => el.group === val.group);

                if (match) {
                    match.values[val.value] = {};
                    table.forEach(col => {
                        match.values[val.value][col[this.get("sortKey")]] = col[val.value];
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
                    newGroup.values[val.value][col[this.get("sortKey")]] = col[val.value];
                });

                return [...res, newGroup];
            }, []);

        return groups;
    },

    getData: function () {
        const features = Radio.request("FeaturesLoader", "getDistrictsByScope", Radio.request("SelectDistrict", "getScope"));

        if (features) {
            this.updateTable(features);
        }
    },

    /**
     * loades the relevant layers for the dashboard, according to scope
     * @param {string} layerId
     */

    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);
    },
    sendModification: function (layerId, status) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status
        });
    },
    createChart (props, type, title) {
        let graph;

        if (type === "Linegraph") {
            const data = this.getChartData(props);

            graph = Radio.request("Graph", "createGraph", {
                graphType: type,
                selector: document.createElement("div"),
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: data.data,
                attrToShowArray: data.xAttrs,
                xAttr: "year",
                xAxisLabel: "year",
                yAxisLabel: props[0],
                margin: {
                    left: 40,
                    top: 25,
                    right: 20,
                    bottom: 40
                },
                width: $(window).width() * 0.4,
                height: $(window).height() * 0.4,
                svgClass: "dashboard-graph-svg",
                selectorTooltip: ".graphTooltip"
            });
        }
        else if (type === "BarGraph") {
            graph = Radio.request("Graph", "createGraph", {
                graphType: type,
                selector: ".dashboard-graph",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: this.get("tableView").filter(col => col[this.get("sortKey")] !== "Gesamt"),
                attrToShowArray: props,
                xAttr: this.get("sortKey"),
                xAxisLabel: this.get("sortKey"),
                yAxisLabel: props[0],
                margin: {
                    left: 40,
                    top: 25,
                    right: 20,
                    bottom: 40
                },
                width: $(window).width() * 0.4,
                height: $(window).height() * 0.4,
                svgClass: "dashboard-graph-svg",
                selectorTooltip: ".graphTooltip"
            });
        }

        Radio.trigger("Dashboard", "append", graph, "#dashboard-containers", {
            id: title,
            name: title,
            glyphicon: "glyphicon-info-sign"
        });
    },
    getChartData (props) {
        const data = this.get("unsortedTable").map((district) => {
                let districtDataToGraph = {};

                for (const prop in district) {
                    if (props.includes(prop)) {
                        districtDataToGraph = {...districtDataToGraph, ...Object.fromEntries(district[prop])};
                    }
                    else if (prop === this.get("sortKey")) {
                        districtDataToGraph[prop] = district[prop];
                    }
                    else {
                        delete districtDataToGraph[prop];
                    }
                }

                return districtDataToGraph;
            }),
            districts = data.map(col => col[this.get("sortKey")]).filter(name => name !== "Gesamt"),
            years = Object.keys(data[0]).filter(key => key !== this.get("sortKey")),
            map = years.map(year => {
                const yearObj = {year: year};

                data.filter(col => col[this.get("sortKey")] !== "Gesamt").forEach(col => {
                    yearObj[col[this.get("sortKey")]] = col[year];
                });

                return yearObj;
            });

        return {data: map, xAttrs: districts};
    },
    zoomAndHighlightFeature: function (district) {
        const selector = this.get("sortKey");
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
        this.trigger("tableViewFilter", this.get("filterDropdownModel").getSelectedValues());
    },
    updateFilter: function () {
        this.get("filterDropdownModel").set("values", Radio.request("FeaturesLoader", "getAllValuesByScope", "statgebiet"));
        this.trigger("updateProperties");
    },
    getScope: function () {
        return this.get("scope");
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardTableModel;
