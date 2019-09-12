import Template from "text-loader!./template.html";

const ExportButtonView = Backbone.View.extend({
    events: {},
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render
        });
    },
    model: {},
    className: "download-container",
    template: _.template(Template),
    render: function () {
        const attrs = this.model.toJSON();
        let url = "";

        if (this.model.get("data") instanceof Blob) {
            url = window.URL.createObjectURL(this.model.get("data"));
        }
        this.$el.html(this.template(attrs));
        this.$el.find("#download-link").attr({
            "href": url,
            "download": this.model.generateFilename()
        });

        this.delegateEvents();

        return this;
    },
});

export default ExportButtonView;