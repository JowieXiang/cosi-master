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
        widgets: []
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
                    this.updateWindow();
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
        this.window = window.open("/portal/cosi_new/infoscreen.html", "InfoScreen");
        window.addEventListener("message", this.receiveData.bind(this), false);
        this.setIsWindowOpen(true);
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
