import SelectDistrictModel from "./model";
import Template from "text-loader!./template.html";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click #select-district": "toggleIsActive"
    },
    initialize: function () {
        const channel = Radio.channel("SelectDistrict");
        channel.reply({
            "getSelectedDistricts": this.getSelectedDistricts
        }, this);
        this.render();
    },
    model: new SelectDistrictModel(),
    template: _.template(Template),

    render: function () {
        var attr = this.model.toJSON();
        $(".masterportal-container").append(this.$el.html(this.template(attr)));
        return this;
    },

    getSelectedDistricts: function () {
        return this.model.getSelectedDistricts();
    },

    toggleIsActive: function () {
        if (!this.model.getIsActive()) {
            this.$("#select-district").css({"background-color": "#808080"});
        }
        else {
            this.$("#select-district").css({"background-color": "white"});
        }
        this.model.toggleIsActive();
    }

});

export default SelectDistrictView;
