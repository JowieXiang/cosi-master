import template from "text-loader!./template.html";

const ToleranceView = Backbone.View.extend({
    events: {
        "change .slider": function (evt) {
            this.setSliderValue(evt);
        },
        "change #lowerTolerance": function (evt) {
            this.setLowerTolerance(evt);
        },
        "change #upperTolerance": function (evt) {
            this.setUpperTolerance(evt);
        }
    },

    tagName: "div",
    className: "filter-slider",
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },
    setSliderValue: function (evt) {
        this.model.set("sliderValue", evt.target.value);
    },
    setLowerTolerance: function (evt) {
        this.model.set("lowerTolerance", evt.target.value);
    },
    setUpperTolerance: function (evt) {
        this.model.set("upperTolerance", evt.target.value);
    }


});

export default ToleranceView;
