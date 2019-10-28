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

        this.addListeners();

        Radio.channel("FeaturesLoader").reply({
            "getDistrictsByValue": () => {
                console.log("reply");
                return 0;
            }
        });
    },
    addListeners () {
        const listens = this.get("listens");

        for (const channel in listens) {
            for (let i = 0; i < listens[channel].length; i++) {
                console.log(channel, listens[channel][i]);
                Radio.channel(channel).reply({
                    [listens[channel][i]]: this.broadcastRadio(channel, listens[channel][i])
                });
            }
        }
    },
    castWindow () {
        this.window = window.open("/portal/cosi_new/infoscreen.html", "InfoScreen");
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
        });
    },
    receiveData (event) {
        if (!event.data.target) {
            for (const attr in event.data) {
                if (this.get(attr)) {
                    this.set(attr, event.data[attr]);
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
