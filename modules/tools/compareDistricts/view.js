import template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import FilterView from "./filterView";
import FilterModel from "./filter";

const CompareDistrictsView = Backbone.View.extend({
    events: {
        "click #add-filter": "createFilterModel"
    },
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "isReady": this.createFilterModel
        });
        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
            },
            "change snippetDropdownModelDistrict": function () {
                this.snippetDropdownViewDistrict = new SnippetDropdownView({ model: this.model.get("snippetDropdownModelDistrict") });
            },
            "change filterModels": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    template: _.template(template),
    render: function () {
        var attr;

        if (this.model.get("isActive") === true) {
            attr = this.model.toJSON();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
            this.$el.find(".dropdown_district").append(this.snippetDropdownViewDistrict.render().el);
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
            layers = Radio.request("Parser", "getItemsByAttributes", { typ: "WFS" }),
            layerNames = layers.map(layer => layer.name);

        filterModel.setLayerNames(layerNames);
        this.addFilterView(filterModel);
        this.model.pushFilterModel(filterModel);
    },

    addFilterView: function (model) {
        const filterView = new FilterView({ model: model });

        this.$el.find("#filter-container").append(filterView.render().el.childNodes);

    }


});


export default CompareDistrictsView;
