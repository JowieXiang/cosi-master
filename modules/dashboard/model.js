import Tool from "../core/modelList/tool/model";
// import ExportButtonModel from "../snippets/exportButton/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        graphModels: [],
        districtsLayer: {},
        propertyTree: {},
        dashboardLayers: [],
        tableView: [],
        name: "",
        glyphicon: "",
        width: "60%",
        exportButtonModel: {}
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

        // this.set("exportButtonModel", new ExportButtonModel({
        //     tag: "Als CSV herunterladen",
        //     rawData: this.get("tableView"),
        //     filename: "CoSI-Dashboard-Export",
        //     fileExtension: "csv"
        // }));

        this.listenTo(Radio.channel("SelectDistrict"), {
            "districtSelectionChanged": function (selectedDistricts) {
                this.updateDistricts(selectedDistricts);
            }
        }, this);

    },
    setupTable: function (selectedDistricts) {
        const cleanTable = [];

        _.forEach(selectedDistricts, (district) => {
            cleanTable.push({Stadtteil: district.getProperties().stadtteil});
        });
        this.set("tableView", cleanTable);
    },
    updateTable: function (features, layer) {
        const currentTable = this.get("tableView");

        _.each(features, (feature) => {
            let properties = Radio.request("Util", "renameKeys", layer.get("gfiAttributes"), feature.getProperties());

            properties = Radio.request("Util", "pickKeyValuePairs", properties, Object.values(layer.get("gfiAttributes")));
            _.each(currentTable, (column) => {
                if (properties.Stadtteil === column.Stadtteil) {
                    Object.assign(column, properties);
                }
            });
        });
        console.info(this.filterTable(currentTable));
        this.set("tableView", this.filterTable(currentTable));

        // Update Export Link
        // this.get("exportButtonModel").set("rawData", this.get("tableView"));
        // this.get("exportButtonModel").prepareForExport();
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

        source.on("change", () => {
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

            this.updateTable(features, layer);
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
