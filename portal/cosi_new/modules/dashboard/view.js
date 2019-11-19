import Template from "text-loader!./template.html";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "click #help": "showHelp",
        "mousedown .drag-bar": "dragStart",
        "click .tool-name": "dashboardInfo"
    },
    initialize: function () {
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
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        Radio.request("Dashboard", "getChildren").forEach(widget => {
            widget.render();
        });

        console.log(Radio.request("Dashboard", "getChildren"));

        this.delegateEvents();
        Radio.trigger("Dashboard", "dashboardOpen");

        return this;
    },
    dashboardInfo () {
        console.log(Radio.request("Dashboard", "getChildren"));
    },
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },
    dragStart: function () {
        this.isDragging = true;
        this.$el.find(".drag-bar").addClass("dragging");
    },
    dragMove: function (event) {
        if (this.isDragging) {
            const newWidth = (((window.innerWidth - event.clientX) / window.innerWidth) * 100).toFixed(2) + "%";

            Radio.trigger("Sidebar", "resize", newWidth);
        }
    },
    dragEnd: function () {
        this.isDragging = false;
        this.$el.find(".drag-bar").removeClass("dragging");
    },
    showHelp: function () {
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    },
});

export default DashboardView;
