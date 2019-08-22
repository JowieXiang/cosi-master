import SelectDistrictModel from "./model"
import Template from "text-loader!./template.html";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click #select-district": "toggleIsActive"
    },
    model: new SelectDistrictModel(),
    template: _.template(Template),
    initialize: function () {
        this.render();
    },
    render: function () {
        var attr = this.model.toJSON();
        $(".masterportal-container").append(this.$el.html(this.template(attr)));
        return this;
    },
    toggleIsActive: function () {
        if (!this.model.getIsActive()) {
            this.$("#select-district").css(
                { "background-color": "#808080" }
            )
        } else {
            this.$("#select-district").css(
                { "background-color": "white" }
            )
        }
        this.model.toggleIsActive();
    }

});

export default SelectDistrictView;
