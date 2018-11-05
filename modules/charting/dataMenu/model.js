// define(function (require) {
//     var Backbone = require("backbone"),
//         Radio = require("backbone.radio"),
//         Model;

const Model = Backbone.Model.extend({

    // wird aufgerufen wenn das Model erstellt wird
    initialize: function () {

        var channel = Radio.channel("dataVisualisation");
        channel.reply({
            "getLayer": function () {
                return this.get("layer");
            }
        }, this);

        this.listenTo(Radio.channel("Window"), {
            "winParams": this.setStatus
        });

        Radio.trigger("Autostart", "initializedModul", "dataVisualisation");
        this.setDataMap("dataMap", ["Schülerstruktur", "Alterstruktur", "Altersentwicklung", "Haushaltsstruktur", "Fruchtkonsum"]);
        this.setDataMap("bezirke", ["Hamburg-Mitte", "Altona", "Eimsbüttel", "Hamburg-Nord", "Wandsbek", "Bergedorf", "Harburg"]);
    },
    setStatus: function (args) {
        if (args[2]["id"] === "dataVisualisation" && args[0] === true) {
            this.set("isCollapsed", args[1]);
            this.set("isCurrentWin", args[0]);
        }
        else {
            this.set("isCurrentWin", false);
            Radio.trigger("Map", "removeInteraction", this.get("dataVisualisation"));
        }
    },

    // Für die aktuell verfügbaren Datenvisualisierungen
    setDataMap: function (mapName, value) {
        this.set(mapName, value);
    },
    getDataMap: function () {
        return this.get("dataMap");
    }
});
export default Model;
