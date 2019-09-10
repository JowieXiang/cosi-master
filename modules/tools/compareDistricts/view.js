import template from "text-loader!./template.html";
import FilterView from "./filterSelector/view";
import FilterModel from "./filterSelector/model";
import DistrictSelectorView from "./districtSelector/view";
import FilterList from "./filterSelector/list";

const CompareDistrictsView = Backbone.View.extend({

    events: {
        "click #add-filter": "addFilterModel"
    },

    initialize: function () {
        // create filter collection
        this.filterList = new FilterList();

        this.createDistrictSelectorView();

        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            }
        });

        this.listenTo(this.filterList, {
            "change:selectedLayer": this.setSelectedLayers,
            "add": this.addFilterView
        });

        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.selectDistrictReminder();
                }
            }
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

    setSelectedLayers: function () {
        const selectedLayers = this.filterList.map((filter) => {
            return filter.get("selectedLayer");
        });

        this.model.setSelectedLayers(selectedLayers);
    },

    addFilterModel: function () {
        const filterModel = new FilterModel();

        this.filterList.add(filterModel);
    },

    addFilterView: function (model) {

        const filterView = new FilterView({ model: model });

        this.$el.find("#filter-container").append(filterView.render().el);
    },

    createDistrictSelectorView: function () {
        this.districtSelector = new DistrictSelectorView();
    },

    renderDistrictSelectorView: function (districtSelector) {
        this.$el.find("#district-selector-container").append(districtSelector.render().el);
    },

    // reminds user to select district before using the ageGroup slider
    selectDistrictReminder: function () {
        const selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts");

        if (selectedDistricts.length === 0) {
            Radio.trigger("Alert", "alert", {
                text: "<strong> Bitte wählen Sie zuerst die Bezirke mit 'Gebiet wählen' im Werkzeugmenü aus</strong>",
                kategorie: "alert-warning"
            });
        }
    }

});


export default CompareDistrictsView;
