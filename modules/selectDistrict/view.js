import SelectDistrictModel from "./model";
import Template from "text-loader!./template.html";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click button": "toggleIsActive"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    model: new SelectDistrictModel(),
    template: _.template(Template),

    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }
        return this;
    },

    getSelectedDistricts: function () {
        return this.model.getSelectedDistricts();
    },

    toggleIsActive: function () {
        this.model.toggleIsActive();
    }

});

export default SelectDistrictView;
