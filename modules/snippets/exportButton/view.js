import Template from "text-loader!./template.html";
import JsPDF from "jspdf";
import html2canvas from "html2canvas";

const ExportButtonView = Backbone.View.extend({
    events: {
        "click .btn": "export"
    },
    initialize: function () {
        window.html2canvas = html2canvas;

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
    export: function () {
        if (this.model.get("data") === "printHtml") {
            this.print();
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
    },
    print: function () {
        const pdf = new JsPDF(),
            html = document.querySelector(this.model.get("rawData"));

        pdf.html(html, {
            callback: function () {
                pdf.save();
            }
        });
    }
});

export default ExportButtonView;
