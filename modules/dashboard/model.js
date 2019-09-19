import Tool from "../core/modelList/tool/model";
import ExportButtonModel from "../snippets/exportButton/model";
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
        timelineModel: new TimelineModel()
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

        this.listenTo(Radio.channel("SelectDistrict"), {
            "districtSelectionChanged": function (selectedDistricts) {
                this.updateDistricts(selectedDistricts);
            }
        }, this);

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (id, features) {
                this.getDashboardLayerFeatures(id, features);
            }
        }, this);
    },

    /**
     * @description Creates a new Obj for the dashboard-table, as Array<Object> with the district-names as columns
     * @param {ol.feature} selectedDistricts - the features of the districts (Stadtteile or stat. Gebiete) which host the geom. and name of the resp. area
     */

    setupTable: function (selectedDistricts) {
        const cleanTable = [];

        this.setSortKey();

        _.forEach(selectedDistricts, (district) => {
            cleanTable.push({[this.get("sortKey")]: district.getProperties()[this.get("sortKey")]});
        });

        // Set columns for average and total values
        cleanTable.push({[this.get("sortKey")]: "Gesamt"});
        cleanTable.push({[this.get("sortKey")]: "Durchschnitt"});

        this.set("tableView", cleanTable);
    },

    /**
     * @description Concats the new feature data with the exisiting data-table and triggers the rendering
     * @param {Array<ol.feature>} features - the features that contain the info to display
     * @param {string} layerId - the ID of the LayerModel of the data
     */

    updateTable: function (features, layerId) {
        const currentTable = this.get("tableView"),
            layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId});

        _.each(features, (feature) => {
            let properties = feature.getProperties(),
                gfiAttr = layer.get("gfiAttributes");

            _.each(currentTable, (column, i) => {
                if (properties[this.get("sortKey")] === column[this.get("sortKey")]) {
                    properties = Radio.request("Timeline", "createTimelineTable", [properties])[0];
                    currentTable[i] = Object.assign(column, properties);

                    if (gfiAttr !== "showAll") {
                        if (currentTable[i].gfi) {
                            currentTable[i].gfi = Object.assign(currentTable[i].gfi, gfiAttr);
                        }
                        else {
                            currentTable[i].gfi = gfiAttr;
                        }
                    }
                }
            });
        });

        // Add total and mean values and filter table for excluded properties
        this.set("tableView", this.calculateTotalAndMean(this.filterTable(currentTable)));

        // Update Export Link
        this.get("exportButtonModel").set("rawData", this.get("tableView"));
        this.get("exportButtonModel").prepareForExport();
    },

    /**
     * @description Filters the table for excluded columns (e.g. the geometry)
     * @param {Object} table the existing table
     * @returns {Object} the resulting table
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
                            totalArr = [];

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
                                        col[prop].push([matrixTotal[0][i][0], 0]);
                                        for (let j = 0; j < matrixTotal.length; j++) {
                                            col[prop][i][1] += parseFloat(matrixTotal[j][i][1]);
                                        }
                                        totalArr.push([col[prop][i][0], col[prop][i][1] / (table.length - 2)]);
                                    }
                                }

                                // write average
                                if (col[this.get("sortKey")] === "Durchschnitt") {
                                    col[prop] = totalArr;
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
     * @description Updates the district selection and pushes the district-features
     * @param {Array<ol.feature>} selectedDistricts
     */

    updateDistricts: function (selectedDistricts) {
        const scope = Radio.request("SelectDistrict", "getScope");

        // Temporary: replace "statgebiete"-key with "stat_gebiete" until replacement data provided
        if (scope === "Statistische Gebiete") {
            selectedDistricts.forEach((district) => {
                district.setProperties({
                    "stat_gebiet": district.getProperties().statgebiet
                });
            });
        }

        this.set("scope", scope);
        this.set("selectedDistricts", selectedDistricts.map(features => features.getProperties()[this.getPropertyTree()[this.getScope()].selector]));

        this.setupTable(selectedDistricts);
        _.each(this.getPropertyTree()[this.getScope()].layerIds, (layerId) => {
            this.addLayerModel(layerId);
        });
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
        if (this.getScope() !== "") {
            if (this.getPropertyTree()[this.getScope()].layerIds.includes(id)) {
                this.getLayerFeaturesInActiveDistricts(features, id);
            }
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
    createChart (props) {
        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
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
            svgClass: "dashboard-grapg-svg"
        });

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
        */
    },
    getChartData (props) {
        const data = this.get("tableView").map((district) => {
            const districtDataToGraph = district;

            for (const prop in districtDataToGraph) {
                if (!props.includes(prop) && prop !== this.getPropertyTree()[this.getScope()].selector) {
                    delete districtDataToGraph[prop];
                }
            }

            return districtDataToGraph;
        });

        return data;
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
