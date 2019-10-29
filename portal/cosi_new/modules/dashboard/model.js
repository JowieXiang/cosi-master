import Tool from "../../../../modules/core/modelList/tool/model";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
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
     */

    initialize: function () {
        this.superInitialize();
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardModel;
