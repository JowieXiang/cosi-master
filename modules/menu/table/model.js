define(function (require) {
    var channel = Radio.channel("TableMenu"),
        Config = require("config"),
        TableNavModel = Backbone.Model.extend({
            defaults: {
                isActiveElement: "",
                isShowCategories: Radio.request("Parser", "getPortalConfig").isShowCategoryMenu
            },
            initialize: function () {
                channel.reply({
                    "getActiveElement": function () {
                        return this.get("isActiveElement");
                    },
                    "setActiveElement": this.setActiveElement
                }, this);
            },

            setActiveElement: function (element) {
                if (this.get("isActiveElement") !== element) {
                    channel.trigger("hideMenuElement" + this.get("isActiveElement"));
                }
                this.set("isActiveElement", element);
            },

            getIsShowCategories: function () {
                return this.get("isShowCategories");
            }
        });

    return TableNavModel;
});
