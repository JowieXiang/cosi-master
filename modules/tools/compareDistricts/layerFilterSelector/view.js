import template from "text-loader!./template.html";
import Model from "./model";

const LayerFilterSelectorView = Backbone.View.extend({
    events: {
        "change select": "setSelectedLayer"
    },

    initialize: function () {
        this.listenTo(this.model, {
            "change:selectedLayer": function (model, value) {
            }
        });
    },

    tagName: "div",
    className: "form-group col-md-6",

    // model: new FilterSelectorModel(),
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
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