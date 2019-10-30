import template from "text-loader!./template.html";
import ToleranceCollection from "./tolerance/list";
import ToleranceModel from "./tolerance/model";
import ToleranceView from "./tolerance/view";


const LayerFilterView = Backbone.View.extend({
    events: {
        "click .close": "destroySelf",
        "change .reference-value-input": "updateRefInputValue"
    },

    initialize: function () {
        this.toleranceCollection = new ToleranceCollection();
        this.listenTo(this.toleranceCollection, {
            "change:sliderValue": function (model) {
                this.updateLayerFilter(model);
            }
        });
        this.listenTo(this.model, {
            "change:districtInfo": this.render
        });

    },

    tagName: "div",
    className: "row",
    // model: new FilterSelectorModel(),
    template: _.template(template),

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));

        this.renderToleranceViews();
        return this;
    },

    renderToleranceViews: function () {
        const filterData = JSON.parse(this.model.get("filter"));

        _.each(Object.keys(filterData), filterKey => {
            const newToleranceModel = new ToleranceModel({
                    key: filterKey,
                    sliderValue: parseInt(filterData[filterKey], 10)
                }),
                silderView = new ToleranceView({
                    model: newToleranceModel
                });

            this.toleranceCollection.add(newToleranceModel);
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
    updateLayerFilter: function (toleranceModel) {
        const key = toleranceModel.get("key"),
            newFilter = JSON.parse(this.model.get("filter"));

        newFilter[key] = toleranceModel.get("sliderValue");
        this.model.set("filter", JSON.stringify(newFilter));
    },
    updateRefInputValue: function (e) {
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
