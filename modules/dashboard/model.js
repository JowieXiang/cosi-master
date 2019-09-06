import Tool from "../core/modelList/tool/model";
// import GraphModel from "../tools/graph/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        graphModels: [],
        districtsLayer: {},
        propertyTree: {},
        dashboardLayers: [],
        activeFeatures: {},
        tableView: [],
        name: "",
        glyphicon: "",
        width: "60%"
    }),

    /**
     * @class DasboardModel
     * @extends Core.ModelList.Tool
     * @constructs
     * @property
     * @listens
     * @fires
     */

    initialize: function () {
        var channel = Radio.channel("Dashboard");

        this.superInitialize();

        this.listenTo(Radio.channel("gfiList"), {
            "redraw": this.test
        }, this);

        this.listenTo(Radio.channel("SelectDistrict"), {
            "districtSelectionChanged": function (selectedDistricts) {
                this.updateDistricts(selectedDistricts);
            }
        }, this);

        this.listenTo(this, {
            "change:activeFeatures": this.updateTable
        }, this);
    },
    setupTable: function (selectedDistricts) {
        const cleanTable = [];

        _.forEach(selectedDistricts, (district) => {
            cleanTable.push({stadtteil: district.getProperties().stadtteil});
        });
        this.set("tableView", cleanTable);
    },
    updateTable: function () {
        const currentTable = this.get("tableView");

        _.each(this.get("activeFeatures"), (feature) => {
            const properties = feature.getProperties();

            _.each(currentTable, (column) => {
                if (properties.stadtteil === column.stadtteil) {
                    Object.assign(column, properties);
                }
            });
        });
        this.set("tableView", this.filterTable(currentTable));
    },
    filterTable: function (table) {
        _.each(table, (col) => {
            for (const prop in col) {
                _.each(this.getPropertyTree().exclude, (exclude) => {
                    if (exclude === prop) {
                        delete col[prop];
                    }
                });
            }
        });

        return table;
    },
    updateDistricts: function (selectedDistricts) {
        this.setupTable(selectedDistricts);
        _.each(this.getPropertyTree().layerIds, (layerId) => {
            this.addLayerModel(layerId);
            this.pushDashboardLayer(Radio.request("ModelList", "getModelByAttributes", {id: layerId}));

            _.each(this.getDashboardLayers(), (layer) => {
                this.getLayerFeaturesInActiveDistricts(layer, selectedDistricts);
            });

        });
    },
    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);

        return true;
    },
    sendModification: function (layerId, status) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status
        });
    },
    getLayerFeaturesInActiveDistricts: function (layer, selectedDistricts) {
        const source = layer.get("layerSource");
        let features;

        source.on("change", (evt) => {
            features = source.getFeatures();
            features = features.filter(feature => {
                let isSelected = false;

                _.each(selectedDistricts, (district) => {
                    if (district.getProperties().stadtteil === feature.getProperties().stadtteil) {
                        isSelected = true;
                    }
                });

                return isSelected;
            });

            this.set("activeFeatures", features);
        });
    },
    createChart (props) {
        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".dashboard-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: this.get("tableView"),
            attrToShowArray: props,
            xAttr: "stadtteil",
            xAxisLabel: "Stadtteil",
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
    zoomAndHighlightFeature: function (scope) {
        let extent;

        _.each(this.get("activeFeatures"), (feature) => {
            if (feature.getProperties().stadtteil === scope) {
                extent = feature.getGeometry().getExtent();
            }
        });
        Radio.trigger("Map", "zoomToExtent", extent, {padding: [20, 20, 20, 20]});
    },
    getPropertyTree: function () {
        return this.get("propertyTree");
    },
    setDashboardLayers: function (models) {
        this.set("dashboardLayers", models);
    },
    getDashboardLayers: function () {
        return this.get("dashboardLayers");
    },
    pushDashboardLayer: function (model) {
        this.getDashboardLayers().push(model);
    },
    removeDashboardLayer: function (model) {
        this.set("dashboardLayers", this.getDashboardLayers().filter((dashboardLayer) => {
            return dashboardLayer !== model;
        }));
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardModel;