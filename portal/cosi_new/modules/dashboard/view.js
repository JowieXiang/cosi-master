import Template from "text-loader!./template.html";
import "./style.less";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "mousedown .drag-bar": "dragStart"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
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

        if (!Radio.request("InfoScreen", "getIsWindowOpen")) {
            Radio.trigger("Sidebar", "append", this.$el);
            Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));
        }

        this.delegateEvents();
        Radio.trigger("Dashboard", "dashboardOpen");

        return this;
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
    }
});

export default DashboardView;
