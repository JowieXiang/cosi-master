import Template from "text-loader!./template.html";

const ExportButtonView = Backbone.View.extend({
    events: {
        "click .btn": "download"
    },
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

        this.$el.html(this.template(attrs));
        this.delegateEvents();

        return this;
    },
    download: function () {
        const blob = this.model.get("data");

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.model.generateFilename());
        }
        else {
            const link = document.createElement("a");

            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);

                link.setAttribute("href", url);
                link.setAttribute("download", this.model.generateFilename());
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
});

export default ExportButtonView;
