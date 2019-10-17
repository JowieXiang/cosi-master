import template from "text-loader!./template.html";
import SliderCollection from "./slider/list";
import SliderModel from "./slider/model";
import SliderView from "./slider/view";


const LayerFilterView = Backbone.View.extend({
    events: {
        "click .close": "destroySelf",
        "change .reference-value-input": "updateDistrictInfo"
    },

    initialize: function () {
        this.sliderCollection = new SliderCollection();
        this.listenTo(this.sliderCollection, {
            "change:sliderValue": function (model) {
                this.updateLayerFilter(model);
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
            const newSliderModel = new SliderModel({ key: filterKey }),
                silderView = new SliderView({ model: newSliderModel });

            this.sliderCollection.add(newSliderModel);
            this.$el.find("#" + filterKey + "-td").append(silderView.render().el);
        });
    },
    destroySelf: function () {
        const newLayerInfo = this.model.get("layerInfo");

        newLayerInfo.layerName = newLayerInfo.layerName.replace(/ /g, "_");
        this.model.set("layerInfo", newLayerInfo);
        Radio.trigger("CompareDistricts", "closeFilter", this.model.get("layerInfo"));
        this.remove();
        this.model.destroy();
    },
    updateLayerFilter: function (sliderModel) {
        const key = sliderModel.get("key"),
            newFilter = JSON.parse(this.model.get("filter"));


        newFilter[key] = sliderModel.get("sliderValue");
        this.model.set("filter", JSON.stringify(newFilter));
    },
    updateDistrictInfo: function (e) {
        var key = $(e.currentTarget).attr("id");
        const newInfo = this.model.get("districtInfo").slice();

        e.preventDefault();
        _.each(newInfo, item => {
            if (item.key === key) {
                item.value = e.target.value;
            }
        });
        this.model.set("districtInfo", newInfo);
    }

});

export default LayerFilterView;
