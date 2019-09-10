import SelectDistrictModel from "./model";
import Template from "text-loader!./template.html";
import SnippetValueView from "../snippets/value/view";
import SnippetDropdownView from "../snippets/dropdown/view";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click button#Submit": "toggleIsActive"
    },
    initialize: function () {
        this.scopeDropdownView = new SnippetDropdownView({model: this.model.get("scopeDropdownModel")});

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    model: new SelectDistrictModel(),
    scopeDropdownView: {},
    template: _.template(Template),

    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));

            this.$el.find(".dropdown").append(this.scopeDropdownView.render().el);
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
