import Tool from "../../../../modules/core/modelList/tool/model";

const InfoScreenModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        id: "infoScreen",
        name: "Zweites Fenster öffnen",
        content: {},
        windowOpts: {},
        channel: Radio.channel("InfoScreen"),
        title: "",
        windowName: "",
        winOpts: {},
        infoScreenOpen: false
    }),
    initialize () {
        this.superInitialize();

        this.listenTo(this.get("channel"), {
            "showInInfoScreen": this.setContent,
            "addToInfoScreen": this.addContent,
            "clear": this.clear
        }, this);

        this.listenTo(this, {
            "change:isActive": this.notifyInfoScreen
        });
    },
    setContent (content) {
        this.set("content", content);
    },
    addContent (content) {
        console.log(content);
    },
    clear () {
        this.set("content", {});
    },
    getContent () {
        return this.get("content");
    },
    notifyInfoScreen () {
        this.set("infoScreenOpen", true);
        this.get("channel").trigger("infoScreenOpen");
    },
    getInfoScreenState () {
        return this.get("infoScreenOpen"); 
    }
});

export default InfoScreenModel;
