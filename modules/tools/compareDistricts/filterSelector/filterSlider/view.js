import FilterSliderTemplate from "text-loader!./template.html";
import FilterSliderModel from "./model";

const FilterView = Backbone.View.extend({
    events: {
        "change .slider": "renderValue"
    },
    initialize: function () {
        this.listenTo(this.model, {
            // "change:sliderValue": somefunction
        });
    },

    tagName: "div",
    className: "filter-slider",

    model: new FilterSliderModel(),
    template: _.template(FilterSliderTemplate),

    render: function () {

        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    renderValue: function (evt) {
        this.$(".slider-value").html(evt.target.value);
    }


});

export default FilterView;