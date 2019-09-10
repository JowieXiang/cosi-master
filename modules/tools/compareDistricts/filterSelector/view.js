import FilterTemplate from "text-loader!./template.html";
// import FilterSelectorModel from "./model";
import FilterSliderList from "./filterSlider/list";
import FilterSliderModel from "./filterSlider/model";
import FilterSliderView from "./filterSlider/view";


const FilterView = Backbone.View.extend({
    events: {
        "change select": "setSelectedLayer",
        "change .slider": "renderValue"
    },
    initialize: function () {

        this.filterSliderList = new FilterSliderList();

        this.listenTo(this.model, {
            "change:selectedLayer": this.render,
            "change:sliderKeys": this.setSliders
        });


        this.listenTo(this.filterSliderList, {
            "add": this.addFilterSliderView
        });
    },

    tagName: "div",
    className: "selection-container",

    // model: new FilterSelectorModel(),
    template: _.template(FilterTemplate),

    render: function () {

        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },
    setSelectedLayer: function (evt) {
        this.model.setSelectedLayer(evt.target.value);
        this.model.setSliderKeys(evt.target.value);

    },
    setSliders: function () {
        const keys = this.model.getSliderKeys();

        _.each(keys, key => {
            const newSliderModel = new FilterSliderModel({ key: key });

            this.filterSliderList.add(newSliderModel);
        }, this);
    },
    addFilterSliderView: function (model) {

        const silderView = new FilterSliderView({ model: model });

        this.$el.find("#filter-slider-container").append(silderView.render().el);
    }


});

export default FilterView;