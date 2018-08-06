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
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();
            $(".ol-viewport").append(this.$el.html(this.template(attr)));
        }
    });

    return CosiView;
});
