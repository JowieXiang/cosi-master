import template from "text-loader!./template.html";
import FilterView from "./filterSelector/view";
import FilterModel from "./filterSelector/model";
import DistrictSelectorView from "./districtSelector/view";

const CompareDistrictsView = Backbone.View.extend({

    events: {
        "click #add-filter": "createFilterModel"
    },

    initialize: function () {
        this.createDistrictSelectorView();
        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            },
            "change filterModels": this.render
        });
    },

    template: _.template(template),

    render: function () {
        var attr;

        if (this.model.get("isActive") === true) {
            attr = this.model.toJSON();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.renderDistrictSelectorView(this.districtSelector);
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            this.undelegateEvents();
        }
        return this;
    },

    createFilterModel: function () {
        const filterModel = new FilterModel(),
            filterView = new FilterView({ model: filterModel });

        this.renderFilterView(filterView);
        this.model.pushFilterModel(filterModel);
    },

    renderFilterView: function (filterView) {
        this.$el.find("#filter-container").append(filterView.render().el);
    },

    createDistrictSelectorView: function () {
        this.districtSelector = new DistrictSelectorView();
    },

    renderDistrictSelectorView: function (districtSelector) {
        this.$el.find("#district-selector-container").append(districtSelector.render().el);
    }


});


export default CompareDistrictsView;
