import template from "text-loader!./template.html";
import SliderModel from "./model";

const SliderView = Backbone.View.extend({
    events: {
        "change .slider": function (evt) {
            this.renderValue(evt);
            this.setSliderValue(evt);
        }
    },
    initialize: function () {
        this.listenTo(this.model, {
            // "change:sliderValue": somefunction
        });
    },

    tagName: "div",
    className: "filter-slider",

    model: new SliderModel(),
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    renderValue: function (evt) {
        this.$(".slider-value").html(evt.target.value);
    },

    setSliderValue: function (evt) {
        this.model.setSliderValue(evt.target.value);
    }


});

export default SliderView;