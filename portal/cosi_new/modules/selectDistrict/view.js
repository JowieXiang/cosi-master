import Template from "text-loader!./template.html";
import InfoTemplate from "text-loader!./info.html";
import "./style.less";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click button#Submit": "checkIfSelected",
        "click button#Reset": "reset",
        "click button#Help": "showHelp",
        "click button#Draw": "toggleDrawSelection",
        "change input#buffer": "setBuffer"
    },
    initialize: function () {
        this.scopeDropdownView = new SnippetDropdownView({
            model: this.model.get("scopeDropdownModel")
        });

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
            Radio.trigger("InfoScreen", "sendData", "The user is 'bob' and the password is 'secret'",
                "https://localhost:9001/portal/cosi_new/infoscreen.html");

        }
    },
    model: {},
    scopeDropdownView: {},
    template: _.template(Template),

    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));

            this.$el.find(".dropdown").append(this.scopeDropdownView.render().el);
        }
        return this;
    },

    getSelectedDistricts: function () {
        return this.model.getSelectedDistricts();
    },
    checkIfSelected: function () {
        if (this.model.get("selectedDistricts").length === 0) {
            this.selectDistrictReminder();
            this.toggleIsActive();
        }
        else {
            this.toggleIsActive();
        }
    },
    toggleIsActive: function () {
        this.model.toggleIsActive();
    },
    toggleDrawSelection: function () {
        this.model.toggleDrawSelection();
    },
    selectDistrictReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Warnung: Sie haben noch keine Gebiete ausgewählt. Es werden keine Datensätze geladen. <br /> Sie können trotzdem Fachdaten-Ebenen für die gesamte Stadt anzeigen lassen und Gebiete nach Parametern ermitteln.</strong>",
            kategorie: "alert-warning"
        });
    },
    reset () {
        this.model.resetSelectedDistricts();
    },
    showHelp: function () {
        Radio.trigger("Alert", "alert", {
            text: InfoTemplate,
            kategorie: "alert-info"
        });
    },
    setBuffer: function (evt) {
        this.model.set("buffer", parseInt(evt.target.value, 10));
    }
});

export default SelectDistrictView;
