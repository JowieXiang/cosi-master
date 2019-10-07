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
        this.listenTo(this.sliderCollection, {
            "change:sliderValue": function (model) {
                this.updateLayerFilter(model);
                this.filterFeatures();
            }
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
            const thisInfo = this.model.get("districtInfo").filter(disInfo => disInfo.key === filterKey)[0],
                space = thisInfo.space,
                newSliderModel = new SliderModel({ key: filterKey, space: space }),
                silderView = new SliderView({ model: newSliderModel });

            this.sliderCollection.add(newSliderModel);
            this.$el.find("#" + filterKey + "-td").append(silderView.render().el);
        });
    },
    destroySelf: function () {
        this.remove();
        this.model.destroy();
        Radio.trigger("CompareDistricts", "closeFilter", this.model.get("layerInfo"));
    },
    updateLayerFilter: function (sliderModel) {
        const key = sliderModel.get("key"),
            newFilter = JSON.parse(this.model.get("filter"));


        newFilter[key] = sliderModel.get("sliderValue");
        this.model.set("filter", JSON.stringify(newFilter));
    },
    filterFeatures: function () {
        // const filterArray = JSON.parse(this.model.get("filter")),
        //     layerInfo = this.model.get("layerInfo"),
        //     featureCollection = Radio.request("FeatureLoader", "getFeaturesByLayerId", layerInfo.layerId);

        // _.each(Object.keys(filterArray), key => {
        //     const tolerance = filterArray[key];

        // });

        // console.log("filterArray: ", filterArray);
        // console.log("layerInfo: ", layerInfo);


    }

});

export default LayerFilterView;