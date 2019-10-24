import { runInThisContext } from "vm";

const InfoScreenModel = Backbone.Model.extend({
    defaults: {
        id: "infoScreen",
        name: "CoSI Infoscreen",
        children: [],
        data: {}
    },
    initialize (opts) {
        for (const attr in opts) {
            this.set(attr, opts[attr]);
        }

        window.onmessage = this.receiveData;

        this.initChildren(this.getChildren());
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
    receiveData (data) {
        console.log(data);
    },
    sendData (data) {
        window.parent.sendMessage(data);
    },
    getChildren () {
        return this.get("children");
    }
});

export default InfoScreenModel;
