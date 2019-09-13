const FilterSliderModel = Backbone.Model.extend({
    defaults: {
        sliderValue: null,
        key: null
    },

    initialize: function () {
    },

    setSliderValue: function (value) {
        this.set("sliderValue", value);
    }
});

export default FilterSliderModel;
