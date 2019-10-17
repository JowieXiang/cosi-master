import template from "text-loader!./template.html";
import Model from "./model";

const DistrictSelectorView = Backbone.View.extend({
    events: {
        "change select": "setSelectedDistrict"
    },
    initialize: function () {
        const channel = Radio.channel("DistrictSelector");

        channel.reply({
            "getSelectedDistrict": this.getSelectedDistrict
        }, this);
    },
    tagName: "div",
    className: "form-group col-md-4",
    template: _.template(template),
    render: function () {
        this.model = new Model();
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    setSelectedDistrict: function (evt) {
        this.model.setSelectedDistrict(evt.target.value);
        $("#district-selector").prop("disabled", "disabled");
    },
    getSelectedDistrict: function () {
        return this.model.get("selectedDistrict");
    }


});

export default DistrictSelectorView;
