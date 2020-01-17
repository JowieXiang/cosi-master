import Template from "text-loader!./template.html";
import InfoTemplate from "text-loader!./info.html";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";
import "./style.less";

const DashboardView = Backbone.View.extend(/** @lends DashboardView.prototype */{
    events: {
        "click .close": "close",
        "click #help": "showHelp",
        "mousedown .drag-bar": "dragStart",
        "touchstart .drag-bar": "dragStart",
        "click #reset-button": "resetWidgets"
    },

    /**
     * initializes the dashboards View, adds event listeners and handles the Dashboard on the InfoScreen
     * @class DashboardView
     * @extends Backbone.View
     * @memberof Tools.Dashboard
     * @constructs
     * @listens General#RadioTriggerLoaded
     */
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportDashboardButton")});

        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive & !this.model.get("infoScreenOpen")) {
                    this.render();
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            }
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }

        window.addEventListener("mouseup", () => {
            this.dragEnd();
        });
        window.addEventListener("mousemove", (event) => {
            this.dragMove(event);
        });
        window.addEventListener("touchend", () => {
            this.dragEnd();
        });
        window.addEventListener("touchmove", (event) => {
            this.dragMove(event);
        });

        this.listenTo(Radio.channel("General"), {
            "loaded": function () {
                if (Radio.request("InfoScreen", "getIsInfoScreen")) {
                    setTimeout(() => {
                        Radio.request("Dashboard", "getChildren").forEach(widget => {
                            widget.render();
                        });
                    }, 2000);
                }
            }
        }, this);
    },
    id: "dashboard-view",
    className: "dashboard",
    model: {},
    exportButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    isDragging: false,
    startX: 0,

    /**
     * append the dashboard to the Sidebar
     * @fires Dashboard#RadioTriggerDashboardOpen
     * @returns {Backbone.View} returns this
     */
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.$el.find("#print-button").html(this.exportButtonView.render().el);

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        Radio.request("Dashboard", "getChildren").forEach(widget => {
            widget.render();
        });

        this.delegateEvents();
        Radio.trigger("Dashboard", "dashboardOpen");

        return this;
    },

    /**
     * closes the Dashboard / Sidebar
     * @returns {void}
     */
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },

    /**
     * handles the drag Start event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragStart: function (event) {
        event.preventDefault();
        this.isDragging = true;
        this.$el.find(".drag-bar").addClass("dragging");
    },

    /**
     * handles the drag move event to resize the sidebar
     * @param {*} event the DOM-event
     * @fires Sidebar#RadioTriggerResize
     * @returns {void}
     */
    dragMove: function (event) {
        if (this.isDragging) {
            const eventX = event.type === "touchmove" ? event.touches[0].clientX : event.clientX,
                newWidth = (((window.innerWidth - eventX) / window.innerWidth) * 100).toFixed(2) + "%";

            Radio.trigger("Sidebar", "resize", newWidth);
        }
    },

    /**
     * handles the drag End event to resize the sidebar
     * @param {*} event the DOM-event
     * @returns {void}
     */
    dragEnd: function () {
        this.isDragging = false;
        this.$el.find(".drag-bar").removeClass("dragging");
    },

    /**
     * opens the help window
     * @fires Alert#RadioTriggerAlert
     * @returns {void}
     */
    showHelp: function () {
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    },

    /**
     * removes all widgets on the dashboard apart from the table
     * @fires Dashboard#RadioRequestGetChildren
     * @returns {void}
     */
    resetWidgets () {
        Radio.request("Dashboard", "getChildren").forEach(widget => {
            if (widget.getId() !== "dashboard") {
                widget.removeWidget();
            }
        });
    }
});

export default DashboardView;
