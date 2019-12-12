import Tool from "../../../../modules/core/modelList/tool/model";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import DropdownModel from "../../../../modules/snippets/dropdown/model";
import TimelineModel from "../../../../modules/tools/timeline/model";

const DashboardTableModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        tableView: [],
        filteredTableView: [],
        unsortedTable: [],
        name: "",
        glyphicon: "",
        width: "60%",
        exportButtonModel: {},
        exportFilteredButtonModel: {},
        sortKey: "",
        timelineModel: new TimelineModel(),
        filterDropdownModel: {},
        scopeLayersLoaded: 0,
        correlationAttrs: [],
        ratioAttrs: []
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
            filename: "CoSI-Dashboard-Datenblatt",
            fileExtension: "csv"
        }));
        this.set("exportFilteredButtonModel", new ExportButtonModel({
            tag: "Als CSV herunterladen (gefiltert)",
            rawData: [],
            filename: "CoSI-Dashboard-Datenblatt-(gefiltert)",
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
                Radio.trigger("Dashboard", "destroyWidgetById", "dashboard");
                this.set("sortKey", Radio.request("SelectDistrict", "getSelector"));
            }
        }, this);

        this.listenTo(Radio.channel("FeaturesLoader"), {
            "districtsLoaded": this.getData
        }, this);

        this.listenTo(channel, {
            "dashboardOpen": function () {
                this.prepareRendering();
            }
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

        CosiStorage.setItem("tableView", JSON.stringify(this.get("tableView")));
        CosiStorage.setItem("unsortedTable", JSON.stringify(this.get("unsortedTable")));
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
                                    col[prop] = prop.includes("Anteil") ? "-" : total;
                                }

                                // calculate and write average
                                if (col[this.get("sortKey")] === "Durchschnitt") {
                                    col[prop] = prop.includes("Anteil") ? "-" : total / (table.length - 2);
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

                                        if (prop.includes("Anteil")) {
                                            col[prop].push([matrixTotal[0][i][0], "-"]);
                                            avgArr.push([col[prop][i][0], "-"]);
                                        }
                                        else {
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

    /**
     * @description groups the table Object according to mapping.json
     * @param {object} table the unsorted table
     * @returns {object} the grouped table
     */
    groupTable (table) {
        const values = Radio.request("FeaturesLoader", "getAllValuesByScope", Radio.request("SelectDistrict", "getSelector")),
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
     * @returns {void}
     */
    createRatio () {
        const tableView = this.get("tableView"),
            num = this.getValueByAttribute(this.getAttrsForRatio()[0]),
            den = this.getValueByAttribute(this.getAttrsForRatio()[1]),
            ratio = JSON.parse(JSON.stringify(num)),
            calcGroup = tableView.find(group => group.group === "Berechnungen");

        for (const col in ratio) {
            for (let i = 0; i < ratio[col].length; i++) {
                ratio[col][i][1] /= den[col][i][1];
            }
            const match = this.get("unsortedTable").find(distCol => distCol[this.get("sortKey")] === col);

            match[`${this.getAttrsForRatio()[0]} / ${this.getAttrsForRatio()[1]}`] = ratio[col];
        }

        if (calcGroup) {
            calcGroup.values[`${this.getAttrsForRatio()[0]} / ${this.getAttrsForRatio()[1]}`] = ratio;
        }
        else {
            tableView.push({
                group: "Berechnungen",
                values: {
                    [`${this.getAttrsForRatio()[0]} / ${this.getAttrsForRatio()[1]}`]: ratio
                }
            });
        }

        this.filterTableView();
    },

    getValueByAttribute (attr) {
        const group = this.get("tableView").find(g => {
            for (const val in g.values) {
                if (val === attr) {
                    return true;
                }
            }
            return false;
        });

        return group ? group.values[attr] : null;
    },

    /**
     * @description appends a chart to the dashboard widgets
     * @param {string[]} props the array of attributes to visualize
     * @param {string} type the diagram type (BarGraph, Linegraph)
     * @param {string} title the label for the diagram
     * @param {boolean} dynamicAxisStart is the y-Axis scaled?
     * @param {number} year the year to create the bar graph from
     * @fires Dashboard#RadioTriggerAppend
     * @returns {void}
     */
    createChart (props, type, title, dynamicAxisStart = false, year = null) {
        let data, graph;
        const svgParent = document.createElement("div");

        svgParent.className = "svg-container";

        if (type === "Linegraph") {
            data = this.getLineChartData(props);

            graph = Radio.request("GraphV2", "createGraph", {
                graphType: type,
                graphTitle: title,
                selector: svgParent,
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: data.data,
                attrToShowArray: data.xAttrs,
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
                hasLineLabel: true,
                hasContextMenu: true,
                dynamicAxisStart: dynamicAxisStart,
                attribution: {
                    x: 0,
                    y: $(window).height() * 0.4,
                    lineHeight: 10,
                    fontSize: "7px",
                    anchor: "start",
                    text: ["Datum: " + new Date().toLocaleDateString("de-DE"), "Quelle: Cockpit für Städtische Infrastruktur (CoSI)"]
                }
            });
        }
        else if (type === "BarGraph") {
            data = this.getBarChartData(props, year);

            if (Object.keys(data[0]).length <= 1) {
                return Radio.trigger("Alert", "alert", `Für das Jahr ${year} sind leider keine Werte zu ${title} verfügbar.`);
            }

            graph = Radio.request("GraphV2", "createGraph", {
                graphType: type,
                graphTitle: title,
                selector: svgParent,
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: data,
                attrToShowArray: props,
                xAttr: this.get("sortKey"),
                xAxisLabel: {
                    offset: 5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: this.get("sortKey")
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
                hasContextMenu: true,
                attribution: {
                    x: 0,
                    y: $(window).height() * 0.4,
                    lineHeight: 10,
                    fontSize: "7px",
                    anchor: "start",
                    text: ["Datum: " + new Date().toLocaleDateString("de-DE"), "Quelle: Cockpit für Städtische Infrastruktur (CoSI)"]
                }
            });
        }

        Radio.trigger("Dashboard", "append", graph, "#dashboard-containers", {
            id: title,
            name: `${title} (${year})`,
            glyphicon: "glyphicon-stats",
            width: $("#dashboard-containers").width() - 50 + "px",
            scalable: true,
            focus: true
        });
    },

    /**
     * @description appends a scatterplot to the dashboard widgets based on the selected columns
     * @param {boolean} dynamicAxisStart is the y-Axis scaled?
     * @fires Dashboard#RadioTriggerAppend
     * @returns {void}
     */
    createCorrelation (dynamicAxisStart = true) {
        var svgParent = document.createElement("div");

        svgParent.className = "svg-container";

        const attrsToShow = this.getAttrsForRatio(),
            data = this.getCorrelationChartData(this.getAttrsForRatio()),
            graph = Radio.request("GraphV2", "createGraph", {
                graphType: "ScatterPlot",
                graphTitle: `Korrelation: ${attrsToShow[0]} (y) : ${attrsToShow[1]} (x)`,
                selector: svgParent,
                scaleTypeX: "linear",
                scaleTypeY: "linear",
                dynamicAxisStart: dynamicAxisStart,
                data: data,
                refAttr: this.get("sortKey"),
                attrToShowArray: [attrsToShow[0]],
                xAttr: attrsToShow[1],
                xAxisLabel: {
                    offset: 5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: attrsToShow[1]
                },
                yAxisLabel: {
                    offset: -5,
                    textAnchor: "middle",
                    fill: "#000",
                    fontSize: 10,
                    label: attrsToShow[0]
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
                selectorTooltip: ".dashboard-tooltip",
                hasContextMenu: true,
                attribution: {
                    x: 0,
                    y: $(window).height() * 0.4,
                    lineHeight: 10,
                    fontSize: "7px",
                    anchor: "start",
                    text: ["Datum: " + new Date().toLocaleDateString("de-DE"), "Quelle: Cockpit für Städtische Infrastruktur (CoSI)"]
                }
            });

        Radio.trigger("Dashboard", "append", graph, "#dashboard-containers", {
            name: `Korrelation: ${attrsToShow[0]} (y) : ${attrsToShow[1]} (x)`,
            glyphicon: "glyphicon-flash",
            width: $("#dashboard-containers").width() - 50 + "px",
            scalable: true,
            focus: true
        });
    },
    getBarChartData (props, year = "2018") {
        return this.get("unsortedTable")
            .filter(district => district[this.get("sortKey")] !== "Gesamt")
            .map((district) => {
                const districtProps = {
                    [this.get("sortKey")]: district[this.get("sortKey")]
                };

                props.forEach(prop => {
                    if (district[prop].find(value => value[0] === year)) {
                        districtProps[prop] = district[prop].find(value => value[0] === year)[1];
                    }
                });

                return districtProps;
            });
    },
    getCorrelationChartData (props) {
        const correlationData = this.get("unsortedTable")[0][props[0]].reduce((data, yearValue) => {
            const year = yearValue[0];

            return [...data, ...this.get("unsortedTable")
                .filter(district => district[this.get("sortKey")] !== "Gesamt")
                .map((district) => {
                    let hasVal = true;
                    const districtProps = {
                        [this.get("sortKey")]: district[this.get("sortKey")],
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
                        districtDataToGraph = {...districtDataToGraph, ..._.object(district[prop])};
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
        this.prepareRendering();
    },
    updateFilter: function () {
        this.get("filterDropdownModel").set("values", Radio.request("FeaturesLoader", "getAllValuesByScope", Radio.request("SelectDistrict", "getSelector")));
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    },
    addAttrForRatio (attr, i) {
        this.getAttrsForRatio()[i] = attr;
        this.trigger("ratioValuesUpdated");
    },
    getAttrsForRatio () {
        return this.get("ratioAttrs");
    },
    deleteAttrsForRatio () {
        this.set("ratioAttrs", []);
        this.trigger("ratioValuesUpdated");
    }
});

export default DashboardTableModel;
