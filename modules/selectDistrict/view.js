import SelectDistrictModel from "./model";
import Template from "text-loader!./template.html";
import SnippetDropdownView from "../snippets/dropdown/view";

const SelectDistrictView = Backbone.View.extend({
    events: {
        "click button#Submit": "checkIfSelected"
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
        }
    },
    model: new SelectDistrictModel(),
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
        }
        else {
            this.toggleIsActive();
        }
    },
    toggleIsActive: function () {
        this.model.toggleIsActive();
    },
    selectDistrictReminder: function () {
        Radio.trigger("Alert", "alert", {
            text: "<strong>Warnung: Sie haben noch keine Gebiete ausgewählt. Bitte wählen Sie auf welcher Ebene Sie arbeiten möchten (**Stadtteile oder statistische Gebiete)* *und klicken Sie entsprechend auf die Karte, um die Gebiete auszuwählen, mit denen Sie arbeiten möchten.</strong>",
            kategorie: "alert-warning"
        });
    }
});

export default SelectDistrictView;
