import template from "text-loader!./template.html";

const DistrictInfoView = Backbone.View.extend({

    tagName: "div",
    className: "",
    template: _.template(template),
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        console.log("this.model: ", this.model);

        return this;
    }

});

export default DistrictInfoView;