import Tool from "../core/modelList/tool/model";
import GraphModel from "../tools/graph/model";
import {TileLayer, VectorLayer} from "ol/layer";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        graphModels: [],
        propertyTree: {}
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
                this.updateDistrictsTable(selectedDistricts);
            }
        }, this);
    },
    updateDistrictsTable: function (selectedDistricts) {
        _.each(_.allKeys(this.getPropertyTree()), (layerId) => {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                features = layer.getSource().getFeatures();

            console.log(features);
        });
    },
    getPropertyTree: function () {
        return this.get("propertyTree");
    },
    test: function () {
        console.log("gfi updated");
    }
});

export default DashboardModel;