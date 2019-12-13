import Tool from "../../../../modules/core/modelList/tool/model";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";

const DashboardModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        tableView: [],
        name: "",
        glyphicon: "",
        width: "60%",
        infoScreenOpen: false,
        exportDashboardButton: {}
    }),

    /**
     * @class DasboardModel
     * @extends Tools
     * @constructs
     * @property
     */

    initialize: function () {
        this.superInitialize();
        const channel = Radio.channel("Dashboard");

        this.set("exportDashboardButton", new ExportButtonModel({
            tag: "Dashboard als PDF speichern",
            rawData: ".dashboard",
            filename: "CoSI-Dashboard-Export",
            fileExtension: "pdf"
        }));

        channel.reply({
            "dashboardOpen": function () {
                return this.get("isActive");
            }
        }, this);

        Radio.trigger("ModelList", "addAlwaysActiveTool", this);
    },
    setIsActive: function (state) {
        this.set("isActive", state);

        if (!state) {
            Radio.trigger("ContextMenu", "close");
        }
    }
});

export default DashboardModel;
