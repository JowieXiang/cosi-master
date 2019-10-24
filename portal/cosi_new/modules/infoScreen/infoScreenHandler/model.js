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
            "getIsWindowOpen": this.getIsWindowOpen
        }, this);

        this.listenTo(this, {
            "change:isActive": function (isActive) {
                if (isActive) {
                    this.castWindow();
                    this.setIsWindowOpen(true);
                }
                else {
                    this.setIsWindowOpen(false);
                }
            },
            "change:content": function () {
                if (this.get("infoScreenOpen")) {
                    this.renderContent();
                    this.updateWindow();
                }
            }
        });
    },
    castWindow () {
        this.window = window.open("/portal/cosi_new/infoscreen.html", "InfoScreen");
        window.onmessage = this.receiveData;
        this.setIsWindowOpen(true);
    },
    sendData (data, target, attr) {
        console.log(data, target, attr);
        this.window.postMessage({
            target: target,
            attr: attr,
            data: data
        });
    },
    receiveData (data) {
        if (!data.target) {
            for (const attr in data) {
                if (this.get("attr")) {
                    this.set("attr", data[attr]);
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
