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
        this.model = new Model();
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
    },
    getSelectedLayer: function () {
        return this.model.getSelectedLayer();
    }

});

export default LayerFilterSelectorView;