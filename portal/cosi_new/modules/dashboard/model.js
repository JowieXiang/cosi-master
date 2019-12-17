import Tool from "../../../../modules/core/modelList/tool/model";
import ExportButtonModel from "../../../../modules/snippets/exportButton/model";

const DashboardModel = Tool.extend({ /** @lends dasboardModel.prototype */
    defaults: _.extend({}, Tool.prototype.defaults, {
        name: "",
        glyphicon: "",
        width: "60%",
        infoScreenOpen: false,
        exportDashboardButton: {}
    }),

    /**
     * @class DashboardModel
     * @extends Tool
     * @memberof Dashboard
     * @constructs
     * @property {string} width DOM width of dashboard sidebar
     * @property {boolean} infoScreenOpen retrieved state of 2nd screen from localStorage
     * @property {Backbone.Model} exportDashboardButton snippet for constructing the PDF-Download
     * @fires ModelList#RadioTriggerAddAlwaysActiveTool
     * @listens Dashboard#RadioRequestDashboardOpen
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

    /**
     * Sets the Dashboard active and removes ContextMenu on deactivate
     * @param {boolean} state Dashboard active state
     * @returns {void}
     */
    setIsActive: function (state) {
        this.set("isActive", state);

        if (!state) {
            Radio.trigger("ContextMenu", "close");
        }
    }
});

export default DashboardModel;
