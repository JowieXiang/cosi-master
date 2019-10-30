import template from "text-loader!./template.html";
// import Model from "./model";
import SnippetDropdownView from "../../../snippets/dropdown/view";

const LayerFilterSelectorView = Backbone.View.extend({
    events: {
        "change select": "setSelectedLayer"
    },

    tagName: "div",
    // className: "form-group col-sm-4",

    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find("#layer-selection").selectpicker("refresh");
        this.renderDropDownView(this.model.get("dropDownModel"));
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({ model: dropdownModel }),
            dropdownObj = dropdownView.render().el;

        this.$el.append(dropdownObj);
        this.$el.find("#dropdown-container").addClass("form-control input-sm");

    },
    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
    },
    clearSelectedLayer: function () {
        this.model.set("selectedLayer", null);
    },
    getSelectedLayer: function () {
        return this.model.getSelectedLayer();
    },
    getLayerOptions: function () {
        return this.model.getLayerOptions();
    },
    setLayerOptions: function (options) {
        this.model.setLayerOptions(options);
    }

});

export default LayerFilterSelectorView;
