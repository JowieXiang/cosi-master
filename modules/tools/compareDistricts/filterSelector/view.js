import FilterTemplate from "text-loader!./template.html";
// import FilterSelectorModel from "./model";

const FilterView = Backbone.View.extend({
    events: {
        "change select": "setSelectedLayer",
        "change .slider": "renderValue"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:selectedFilter": this.resetSliderFields
        });

    },

    tagName: "div",
    className: "selection-container",

    // model: new FilterSelectorModel(),
    template: _.template(FilterTemplate),

    render: function () {
        if (this.model.changed.id !== undefined) {
            return;
        }

        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },
    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
    },
    renderValue: function (evt) {
        console.log(evt.target.value);
        this.$(".range-value").html(evt.target.value);
    }


});

export default FilterView;