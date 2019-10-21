import template from "text-loader!./template.html";

const SliderView = Backbone.View.extend({
    events: {
        "change .slider": function (evt) {
            this.renderValue(evt);
            this.setSliderValue(evt);
        }
    },

    tagName: "div",
    className: "filter-slider",
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    renderValue: function (evt) {
        this.$(".slider-value").html(evt.target.value);
    },

    setSliderValue: function (evt) {
        this.model.set("sliderValue", evt.target.value);
    }


});

export default SliderView;
