import template from "text-loader!./template.html";
import Model from "./model";
import SnippetDropdownView from "../../../snippets/dropdown/view";

const DistrictSelectorView = Backbone.View.extend({
    events: {
        // "change select": "setSelectedDistrict"
    },
    initialize: function () {
        const channel = Radio.channel("DistrictSelector");

        channel.reply({
            "getSelectedDistrict": this.getSelectedDistrict
        }, this);
    },
    tagName: "div",
    // className: "form-group col-sm-4",
    template: _.template(template),
    render: function () {
        this.model = new Model();
        this.$el.html(this.template(this.model.toJSON()));
        // this.$el.find("#district-selector").selectpicker("refresh");
        this.renderDropDownView(this.model.get("dropDownModel"));
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({ model: dropdownModel }),
            dropdownObj = dropdownView.render().el;

        this.$el.append(dropdownObj);
        this.$el.find("#dropdown-container").addClass("form-control input-sm");
    },
    getSelectedDistrict: function () {
        return this.model.get("selectedDistrict");
    }


});

export default DistrictSelectorView;
