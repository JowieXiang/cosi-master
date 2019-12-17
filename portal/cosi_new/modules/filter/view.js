import QueryDetailView from "./query/detailView";
import QuerySimpleView from "./query/simpleView";
import Template from "text-loader!./template.html";
import ResultView from "./query/resultView";
import ResultModel from "./query/resultModel";
import "./style.less";

const FilterView = Backbone.View.extend({
    events: {
        "click .close": "closeFilter"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    if (model.get("queryCollection").length < 1) {
                        model.createQueries(model.get("predefinedQueries"));
                    }
                    this.render();
                    this.renderDetailView();
                }
                else {
                    if (this.model.get("detailView")) {
                        this.model.get("detailView").removeView();
                    }
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            }
        });
        this.listenTo(this.model.get("queryCollection"), {
            "change:isSelected": function (model, value) {
                if (value === true) {
                    this.renderDetailView();
                }
                this.model.closeGFI();
            },
            "renderDetailView": this.renderDetailView,
            "renderResultView": this.renderResultView,
            "add": function () {
                if (this.model.get("isActive")) {
                    this.render();
                    this.renderDetailView();
                }
            }
        });

        if (this.model.get("isActive")) {
            if (this.model.get("queryCollection").length < 1) {
                this.model.createQueries(this.model.get("predefinedQueries"));
            }
            this.render();
        }
    },
    id: "filter-view",
    template: _.template(Template),
    className: "filter",

    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("uiStyle") === "TABLE") {
            Radio.trigger("TableMenu", "appendFilter", this.el);
        }
        else {
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true, this.model.get("uiWidth"));
        }
        this.renderSimpleViews();
        this.delegateEvents();

        return this;
    },

    renderDetailView: function () {
        var selectedModel = this.model.get("queryCollection").findWhere({ isSelected: true }),
            view;

        if (!_.isUndefined(selectedModel)) {
            view = new QueryDetailView({ model: selectedModel });

            this.model.setDetailView(view);
            this.$el.find(".detail-view-container").html(view.render().$el);
        }
    },
    renderResultView: function (featureIds, layerId) {
        const layerModel = Radio.request("ModelList", "getModelByAttributes", { id: layerId }),
            features = layerModel.get("layer").getSource().getFeatures().filter(f => _.contains(featureIds, f.getId())),
            resultModel = new ResultModel();
        let selector1, selector2;

        /**
         * hard coded selector for different facility layers
         */
        if (features[0].getProperties().schul_id) {
            selector1 = "schulname";
            selector2 = "schul_id";
        }
        else if (features[0].getProperties().einrichtung) {
            selector1 = "name";
            selector2 = "einrichtung";
        }
        else if (features[0].getProperties().Einrichtungsnummer) {
            selector1 = "Name_normalisiert";
            selector2 = "Einrichtungsnummer";
        }
        else if (features[0].getProperties().identnummer) {
            selector1 = "anlagenname";
            selector2 = "identnummer";
        }

        resultModel.set("featureIds", featureIds);
        resultModel.set("features", features);
        resultModel.set("layerId", layerId);
        resultModel.set("layerName", layerModel.get("name"));
        resultModel.set("selector1", selector1);
        resultModel.set("selector2", selector2);

        this.resultView = new ResultView({ model: resultModel });
        this.$el.find(".result-view-container").html(this.resultView.render().$el);
    },
    renderSimpleViews: function () {
        var view,
            queryCollectionModels = this.model.get("queryCollection").models;

        if (queryCollectionModels.length > 1) {
            _.each(queryCollectionModels, function (query) {
                view = new QuerySimpleView({ model: query });
                this.$el.find(".simple-views-container").append(view.render().$el);
            }, this);
        }
        else {
            this.model.activateLayer(queryCollectionModels);
            this.$el.find(".simple-views-container").remove();
        }
    },
    closeFilter: function () {
        this.model.setIsActive(false);
        this.model.collapseOpenSnippet();
        Radio.trigger("ModelList", "toggleDefaultTool");
    }
});

export default FilterView;
