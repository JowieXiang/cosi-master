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
            "change": function (model) {
                this.updateLayerFilter(model);
            }
        });
        this.listenTo(this.model, {
            "change:districtInfo": this.render
        });

    },

    tagName: "div",
    className: "",
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
                lowerTolerance: parseInt(filterData[filterKey][0], 10),
                upperTolerance: parseInt(filterData[filterKey][1], 10)
            }),
                toleranceView = new ToleranceView({
                    model: newToleranceModel
                });

            this.toleranceCollection.add(newToleranceModel);
            this.$el.find("#" + filterKey + "-td").append(toleranceView.render().el);
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

        newFilter[key] = [toleranceModel.get("lowerTolerance"), toleranceModel.get("upperTolerance")];
        this.model.set("filter", JSON.stringify(newFilter));
    },
    updateRefInputValue: function (e) {
        var key = $(e.currentTarget).attr("id");
        // deep copying districtInfo array
        const newInfo = _.map(this.model.get("districtInfo"), _.clone);

        e.preventDefault();
        _.each(newInfo, item => {
            if (item.key === key) {
                item.value = parseInt(e.target.value, 10);
            }
        });
        this.model.set("districtInfo", newInfo);
    }

});

export default LayerFilterView;
