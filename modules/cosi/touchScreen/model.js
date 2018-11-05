const CosiModel = Backbone.Model.extend({
    topicSelection: {},
    defaults: {
        isVisible: false,
        topics: [],
        stages: [],
        center: [],
        isStagesActive: false,
        currentTopic: "",
        deactivatedStageLayers: []
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
    },
    addDeactivatedStageLayer: function (layer) {
        var layers = this.getDeactivatedStageLayers();
        layers.push(layer);
        this.setDeactivatedStageLayers(layers);
    },
    setDeactivatedStageLayers: function (layers) {
        this.set("deactivatedStageLayers", layers);
    },
    getDeactivatedStageLayers: function () {
        return this.get("deactivatedStageLayers");
    },
    getStages: function () {
        return this.get("stages");
    },
    getVisibleLayersWithStages: function () {
        var visibleLayersWithStages = [];
        var featureCollection = Radio.request("ModelList", "getCollection");
        _.each(featureCollection["models"], function (feature) {
            if (feature["attributes"]["type"] == "layer" &&
                feature["attributes"]["isVisibleInMap"] == true &&
                feature["attributes"]["layerStage"]) {
                visibleLayersWithStages.push(feature);
            }
        });
        return visibleLayersWithStages;
    }
});

export default CosiModel;

