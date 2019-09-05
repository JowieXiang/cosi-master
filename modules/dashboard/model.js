import Tool from "../core/modelList/tool/model";
import GraphModel from "../tools/graph/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        graphModels: [],
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
        this.trigger("tableReady");
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
    test: function () {
        console.log("gfi updated");
    }
});

export default DashboardModel;