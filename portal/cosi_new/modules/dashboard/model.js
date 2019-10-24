import Tool from "../../../../modules/core/modelList/tool/model";
import TimelineModel from "../../../../modules/tools/timeline/model";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        selectedDistricts: [],
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
     */

    initialize: function () {
        this.superInitialize();
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardModel;
