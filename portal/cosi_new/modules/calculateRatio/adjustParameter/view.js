import AdjustParameterModel from "./model";
import Template from "text-loader!./template.html";
import "bootstrap-select";
import "./style.less";

const AdjustParameterView = Backbone.View.extend({
    events: {
        "change #parameter-select": "setModifier",
        "change #modifier-input": "setModifier",
        "change #operator-input": "setModifier",
        "click #help": "showInfo",
        "click #toggle-modifier": "toggleModifier"
    },
    initialize: function (layerId, infoText = null) {
        if (layerId) {
            this.model = new AdjustParameterModel(layerId, infoText);
        }
    },
    model: {},
    template: _.template(Template),
    className: "parameter-control-container",
    render: function () {
        var attrs = this.model.toJSON();

        this.$el.html(this.template(attrs));
        this.delegateEvents();

        return this;
    },
    toggleModifier: function () {
        this.$el.find(".modifier").toggleClass("hidden");
    },
    setModifier: function () {
        const modValue = this.$el.find("#operator").val() === "/" ? 1 / parseFloat(this.$el.find("#modifier-input").val()) : parseFloat(this.$el.find("#modifier-input").val());

        this.model.set("selectedOption", [
            this.$el.find("#parameter-select").val(),
            modValue
        ]);
    },
    showInfo: function () {
        Radio.trigger("Alert", "alert", {
            text: `${this.model.get("infoText")}`,
            kategorie: "alert-info"
        });
    }
});

export default AdjustParameterView;
