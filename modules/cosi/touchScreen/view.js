define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        Template = require("text!modules/cosi/touchScreen/template.html"),
        CosiModel = require("modules/cosi/touchScreen/model"),
        $ = require("jquery"),
        View;

    View = Backbone.View.extend({
        template: _.template(Template),
        model: CosiModel,
        className: "cosi",
        events: {
            "click .topics": "topicSelected",
            "click .stages": "stageSelected",
            "click .reset-button": "recenterMap",
            "click #start-overlay": "clickStartTool"
        },
        initialize: function () {
            var channel = Radio.channel("Cosi");

            channel.reply({
                "getSavedTopicSelection": function (topic) {
                    return this.model.getTopicSelection(topic);
                }
            }, this);

            // To set the inactivity of stages, we need to listen to changes
            this.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": function (layerId, visible) {
                    this.setStageMenuVisibility();
                }
            }, this);

            this.render();
            Radio.request("TableMenu", "setActiveElement", "Category");
        },
        render: function () {
            var attr = this.model.toJSON();
            $(".ol-viewport").append(this.$el.html(this.template(attr)));
        },
        clickStartTool: function (evt) {
            Radio.channel("Tool").trigger("activatedTool", "gfi", false);
            $(".start-container").fadeIn(2000);
            $("#table-nav").fadeIn(2000);
            $("#start-overlay").unbind("click", false);
            $("#start-overlay").remove();
            Radio.trigger("MapView", "setCenterAnimation", this.model.getCenter(), 4);
            Radio.trigger("LocalStorage", "sendMessage", "topic-select", "grobo");
        },
        stageSelected: function (evt) {
            var selectedStage = $(evt.currentTarget).attr('name');
            var visibleLayersWithStages = this.model.getVisibleLayersWithStages();

            for (var i = 0; i < visibleLayersWithStages.length; i++) {
                var visibleStagelayer = visibleLayersWithStages[i];
                var newStageLayer = Radio.request("ModelList", "getModelByAttributes", {
                    stageId: visibleStagelayer.get("stageId"),
                    layerStage: selectedStage
                });
                // Change of visibility has to happen at the end - because this class (of the newStageLayer) listens to these changes
                visibleStagelayer.setIsVisibleInMap(false);
                newStageLayer.setIsVisibleInMap(true);
            }
        },
        topicSelected: function (evt) {
            //Reset
            this.model.setDeactivatedStageLayers([]);
            // Save currently selected layers before the topic switch
            this.saveCurrentTopicLayerSelection(this.model.getCurrentTopic());

            var clickTarget = $(evt.currentTarget);
            var currentTopic = clickTarget.attr('name').trim();
            this.model.setCurrentTopic(currentTopic);

            // Propagate the topic switch
            if (!clickTarget.hasClass("selected")) {
                $(".cosi-field").each(function (index) {
                    $(this).removeClass("selected");
                });
                clickTarget.addClass("selected");
                Radio.trigger("Cosi", "selectTopic", currentTopic);
                Radio.trigger("LocalStorage", "sendMessage", "topic-select", currentTopic);
            } else {
                clickTarget.removeClass("selected");
                Radio.trigger("Cosi", "selectTopic", "");
                Radio.trigger("LocalStorage", "sendMessage", "topic-select", "grobo");

            }
        },
        recenterMap: function () {
            Radio.trigger("MapView", "setCenterAnimation", this.model.getCenter(), 4);
        },
        setStageMenuVisibility: function () {
            var currentStageLayers = this.model.getVisibleLayersWithStages();
            var isStagesVisible = currentStageLayers.length > 0 || this.model.getDeactivatedStageLayers().length > 0;
            this.model.setIsStagesActive(isStagesVisible);
            if (isStagesVisible) {
                $(".stages").removeClass("inactive-stages");
                $(".stages").removeClass("selected");
                $('.stages[name=' + currentStageLayers[0]["attributes"]["layerStage"] + ']').addClass("selected");
            } else {
                $(".stages").addClass("inactive-stages");
                $(".stages").removeClass("selected");
            }
        },
        saveCurrentTopicLayerSelection: function (topic) {
            var layerCollection = Radio.request("ModelList", "getCollection");
            layerCollection = layerCollection.where({isVisibleInMap: true, topic: topic});
            var selectedLayerIds = [];
            _.each(layerCollection, function (layer) {
                selectedLayerIds.push(layer.get("id"))
            });

            this.model.setTopicSelection(topic, selectedLayerIds);
        }
    });

    return View;
});
