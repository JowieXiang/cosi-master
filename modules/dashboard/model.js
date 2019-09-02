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
        tableView: {}
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
        const newTable = {};

        _.each(selectedDistricts, (feature) => {
            const districtName = feature.getProperties().stadtteil;

            newTable[districtName] = {};
        });
        this.set("tableView", newTable);
    },
    updateTable: function () {
        const currentTable = this.get("tableView");

        _.each(this.get("activeFeatures"), (feature) => {
            const properties = feature.getProperties();

            for (const property in properties) {
                currentTable[properties.stadtteil][property] = properties[property];
            }

            this.set("tableView", currentTable);
        });
    },
    updateDistricts: function (selectedDistricts) {
        this.setupTable(selectedDistricts);
        _.each(_.allKeys(this.getPropertyTree()), (layerId) => {
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