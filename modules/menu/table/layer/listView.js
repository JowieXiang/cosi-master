import ListTemplate from "text-loader!./templates/template.html";
import SingleLayerView from "./singleLayerView";

const LayerView = Backbone.View.extend({
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementLayer": this.hideMenu
        });
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.$el.find("ul.layers").html("");
                this.renderList();
            }
        });

        // Aktiviert ausgewälter Layer; Layermenu ist aktiv
        this.listenTo(this.collection, {
            "updateSelection": function () {
                if (!Config.cosiMode) {
                    this.render();
                    $("#table-nav-layers-panel").collapse("show");
                    this.$el.addClass("burgerMenuIsActive");
                }
            }
        });

        this.$el.on("hide.bs.collapse", function () {
            Radio.trigger("TableMenu", "deactivateCloseClickFrame");
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Layer");
        });

        if (Config.cosiMode) {
            this.listenTo(Radio.channel("Cosi"), {
                "selectTopic": this.addCosiFilter
            });
        }
    },
    id: "table-layer-list",
    className: "table-layer-list table-nav",
    template: _.template(ListTemplate),
    cosiLayerTopics: ["basic"],
    hideMenu: function () {
        $("#table-nav-layers-panel").collapse("hide");
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },
    render: function () {
        this.$el.html(this.template());
        if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
            $("#table-nav-layers-panel").collapse("show");
        }
        this.renderList();
        return this;
    },
    renderList: function () {
        var models = this.collection.where({type: "layer"});

        models = _.sortBy(models, function (model) {
            return model.get("selectionIDX");
        });
        this.addViews(models);
    },
    addViews: function (models) {
        var childElement = {};

        _.each(models, function (model) {
            if (!model.get("isNeverVisibleInTree")) {
                if (model.get("isVisibleInTree") === true) {
                    childElement = new SingleLayerView({model: model}).render().$el;
                    this.$el.find("ul.layers").prepend(childElement);
                }
            }
        }, this);
    },
    removeAllViews: function () {
        $(this.$el.find("ul.layers")).empty();
    }
});

export default LayerView;
