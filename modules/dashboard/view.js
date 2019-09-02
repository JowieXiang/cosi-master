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
            "change:isActive": this.render,
            "change:tableView": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    model: {},
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $(".masterportal-container").append(this.$el.html(this.template(attr)));

        // for (const prop in firstCol) {
        //     const row = "<tr></tr>";

        //     row.append(`<th>${prop}</th>`);

        //     for (const district in tableView) {
        //         console.log(tableView[district][prop]);
        //         row.append(`<td>${tableView[district][prop]}</td>`);
        //     }

        //     console.log(row);
        //     this.$el.find("table").append(row);
        // }

        return this;
    },
    test: function () {
        console.log(this.model);
    }
});

export default DashboardView;