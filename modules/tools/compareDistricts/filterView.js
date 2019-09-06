import FilterTemplate from "text-loader!./filterTemplate.html";

const FilterView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change", this.render);
    },
    // Cache the template function for a single item.
    template: _.template(FilterTemplate),

    // The DOM events specific to an item.

    render: function () {
        if (this.model.changed.id !== undefined) {
            return;
        }
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});

export default FilterView;