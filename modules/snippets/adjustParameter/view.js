import AdjustParameterModel from "./model";
import Template from "text-loader!./template.html";
import "bootstrap-select";

const AdjustParameterView = Backbone.View.extend({
    events: {
        "change #parameter-select": "setModifier",
        "change #modifier-input": "setModifier",
        "click #layer-name": "test"
    },
    initialize: function (layerId) {
        if (layerId) {
            this.model = new AdjustParameterModel(layerId);
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
    setModifier: function () {
        this.model.set("selectedOption", [
            this.$el.find("#parameter-select").val(),
            parseFloat(this.$el.find("#modifier-input").val())
        ]);
    },
    test: function () {
        console.log(this.model.getSelectedOption());
    }
});

export default AdjustParameterView;