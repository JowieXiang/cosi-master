import StorageModel from "./model";

const LocalStorageView = Backbone.View.extend({
    model: StorageModel,

    /*
    *   This module connects two portals that are running in different tabs
    *   One portal writes a message to the localStorage and the second portal subscribes to specific messages sent from the other portal
    *   This is used in the context of a CoSI type project
    */

    initialize: function () {
        let channel = Radio.channel("LocalStorage");

        // To set the inactivity of stages, we need to listen to changes
        this.listenTo(channel, {
            "sendMessage": function (messageType, messageData) {
                let message = {
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

export default LocalStorageView;
