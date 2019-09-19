import Template from "text-loader!./template.html";
import ExportButtonView from "../snippets/exportButton/view";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "click .district": "zoomToFeature",
        "click .row": "createChart",
        "click button.open": "toggleTimelineTable"
    },
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.render();
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            }
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    id: "dashboard-view",
    className: "dashboard",
    model: {},
    exportButtonView: {},
    template: _.template(Template),
    render: async function () {
        var attr = this.model.toJSON();

        // attr.tableView = Radio.request("Timeline", "createTimelineTable", attr.tableView);
        console.log(attr.tableView);

        this.$el.html(this.template(attr));
        this.$el.find("#export-button").append(this.exportButtonView.render().el);

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        this.delegateEvents();

        return this;
    },
    zoomToFeature (event) {
        const scope = event.target.innerHTML;

        this.model.zoomAndHighlightFeature(scope);
    },
    createChart (event) {
        this.clearChart();

        const row = this.$(event.target).parent("tr"),
            firstValue = row.find("td").first().html();

        if (!isNaN(parseFloat(firstValue))) {
            this.model.createChart([row.find("th.prop").html()]);

            // Highlight the selected row
            row.parent("tbody").find("tr").removeClass("selected");
            row.addClass("selected");

            // Add Header
            let title = row.find("th.prop").html();

            // Check if GFI table available
            if (this.model.get("tableView")[0].gfi) {
                // Check if entry for the selected row exists
                if (this.model.get("tableView")[0].gfi[row.find("th.prop").html()]) {
                    title = this.model.get("tableView")[0].gfi[row.find("th.prop").html()];
                }
            }

            this.$el.find(".basic-graph-header").html(`Diagramm: ${title}`);
        }
    },
    clearChart: function () {
        this.$el.find(".basic-graph-title").html("");
        this.$el.find(".dashboard-graph").empty();
    },
    toggleTimelineTable: function (event) {
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    }
});

export default DashboardView;