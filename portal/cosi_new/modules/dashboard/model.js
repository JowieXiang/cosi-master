import Tool from "../../../../modules/core/modelList/tool/model";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        tableView: [],
        name: "",
        glyphicon: "",
        width: "60%",
        infoScreenOpen: false
    }),

    /**
     * @class DasboardModel
     * @extends Core.ModelList.Tool
     * @constructs
     * @property
     */

    initialize: function () {
        this.superInitialize();

        const channel = Radio.channel("Dashboard");

        channel.reply({
            "dashboardOpen": function () {
                return this.get("isActive");
            }
        }, this);
    },
    setIsActive: function (state) {
        this.set("isActive", state);
    }
});

export default DashboardModel;
