define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        DataMenuTemplate = require("text!modules/dataMenu/template.html"),
        DataMenuModel = require("modules/dataMenu/model"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        View;

    View = Backbone.View.extend({

        // Konvention: Id = Name des Moduls
        id: "data-vis",
        model: new DataMenuModel(),
        // underscore template Funktion
        template: _.template(DataMenuTemplate),
        events: {
            "change .input-checkbox": "showVisualisation",
            "click .clear-data": "clearVisualisation"
        },

        initialize: function () {
            this.listenTo(this.model, {
                //Soll als Menü angezeigt werden
                "change:isCollapsed change:isCurrentWin": this.render
            });
            this.render();
        },
        // Konvention: Die Methode fürs zeichnen der View, heißt render.
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            } else {
                this.undelegateEvents();
            }
        },

        showVisualisation: function (evt) {
            Radio.trigger("chartCaller", "createChart", [evt.currentTarget.value, evt.currentTarget.checked]);
        },

        clearVisualisation: function (evt) {
            Radio.trigger("chartCaller", "deleteAll");
            $(".input-checkbox").prop("checked", false );
        }
    });
    return View;
});
