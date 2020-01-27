import Template from "text-loader!./template.html";
// import JsPDF from "jspdf";

const ExportButtonView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "download": this.download
        });
    },
    model: {},
    className: "download-container",
    template: _.template(Template),
    render: function () {
        const attrs = this.model.toJSON();

        this.$el.html(this.template(attrs));
        this.el.querySelector(".btn").addEventListener("pointerup", this.export.bind(this));
        this.delegateEvents();

        return this;
    },
    export: function () {
        if (typeof this.model.get("rawData") === "string") {
            this.model.htmlToCanvas();
        }
        else {
            this.download();
        }
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
