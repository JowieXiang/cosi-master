import FilterTemplate from "text-loader!./filterTemplate.html";

const FilterView = Backbone.View.extend({
    // Cache the template function for a single item.
    template: _.template(FilterTemplate),
    events: {
        "change select": "resetSliderFields"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change": this.render,
            "change:selectedFilter": this.resetSliderFields
        });
    },


    // The DOM events specific to an item.

    render: function () {
        if (this.model.changed.id !== undefined) {
            return;
        }
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.find(".slider-range").slider({
            range: true,
            min: 0,
            max: 500,
            values: [75, 300],
            slide: function (event, ui) {
                $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
            }
        });
        // $("#amount").val("$" + $("#slider-range").slider("values", 0) +
        //     " - $" + $("#slider-range").slider("values", 1));

        return this;
    },
    resetSliderFields: function () {
        console.log("ooops");
        /**
         * reset the slider bars when selectedFilter changes in the model
         */
    }

});

export default FilterView;