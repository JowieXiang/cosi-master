import Template from "text-loader!./template.html";
import "./style.less";
import DropdownView from "../../../../modules/snippets/dropdown/view";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";

const DashboardTableView = Backbone.View.extend({
    events: {
        "click .district": "zoomToFeature",
        "click .row": "createChart",
        "click .prop button.open": "toggleTimelineTable",
        "click .figure > .header > button.open": "toggleFigure"
    },
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});

        this.listenTo(this.model, {
            "isReady": this.render,
            "updateProperties": function () {
                this.renderFilter();
            },
            "tableViewFilter": function (selectedValues) {
                this.showFilteredTable(selectedValues.values);
            }
        });
    },
    id: "dashboard-table",
    className: "dashboard-table",
    model: {},
    exportButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    render: async function () {
        var attr = this.model.toJSON();

        if (!Radio.request("InfoScreen", "getIsWindowOpen")) {
            this.$el.html(this.template(attr));
            this.$el.find("#export-button").append(this.exportButtonView.render().el);

            this.renderFilter();
            Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
                id: "",
                name: "Übersicht",
                glyphicon: "glyphicon-stats"
            });
        }

        this.delegateEvents();

        return this;
    },
    renderFilter () {
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});
        this.$el.find(".filter-dropdown").html(this.filterDropdownView.render().el);
    },
    showFilteredTable (selectedValues) {
        _.each(this.$el.find(".overview tr"), (row, i) => {
            if (i > 2) {
                if (selectedValues.length > 0) {
                    if (!selectedValues.includes($(row).find("th.prop").attr("id"))) {
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
        const districtName = event.target.innerHTML;

        Radio.trigger("SelectDistrict", "zoomToDistrict", districtName);
    },
    createChart (event) {
        this.clearChart();

        const row = this.$(event.target).closest("tr"),
            firstValue = row.find("td").first().text();

        if (!isNaN(parseFloat(firstValue)) && !row.find("td").hasClass("timeline-table")) {
            this.model.createChart([row.find("th.prop").attr("id")], "BarGraph", row.find("th.prop").text());
        }
        else if (row.find("td").hasClass("timeline-table")) {
            this.model.createChart([row.find("th.prop").attr("id")], "Linegraph", row.find("th.prop").text());
        }
        // Highlight the selected row
        row.parent("tbody").find("tr").removeClass("selected");
        row.addClass("selected");
    },
    clearChart: function () {
        this.$el.find(".basic-graph-header").html("");
        this.$el.find(".dashboard-graph").empty();
    },
    toggleTimelineTable: function (event) {
        event.stopPropagation();
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },
    toggleFigure: function (event) {
        this.$(event.target).parent(".header").parent(".figure").toggleClass("open");
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

export default DashboardTableView;
