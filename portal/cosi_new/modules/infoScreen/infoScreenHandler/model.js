import Tool from "../../../../../modules/core/modelList/tool/model";
import storageListener from "../../storage";

const InfoScreenHandler = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        id: "infoScreen",
        name: "Zweites Fenster öffnen",
        content: {},
        windowOpts: {},
        channel: Radio.channel("InfoScreen"),
        title: "",
        windowName: "",
        winOpts: {},
        infoScreenOpen: false,
        widgets: [],
        listens: {}
    }),
    initialize () {
        this.superInitialize();

        this.listenTo(this.get("channel"), {
            "sendData": this.sendData,
            "clear": this.clear
        }, this);

        this.get("channel").reply({
            "getIsWindowOpen": this.getIsWindowOpen,
            "getIsInfoScreen": function () {
                return false;
            }
        }, this);

        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.castWindow();
                }
            },
            "change:content": function () {
                if (this.get("infoScreenOpen")) {
                    this.renderContent();
                }
            },
            "change:infoScreenOpen": function (model, isOpen) {
                if (!isOpen) {
                    this.setIsActive(false);
                }
            }
        });
    },
    castWindow () {
        this.window = window.open("./infoscreen.html", "InfoScreen");

        this.setupStorage();
        this.setIsWindowOpen(true);

        // window.addEventListener("message", this.receiveData.bind(this), false);
    },
    // sendData (data, target, attr) {
    //     this.window.postMessage({
    //         [target]: {
    //             [attr]: data
    //         }
    //     });
    // },
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
    clear () {
        this.set("content", {});
    },
    getIsWindowOpen () {
        return this.get("infoScreenOpen");
    },
    setIsWindowOpen (state) {
        this.set("infoScreenOpen", state);
        if (this.get("infoScreenOpen")) {
            this.get("channel").trigger("infoScreenOpen");
        }
    },
    getWidgets () {
        return this.get("widgets");
    },
    setupStorage () {
        window.addEventListener("storage", this.broadcastStorage.bind(this), false);
    },
    broadcastStorage (evt) {
        Radio.trigger("Storage", "updated", evt.key);
    }
});

export default InfoScreenHandler;
