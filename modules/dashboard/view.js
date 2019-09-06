import Template from "text-loader!./template.html";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "click .district": "zoomToFeature",
        "click .row": "createChart"
    },
    initialize: function () {
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
    template: _.template(Template),
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));

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
            row.parent("tbody").find("tr").css("background", "transparent");
            row.css({
                background: "#3399CC"
            });

            // Add Header
            this.$el.find(".basic-graph-header").html(`Diagramm: ${row.find("th.prop").html()}`);
        }
    },
    clearChart () {
        this.$el.find(".basic-graph-title").html("");
        this.$el.find(".dashboard-graph").empty();
    },
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    }
});

export default DashboardView;