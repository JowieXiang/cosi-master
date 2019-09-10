import FilterTemplate from "text-loader!./filterTemplate.html";

const FilterView = Backbone.View.extend({
    initialize: function () {

        this.listenTo(this.model, {
            "change": this.render,
            "change:selectedFilter": this.resetSliderFields
        });
    },
    template: _.template(FilterTemplate),

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
        // console.log("$el: ", this.$el.html());
        this.$("select").change(function () {
            console.log("selection changed");
        });

        // console.log("select: ", this.$("select"));

        // console.log("view: ", this.el);
        return this;
    }


});

export default FilterView;