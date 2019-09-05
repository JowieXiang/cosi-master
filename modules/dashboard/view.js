import Template from "text-loader!./template.html";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "click .district": "zoomToFeature"
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
    },
    id: "dashboard-view",
    className: "dashboard",
    model: {},
    template: _.template(Template),
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        this.delegateEvents();

        return this;
    },
    zoomToFeature (event) {
        const scope = event.target.innerHTML;

        this.model.zoomAndHighlightFeature(scope);
    },
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    }
});

export default DashboardView;