define([
    "backbone",
    "config"
], function (Backbone, Config) {
    var CosiModel = Backbone.Model.extend({
        defaults: {
            isVisible: false,
            topics: [],
            stages: [],
            center: [],
            isStagesActive: false
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
        }
    });

return new CosiModel();

});
