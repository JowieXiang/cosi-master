define([
    "backbone",
    "config"
], function (Backbone, Config) {
    var CosiModel = Backbone.Model.extend({
        defaults: {
            isVisible: false
        },

        initialize: function () {
            if (Config.cosiMode) {
                this.set("isVisible", Config.cosiMode);
            }
        }
    });

return new CosiModel();

});
