import Template from "text-loader!./selectTemplate.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import SnippetCheckBoxView from "../../snippets/checkbox/view";

const SelectView = Backbone.View.extend({
    events: {
        "click #submit": "calculateRatios"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "renderResult": this.renderResult,
            "updateDropdownMenus": this.render
        });
        this.numDropdownView = new SnippetDropdownView({model: this.model.get("numDropdownModel")});
        this.denDropdownView = new SnippetDropdownView({model: this.model.get("denDropdownModel")});

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    id: "verhältnisse-berechnen-tool",
    template: _.template(Template),
    numDropdownView: {},
    denDropdownView: {},
    render: function (model, value) {
        const attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.$el.find(".numDropdown").append(this.numDropdownView.render().el);
            this.$el.find(".denDropdown").append(this.denDropdownView.render().el);
        }

        return this;
    },
    renderResult: function () {
        console.log(this.model.result);
    },
    calculateRatios: function () {
        this.model.getFeatureValues();
    }
});

export default SelectView;