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

    /**
     * initialize the AdjustParameterView
     * @param {string} layerId the ID of the layer to modify
     * @param {*} infoText the text to show on btn click
     * @returns {void}
     */
    initialize: function (layerId, infoText = null) {
        if (layerId) {
            this.model = new AdjustParameterModel(layerId, infoText);
        }
    },
    model: {},
    template: _.template(Template),
    className: "parameter-control-container",

    /**
     * renders the modifier view
     * @returns {Backbone.View} returns this
     */
    render: function () {
        var attrs = this.model.toJSON();

        this.$el.html(this.template(attrs));
        this.delegateEvents();

        return this;
    },

    /**
     * toggle modifier on/off
     * @returns {void}
     */
    toggleModifier: function () {
        this.$el.find(".modifier").toggleClass("hidden");
        this.model.set("isModified", !this.model.get("isModified"));
    },

    /**
     * set modifier when an input field is changed
     * @returns {void}
     */
    setModifier: function () {
        const modValue = this.$el.find("#operator").val() === "/" ? 1 / parseFloat(this.$el.find("#modifier-input").val()) : parseFloat(this.$el.find("#modifier-input").val());

        this.model.set("selectedOption", [
            this.$el.find("#parameter-select").val(),
            modValue
        ]);
    },

    /**
     * show info on btn click
     * @returns {void}
     */
    showInfo: function () {
        Radio.trigger("Alert", "alert", {
            text: `${this.model.get("infoText")}`,
            kategorie: "alert-info"
        });
    }
});

export default AdjustParameterView;