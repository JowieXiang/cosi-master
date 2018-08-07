define([
    "backbone",
    "config",
    "text!modules/cosi/template.html",
    "modules/cosi/model"
], function (Backbone, Config, Template, CosiModel) {

    var CosiView = Backbone.View.extend({
        template: _.template(Template),
        model: CosiModel,
        className: "cosi",
        events: {
            "click .cosi-field": "fieldClicked"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
            $(".ol-viewport").append(this.$el.html(this.template(attr)));
        },
        fieldClicked : function (evt) {
            var clickTarget = $(evt.currentTarget);
            if(!clickTarget.hasClass("selected")) {
                $(".cosi-field").each(function( index ) {
                    $( this ).removeClass("selected");
                });
                clickTarget.addClass("selected");
                Radio.trigger("Cosi", "selectTopic", clickTarget.attr('name').trim());
            }
        }
    });

    return CosiView;
});
