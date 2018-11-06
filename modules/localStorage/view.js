import StorageModel from "./model";
//
// define(function (require) {
//     var Backbone = require("backbone"),
//         Radio = require("backbone.radio"),
//         StorageModel = require("modules/localStorage/model");

const LocalStorageView = Backbone.View.extend({
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
                // It did not work without this trigger?
                dispatchEvent( new Event('storage') );
                localStorage.removeItem('message');
            }
        }, this);

        $(window).on('storage', this.eventsTTT);
    },

    eventsTTT: function (event) {
        let localStorage = event.currentTarget.localStorage;

        // if (event.key !== 'message') {
            if (!localStorage.hasOwnProperty("message")) {
            return;
        }

        // const message = JSON.parse(event.newValue);
        const message = JSON.parse(localStorage.message);
        if (!message) {
            return;
        }
        Radio.trigger("LocalStorage", "newStorageMessage", message);
    }
});
export default LocalStorageView;
