import Template from "text-loader!./selectTemplate.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import ResultView from "./resultView";

const SelectView = Backbone.View.extend({
    events: {
        "click #submit": "calculateRatios"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "renderResult": this.renderResult,
            "updateDropdownMenus": this.render,
            "renderResults": this.renderResult
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
        this.$el.find(".result").html("");
        this.$el.find(".result").append(new ResultView({model: this.model}).render().el);
    },
    calculateRatios: function () {
        this.model.getRatiosForSelectedFeatures();
    }
});

export default SelectView;