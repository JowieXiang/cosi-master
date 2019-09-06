import AdjustParameterModel from "./model";
import Template from "text-loader!./template.html";
import "bootstrap-select";

const AdjustParameterView = Backbone.View.extend({
    events: {},
    initialize: function (opts) {
        this.model = new AdjustParameterModel(opts);
    },
    model: {},
    template: _.template(Template),
    className: "parameter-control-container",
    render: function () {
        var attrs = this.model.toJSON();

        this.$el.html(this.template(attrs));
        this.delegateEvents();

        return this;
    }
});

export default AdjustParameterView;