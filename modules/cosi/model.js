define([
    "backbone",
    "config"
], function (Backbone, Config) {
    var CosiModel = Backbone.Model.extend({
        defaults: {
            isVisible: false,
            topics: [],
            stages: []
        },

        initialize: function () {
            if (Config.cosiMode) {
                this.set("isVisible", true);
                this.set("topics", Config.cosiMode["topics"]);
                this.set("stages", Config.cosiMode["stages"]);
            }
        }
    });

return new CosiModel();

});
