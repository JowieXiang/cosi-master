import Template from "text-loader!./template.html";
import DashboardModel from "./model";

const DashboardView = Backbone.View.extend({
    events: {
        "click #test": "test",
        "click .map": "close",
        "hover .table": "test"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "tableReady": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    model: {},
    template: _.template(Template),
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        return this;
    },
    close: function () {
        Radio.trigger("Sidebar", "toggle", false);
    },
    test: function () {
        console.log("test");
    }
});

export default DashboardView;