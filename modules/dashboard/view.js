import Template from "text-loader!./template.html";
import DropdownView from "../snippets/dropdown/view";
// import ExportButtonView from "../snippets/exportButton/view";

const DashboardView = Backbone.View.extend({
    events: {
        "click .close": "close",
        "click .district": "zoomToFeature",
        "click .row": "createChart",
        "click .prop button.open": "toggleTimelineTable",
        "click .figure > .header > button.open": "toggleFigure",
        "mousedown .drag-bar": "dragStart"
    },
    initialize: function () {
        // this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.render();
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            },
            "updateProperties": function () {
                if (this.model.get("isActive")) {
                    this.renderFilter();
                }
            },
            "tableViewFilter": function (selectedValues) {
                this.showFilteredTable(selectedValues.values);
            }
        });

        if (this.model.get("isActive") === true) {
            this.render();
        }

        window.addEventListener("mouseup", () => {
            this.dragEnd();
        });
        window.addEventListener("mousemove", (event) => {
            this.dragMove(event);
        });
    },
    id: "dashboard-view",
    className: "dashboard",
    model: {},
    exportButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    isDragging: false,
    startX: 0,
    render: async function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        // this.$el.find("#export-button").append(this.exportButtonView.render().el);

        this.renderFilter();

        Radio.trigger("Sidebar", "append", this.$el);
        Radio.trigger("Sidebar", "toggle", true, this.model.get("width"));

        this.delegateEvents();

        return this;
    },
    renderFilter () {
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});
        this.$el.find(".filter-dropdown").html(this.filterDropdownView.render().el);
    },
    showFilteredTable (selectedValues) {
        _.each(this.$el.find(".overview tr"), (row, i) => {
            if (i > 0) {
                if (selectedValues.length > 0) {
                    if (!selectedValues.includes($(row).find("th.prop").text())) {
                        $(row).addClass("hidden");
                    }
                    else {
                        $(row).removeClass("hidden");
                    }
                }
                else {
                    $(row).removeClass("hidden");
                }
            }
        });
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
            this.model.createChart([row.find("th.prop").text()]);

            // Highlight the selected row
            row.parent("tbody").find("tr").removeClass("selected");
            row.addClass("selected");

            // Add Header
            let title = row.find("th.prop").text();

            // Check if GFI table available
            if (this.model.get("tableView")[0].gfi) {
                // Check if entry for the selected row exists
                if (this.model.get("tableView")[0].gfi[row.find("th.prop").text()]) {
                    title = this.model.get("tableView")[0].gfi[row.find("th.prop").text()];
                }
            }

            this.$el.find(".basic-graph-header").html(`Diagramm: ${title}`);
        }
    },
    clearChart: function () {
        this.$el.find(".basic-graph-header").html("");
        this.$el.find(".dashboard-graph").empty();
    },
    toggleTimelineTable: function (event) {
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },
    toggleFigure: function (event) {
        this.$(event.target).parent(".header").parent(".figure").toggleClass("open");
    },
    close: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },
    dragStart: function () {
        this.isDragging = true;
        this.$el.find(".drag-bar").addClass("dragging");
    },
    dragMove: function (event) {
        if (this.isDragging) {
            const newWidth = (((window.innerWidth - event.clientX) / window.innerWidth) * 100).toFixed(2) + "%";

            Radio.trigger("Sidebar", "resize", newWidth);
        }
    },
    dragEnd: function () {
        this.isDragging = false;
        this.$el.find(".drag-bar").removeClass("dragging");
    }
});

export default DashboardView;
