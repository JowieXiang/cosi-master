import Tool from "../core/modelList/tool/model";
import ExportButtonModel from "../snippets/exportButton/model";
import DropdownModel from "../snippets/dropdown/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";
import TimelineModel from "../tools/timeline/model";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        graphModels: [],
        selectedDistricts: [],
        propertyTree: {},
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
     * @class DasboardModel
     * @extends Core.ModelList.Tool
     * @constructs
     * @property
     * @listens SelectDistrict#RadioTriggerDistrictSelectionChanged
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
            displayName: "Filter",
            values: [],
            snippetType: "dropdown",
            isMultiple: true,
            liveSearch: true
        }));

        this.listenTo(this.get("filterDropdownModel"), {
            "valuesChanged": this.filterTableView
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "districtSelectionChanged": function () {
                this.set("scope", Radio.request("SelectDistrict", "getScope"));
                this.setSortKey();
            }
        }, this);

        this.listenTo(this, {
            "change:isActive": this.getData
        });
    },

    /**
     * @description Concats the new feature data with the exisiting data-table and triggers the rendering
     * @param {Array<ol.feature>} features - the features that contain the info to display
     * @param {string} layerId - the ID of the LayerModel of the data
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
        
        // Todo: GFI mapping
        // Add total and mean values and filter table for excluded properties
        this.set("tableView", this.calculateTotalAndMean(Radio.request("Timeline", "fillUpTimelineGaps", table, "Array")));

        // Update the filter dropdown list
        this.updateFilter();

        // Update Export Link
        this.get("exportButtonModel").set("rawData", this.get("tableView"));
        this.get("exportButtonModel").prepareForExport();
    },

    /**
     * @description Filters the table for excluded columns (e.g. the geometry)
     * @param {Object} table the existing table
     * @returns {Object} the resulting table
     * @deprecated
     */
    filterTable: function (table) {
        _.each(table, (col) => {
            for (const prop in col) {
                _.each(this.getPropertyTree()[this.getScope()].exclude, (exclude) => {
                    if (exclude === prop) {
                        delete col[prop];
                    }
                });
            }
        });

        return table;
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

    getData: function () {
        const features = Radio.request("FeaturesLoader", "getDistrictsByType", Radio.request("SelectDistrict", "getScope"));

        this.updateTable(features);
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

    /**
     * @description Listens to the LayerModel for all data features to be loaded and checks if they belong to the selected scope
     * @param {string} id
     * @param {Array<ol.features>} features
     * @listens LayerRadio#FeaturesLoaded
     */

    getDashboardLayerFeatures: function (id, features) {
        if (this.getPropertyTree()[this.getScope()].layerIds.includes(id)) {
            this.getLayerFeaturesInActiveDistricts(features, id);
        }
    },
    getLayerFeaturesInActiveDistricts: function (features, layerId) {
        const districtFeatures = features.filter((feature) => {
            return this.get("selectedDistricts").includes(feature.getProperties()[this.getPropertyTree()[this.getScope()].selector]);
        });

        this.updateTable(districtFeatures, layerId);
    },
    setSortKey: function () {
        this.set("sortKey", this.getPropertyTree()[this.getScope()].selector);
    },
    createChart (props, type) {
        if (type === "Linegraph") {
            const data = this.getChartData(props);

            Radio.trigger("Graph", "createGraph", {
                graphType: type,
                selector: ".dashboard-graph",
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
                svgClass: "dashboard-grapg-svg",
                selectorTooltip: ".graphTooltip"
            });
        }
        else if (type === "BarGraph") {
            Radio.trigger("Graph", "createGraph", {
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
                svgClass: "dashboard-grapg-svg",
                selectorTooltip: ".graphTooltip"
            });
        }

        /**
         * GraphConfig Options:
         * graphType = graphConfig.graphType,
         * selector = graphConfig.selector,
         * scaleTypeX = graphConfig.scaleTypeX,
         * scaleTypeY = graphConfig.scaleTypeY,
         * data = graphConfig.data,
         * xAttr = graphConfig.xAttr,
         * xAxisLabel = graphConfig.xAxisLabel
         * yAxisLabel = graphConfig.yAxisLabel
         * attrToShowArray = graphConfig.attrToShowArray,
         * margin = graphConfig.margin,
         * width = graphConfig.width
         * height = graphConfig.height
         * xAxisTicks = graphConfig.xAxisTicks,
         * yAxisTicks = graphConfig.yAxisTicks,
         * svgClass = graphConfig.svgClass,
         * selectorTooltip
        */
    },
    getChartData (props) {
        const data = this.get("tableView").map((district) => {
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
        let extent,
            selector = this.getPropertyTree()[this.getScope()];

        // Quick and dirty for Statistische Gebiete
        if (this.getScope() === "Statistische Gebiete") {
            selector = "statgebiet";
        }

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
        const properties = _.allKeys(this.get("tableView")[0]);

        this.get("filterDropdownModel").set("values", properties.filter(prop => prop !== "gfi" && prop !== this.getPropertyTree()[this.getScope()].selector));
        this.trigger("updateProperties");
    },
    getScope: function () {
        return this.get("scope");
    },
    getPropertyTree: function () {
        return this.get("propertyTree");
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardModel;
