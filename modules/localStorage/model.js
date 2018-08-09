define([
    "backbone",
    "config"
], function (Backbone, Config) {
    var LocalStorageModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function () {
            if (Config.cosiMode) {
            }
        }
    });

return new LocalStorageModel();

});
