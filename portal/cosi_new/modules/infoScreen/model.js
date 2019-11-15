import { runInThisContext } from "vm";

const InfoScreenModel = Backbone.Model.extend({
    defaults: {
        id: "infoScreen",
        name: "CoSI Infoscreen",
        children: [],
        data: {},
        isInfoScreen: true,
        channel: Radio.channel("InfoScreen"),
        broadcasts: {}
    },
    initialize (opts) {
        for (const attr in opts) {
            this.set(attr, opts[attr]);
        }

        this.setupStorage();
        window.addEventListener("beforeunload", this.callClosed.bind(this), false);

        // window.addEventListener("message", this.receiveData.bind(this), false);

        this.initChildren(this.getChildren());

        this.get("channel").reply({
            "getIsInfoScreen": function () {
                return true;
            }
        });
    },
    initChildren (children) {
        children.forEach(child => {
            if (!child.model.get("isActive")) {
                child.model.set("isActive", true);
            }
            else {
                child.render();
            }
        });

        setTimeout(() => {
            this.trigger("updateContent");
        }, 2000); // Fix later
    },
    updateWindow (children) {
        this.initChildren(children);
    },
    // receiveData (evt) {
    //     if (!evt.data.type) {
    //         for (const target in evt.data) {
    //             const foundTarget = Radio.request("ModelList", "getModelByAttributes", {id: target});

    //             if (foundTarget) {
    //                 for (const attr in evt.data[target]) {
    //                     foundTarget.set(attr, evt.data[target][attr]);
    //                 }
    //             }
    //         }
    //     }
    // },
    callClosed () {
        window.CosiStorage.setItem("infoScreenOpen", JSON.stringify(false));
    },
    // sendData (data) {
    //     window.opener.postMessage(data);
    // },
    getChildren () {
        return this.get("children");
    },
    setupStorage () {
        window.addEventListener("storage", this.broadcastStorage.bind(this), false);
    },
    broadcastStorage (evt) {
        Radio.trigger("Storage", "updated", evt.key);
    }
});

export default InfoScreenModel;
