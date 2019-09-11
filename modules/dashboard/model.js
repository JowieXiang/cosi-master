import Tool from "../core/modelList/tool/model";
import ExportButtonModel from "../snippets/exportButton/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";

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
        sortKey: ""
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
            cleanTable.push({[this.get("sortKey")]: district.getProperties()[this.getPropertyTree()[this.getScope()].selector]});
        });
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
            const gfiAttr = layer.get("gfiAttributes");
            let properties = Radio.request("Util", "renameKeys", gfiAttr, feature.getProperties());

            if (gfiAttr !== "showAll" && gfiAttr !== "ignore") {
                properties = Radio.request("Util", "pickKeyValuePairs", properties, Object.values(layer.get("gfiAttributes")));
            }

            _.each(currentTable, (column, i) => {
                if (properties[this.get("sortKey")] === column[this.get("sortKey")]) {
                    for (const key in properties) {
                        if (!this.getPropertyTree()[this.getScope()].exclude.includes(key)) {
                            properties[`${key} - ${layer.get("name")}`] = properties[key];
                            delete properties[key];
                        }
                    }
                    currentTable[i] = Object.assign(column, properties);
                }
            });
        });
        this.set("tableView", this.filterTable(currentTable));

        // Update Export Link
        this.get("exportButtonModel").set("rawData", this.get("tableView"));
        this.get("exportButtonModel").prepareForExport();
    },

    /**
     * @description Filters the table for excluded columns (e.g. the geometry)
     * @param {Object} table
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
        var layerId = this.getPropertyTree()[this.getScope()].layerIds[0];

        this.addLayerModel(layerId);

        const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            sortKey = layer.get("gfiAttributes")[this.getPropertyTree()[this.getScope()].selector];

        if (sortKey === "showAll" || sortKey === "ignore" || !sortKey) {
            this.set("sortKey", this.getPropertyTree()[this.getScope()].selector);
        }
        else {
            this.set("sortKey", sortKey);
        }
    },
    createChart (props) {
        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".dashboard-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: this.get("tableView"),
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
            width: $(window).width() * 0.6,
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
                if (!props.includes(prop) && prop !== "stadtteil") {
                    delete districtDataToGraph[prop];
                }
            }

            return districtDataToGraph;
        });

        return data;
    },
    zoomAndHighlightFeature: function (district) {
        let extent;

        _.each(this.get("activeFeatures"), (feature) => {
            if (feature.getProperties()[this.getScope()] === district) {
                extent = feature.getGeometry().getExtent();
            }
        });
        Radio.trigger("Map", "zoomToExtent", extent, {padding: [20, 20, 20, 20]});
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
