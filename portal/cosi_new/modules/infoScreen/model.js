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

        // this.setupStorage();
        CosiStorage.setItem("infoScreenOpen", JSON.stringify(true));
        window.addEventListener("beforeunload", this.callClosed.bind(this), false);

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
    callClosed () {
        CosiStorage.setItem("infoScreenOpen", JSON.stringify(false));
    },
    getChildren () {
        return this.get("children");
    }
});

export default InfoScreenModel;
