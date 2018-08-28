define([
    "backbone",
    "config"
], function (Backbone, Config) {
    var CosiModel = Backbone.Model.extend({
        topicSelection: {},
        defaults: {
            isVisible: false,
            topics: [],
            stages: [],
            center: [],
            isStagesActive: false,
            currentTopic: ""
        },
        initialize: function () {
            if (Config.cosiMode) {
                this.set("isVisible", true);
                this.set("topics", Config.cosiMode["topics"]);
                this.set("stages", Config.cosiMode["stages"]);
                this.set("center", Config.cosiMode["initialCenter"]);
            }
        },
        getCenter: function () {
            return this.get("center");
        },
        setIsStagesActive: function (isActive) {
            return this.set("isStagesActive", isActive);
        },
        setCurrentTopic: function (topic) {
            return this.set("currentTopic", topic);
        },
        getCurrentTopic: function () {
            return this.get("currentTopic");
        },
        setTopicSelection: function (topic, selectedLayers) {
            this.topicSelection[topic] = selectedLayers;
        },
        getTopicSelection: function (topic) {
            return this.topicSelection[topic];
        }
    });

return new CosiModel();

});
