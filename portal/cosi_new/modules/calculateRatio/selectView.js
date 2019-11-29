import Template from "text-loader!./selectTemplate.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";
import ResultView from "./resultView";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";

const SelectView = Backbone.View.extend({
    events: {
        "click #submit": "calculateRatios",
        "change #resolution-input": "setResolution",
        "click .tool-info #help": "showInfo"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "renderResult": this.renderResult,
            "renderFacilityDropDown": this.renderFacilityDropDown,
            "renderResults": this.renderResult,
            "change:adjustParameterView": this.renderModifiers,
            "change:numerators": this.updateTexts,
            "change:denominators": this.updateTexts
        });

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
            this.denDropdownView = new SnippetDropdownView({model: this.model.get("denDropdownModel")});
            this.$el.find(".denDropdown").append(this.denDropdownView.render().el);
            this.renderFacilityDropDown();
        }

        return this;
    },
    renderFacilityDropDown: function () {
        this.$el.find(".numDropdown .dropdown-container").remove();
        this.numDropdownView = new SnippetDropdownView({model: this.model.get("numDropdownModel")});
        this.$el.find(".numDropdown").append(this.numDropdownView.render().el);
    },
    renderResult: function () {
        this.$el.find(".result").html("");
        this.$el.find(".result").append(new ResultView({model: this.model}).render(false).el);
    },
    renderModifiers: function () {
        this.$el.find(".modifiers").html(this.model.get("adjustParameterView").render().el);
    },
    updateTexts: function () {
        if (this.model.get("denominators").values.length === 0) {
            $("#resolution-input-container").addClass("hidden");
        }
        else {
            $("#resolution-input-container").removeClass("hidden").find("#den-name").text(this.model.get("denominators").values.join(", "));
            $(".denDropdown .filter-option").text(this.model.get("denominators").values[0]);
        }
    },
    calculateRatios: function () {
        this.model.getRatiosForSelectedFeatures();
    },
    setResolution: function (evt) {
        this.model.set("resolution", parseInt(evt.target.value, 10));
    },
    showInfo: function () {
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    }
});

export default SelectView;
