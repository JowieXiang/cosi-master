define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        StorageModel = require("modules/localStorage/model");

    LocalStorageView = Backbone.View.extend({
        model: StorageModel,
        initialize: function () {
            var channel = Radio.channel("LocalStorage");

            // To set the inactivity of stages, we need to listen to changes
            this.listenTo(channel, {
                "sendMessage": function (messageType, messageData) {
                    var message = {
                        "type": messageType,
                        "data": messageData
                    };
                    localStorage.setItem('message', JSON.stringify(message));
                    localStorage.removeItem('message');
                }
            }, this);

            window.addEventListener('storage', function (event) {
                if (event.key !== 'message') {
                    return;
                }
                const message = JSON.parse(event.newValue);
                if (!message) {
                    return;
                }
                Radio.trigger("LocalStorage", "newStorageMessage", message);
            });
        }
    });

    return LocalStorageView;
});
