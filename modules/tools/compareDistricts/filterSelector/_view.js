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
            "change:layerNames": this.render,
            "change:selectedLayer": function () {
                this.resetSliderKeys();
                // this.clearSliders();
                // this.setSliders();
            },
            "change:sliderKeys": function () {
                this.clearSliders();
                this.setSliders();
            }
        });


        this.listenTo(this.filterSliderList, {
            "add": this.addFilterSliderView,
            "change:sliderValue": this.setFilterData
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
    },
    resetSliderKeys: function () {
        this.model.resetSliderKeys();

    },
    clearSliders: function () {
        this.$el.find("#filter-slider-container").empty();
        this.filterSliderList.reset();
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
    },
    setFilterData: function () {

        const newData = [];

        this.filterSliderList.forEach(slider => {
            if (slider.get("sliderValue")) {
                newData.push({ [slider.get("key")]: slider.get("sliderValue") });
            }
        });
        this.model.setFilterData(newData);
    }


});

export default FilterView;