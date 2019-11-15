import Tool from "../../../../../modules/core/modelList/tool/model";

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
                    // this.updateWindow();
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
        window.addEventListener("message", this.receiveData.bind(this), false);
        this.setIsWindowOpen(true);
    },
    broadcastRadio (channel, event) {
        console.log(channel, event);
    },
    sendData (data, target, attr) {
        this.window.postMessage({
            [target]: {
                [attr]: data
            }
        }, Config.remoteInterface.postMessageUrl);
    },
    receiveData (evt) {
        if (!evt.data.type) {
            for (const target in evt.data) {
                const foundTarget = Radio.request("ModelList", "getModelByAttributes", {id: target});

                if (foundTarget) {
                    for (const attr in evt.data[target]) {
                        foundTarget.set(attr, evt.data[target][attr]);
                    }
                }
            }
        }
    },
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
    }
});

export default InfoScreenHandler;
