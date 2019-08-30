import Template from "text-loader!./template.html";
import DashboardModel from "./model";

const DashboardView = Backbone.View.extend({
    events: {
        "click #test": "test"
    },
    initialize: function (config) {
        this.model = new DashboardModel({
            propertyTree: config.propertyTree
        });

        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            }
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    model: {},
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementById("map").append("<div class='dashboard'></div>"));
        this.$el.html(this.template(attr));

        return this;
    },
    test: function () {
        console.log(this.model);
    }
});

export default DashboardView;