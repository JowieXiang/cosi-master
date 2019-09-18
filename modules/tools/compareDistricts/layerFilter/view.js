import template from "text-loader!./template.html";
import SliderCollection from "./slider/list";
import SliderModel from "./slider/model";
import SliderView from "./slider/view";


const LayerFilterView = Backbone.View.extend({
    events: {
        "click .close": "destroySelf"
    },

    initialize: function () {
        this.sliderCollection = new SliderCollection();
        this.listenTo(this.model, {

        });
        this.listenTo(this.sliderCollection, {
            "change:sliderValue": this.updateLayerFilter
        });

    },

    tagName: "div",
    className: "row",

    // model: new FilterSelectorModel(),
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        this.renderSliders();
        return this;
    },

    renderSliders: function () {
        const filterData = JSON.parse(this.model.get("filter"));

        _.each(Object.keys(filterData), filterKey => {
            const newSliderModel = new SliderModel({ key: filterKey }),
                silderView = new SliderView({ model: newSliderModel });

            this.sliderCollection.add(newSliderModel);
            this.$el.find("#" + filterKey + "-td").append(silderView.render().el);
        });

    },
    destroySelf: function () {
        this.remove();
        this.model.destroy();

    },
    updateLayerFilter: function (sliderModel) {

        const key = sliderModel.get("key");
        // console.log(this.model.get("layerFilter"));
        var newFilter = JSON.parse(this.model.get("filter"));
        // console.log("newFilter: ", newFilter);

        // console.log("key: ", key);

        // console.log("newFilter[key]: ", newFilter[key]);
        // console.log("sliderModel.get(sliderValue): ", sliderModel.get("sliderValue"));

        newFilter[key] = sliderModel.get("sliderValue");
        // this.model.set("layerFilter", ""); // have to reset the field in order to trigger change event

        this.model.set("filter", JSON.stringify(newFilter));
        // console.log("new layerFilter: ", this.model.get("filter"));
    }

});

export default LayerFilterView;