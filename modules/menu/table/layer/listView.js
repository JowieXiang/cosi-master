import ListTemplate from "text-loader!./Templates/template.html";
import SingleLayerView from "./singleLayerView";

const LayerView = Backbone.View.extend({
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementLayer": this.hideMenu
        });
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.render();
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
        // bootstrap collapse event
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
    },
    render: function () {
        this.$el.html(this.template());
        if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
            $("#table-nav-layers-panel").collapse("show");
        }
        this.renderList(false);
        return this.$el;
    },
    renderList: function (isTopicChanged) {
        var models = {};
        var layerFilter = this.cosiLayerTopics;

        if (Config.cosiMode) {
            // Gather all layers that are matching the selected topics
            models = this.getLayerForFilters(layerFilter);

            // Deselect layers that do not belong to the current topic
            var currentSelection = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true});
            _.each(currentSelection, function (layer) {
                var layerTopicVisible = false;
                _.each(layerFilter, function (filter) {
                    if (layer.get("topic") === filter) {
                        layerTopicVisible = true;
                        return;
                    }
                })
                if (!layerTopicVisible) {
                    layer.setIsVisibleInMap(false)
                }
            })
            if (isTopicChanged) {
                // Select layers that are marked as default or previously selected
                var prevSelectedLayers = Radio.request("Cosi", "getSavedTopicSelection", layerFilter[1]);
                if (prevSelectedLayers && prevSelectedLayers.length > 0) {
                    _.each(models, function (layer) {
                        if (_.contains(prevSelectedLayers, layer.get("id"))) {
                            layer.setIsVisibleInMap(true)
                        }
                    })
                } else {
                    _.each(models, function (layer) {
                        if (layer.get("isDefaultVisible")) {
                            layer.setIsVisibleInMap(true)
                        }
                    })
                }
            }
        } else {
            models = this.collection.where({type: "layer"});
        }

        models = _.sortBy(models, function (model) {
            return model.get("selectionIDX");
        });
        this.addViews(models);
    },

    addViews: function (models) {
        var childElement = {};

        _.each(models, function (model) {
            childElement = new SingleLayerView({model: model}).render();
            this.$el.find("ul.layers").prepend(childElement);

        }, this);
    },
    removeAllViews: function () {
        $(this.$el.find("ul.layers")).empty();
    },
    addCosiFilter: function (filterValue) {
        this.cosiLayerTopics = ["basic"];
        this.cosiLayerTopics.push(filterValue);
        this.removeAllViews();
        this.renderList(true);
    },
    getLayerForFilters: function (filters) {
        var layers = {};
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if ($.isEmptyObject(layers)) {
                layers = Radio.request("ModelList", "getModelsByAttributes", {topic: filter, isVisibleInTree: undefined || true});
            } else {
                layers.push.apply(layers, Radio.request("ModelList", "getModelsByAttributes", {topic: filter, isVisibleInTree: undefined || true}));
            }
        }
        return layers;
    }
});

export default LayerView;
