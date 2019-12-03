import Template from "text-loader!./template.html";
import TableTemplate from "text-loader!./tableTemplate.html";
import ContextActions from "text-loader!./ContextActions.html";
import "./style.less";
import DropdownView from "../../../../modules/snippets/dropdown/view";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";

const DashboardTableView = Backbone.View.extend({
    events: {
        "click .district": "zoomToFeature",
        "mouseup .row": "contextMenuTable",
        "click .prop button.open": "toggleTimelineTable",
        "click thead button.open": "toggleGroup",
        "click .btn-reset": "resetDropDown",
        "click .toggle-col": "toggleCol"
    },
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});
        this.exportFilteredButtonView = new ExportButtonView({model: this.model.get("exportFilteredButtonModel")});
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});
        this.contextActionsEl = $(this.contextActions());
        this.updateRatioSelection();

        this.listenTo(this.model, {
            "isReady": this.render,
            "ratioValuesUpdated": this.updateRatioSelection
        });
    },
    id: "dashboard-table",
    className: "dashboard-table",
    model: {},
    exportButtonView: {},
    exportFilteredButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    tableTemplate: _.template(TableTemplate),
    contextActions: _.template(ContextActions),
    contextActionsEl: {},
    render: async function () {
        var attr = this.model.toJSON();

        if (!Radio.request("InfoScreen", "getIsWindowOpen") || Radio.request("InfoScreen", "getIsInfoScreen")) {
            if (!Radio.request("Dashboard", "getWidgetById", "dashboard") && Radio.request("Dashboard", "dashboardOpen")) {
                this.$el.html(this.template(attr));
                this.$el.find(".filter-dropdown").prepend(this.filterDropdownView.render().el);

                Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
                    id: "dashboard",
                    name: "Übersicht",
                    glyphicon: "glyphicon-stats",
                    append: false,
                    width: "100%"
                });
            }

            this.$el.find(".table").html(this.tableTemplate(attr));
            this.$el.find("#export-button").html(this.exportButtonView.render().el);
            this.$el.find("#export-button-filtered").html(this.exportFilteredButtonView.render().el);
        }

        this.delegateEvents();

        return this;
    },
    updateRatioSelection () {
        var selectionText = this.$el.find("span#row-selection");

        if (this.model.getAttrsForRatio().length === 0) {
            this.contextActionsEl.find("li#selection span").empty();
            this.contextActionsEl.find("li.calculate").addClass("inactive");
            return selectionText.empty();
        }

        if (this.model.getAttrsForRatio().length >= 2) {
            this.contextActionsEl.find("li.calculate").removeClass("inactive");
        }

        this.contextActionsEl.find("li#selection span").html("<br />" + this.model.getAttrsForRatio().join(" / "));
        return selectionText.html(`<strong>Auswahl:</strong> ${this.model.getAttrsForRatio()[0] ? this.model.getAttrsForRatio()[0] + " (y)" : ""}${this.model.getAttrsForRatio()[1] ? " / " + this.model.getAttrsForRatio()[1] + " (x)" : ""}`);
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
    },
    clearChart: function () {
        this.$el.find(".basic-graph-header").html("");
        this.$el.find(".dashboard-graph").empty();
    },
    createCorrelation () {
        this.model.createCorrelation();
        this.model.deleteAttrsForCorrelation();
    },
    toggleTimelineTable: function (event) {
        event.stopPropagation();
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },
    toggleGroup: function (event) {
        event.stopPropagation();
        const group = this.$(event.target).closest("thead").attr("id");

        this.$el.find(`tbody#${group}`).toggleClass("open");
    },
    toggleCol: function (event) {
        event.stopPropagation();

        const cellIndex = event.target.parentNode.cellIndex;

        this.el.querySelectorAll("tr").forEach((row) => {
            $(row.children[cellIndex]).toggleClass("minimized");
        });
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
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text and unstyle the district features
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.get("filterDropdownModel").updateSelectedValues([]);
        this.$el.find(".filter-dropdown ul.dropdown-menu > li").removeClass("selected");
    },
    contextMenuTable: function (event) {
        const row = this.$(event.target).closest("tr"),
            contextActions = this.contextActionsEl;

        // Create Bar Chart
        $(contextActions).find("li#barChart #input-year button").on("click", function () {
            this.model.createChart([row.find("th.prop").attr("id")],
                "BarGraph",
                row.find("th.prop").text(),
                false,
                $(contextActions).find("li#barChart #input-year input").val()
            );
        }.bind(this));

        // Create unscaled Line Chart
        $(contextActions).find("li#lineChart #unscaled").on("click", function () {
            this.model.createChart([row.find("th.prop").attr("id")], "Linegraph", row.find("th.prop").text());
        }.bind(this));

        // Create scaled Line Chart
        $(contextActions).find("li#lineChart #scaled").on("click", function () {
            this.model.createChart([row.find("th.prop").attr("id")], "Linegraph", row.find("th.prop").text(), true);
        }.bind(this));

        // Create Timeline
        $(contextActions).find("li#timeline").on("click", function () {
            Radio.trigger("Dashboard", "destroyWidgetById", "time-slider");
            Radio.trigger("TimeSlider", "create", row.find("th.prop").text());
        });

        // Delete Selection
        $(contextActions).find("li#delete-selection").on("click", function () {
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create new ratio data
        // Add numerator
        $(contextActions).find("li#numerator").on("click", function () {
            this.model.addAttrForRatio(row.find("th.prop").attr("id"), 0);
        }.bind(this));

        // Add denominator
        $(contextActions).find("li#denominator").on("click", function () {
            this.model.addAttrForRatio(row.find("th.prop").attr("id"), 1);
        }.bind(this));

        // Create unscaled Correlation
        $(contextActions).find("li#correlation #unscaled").on("click", function () {
            this.model.createCorrelation(false);
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create scaled Correlation
        $(contextActions).find("li#correlation #scaled").on("click", function () {
            this.model.createCorrelation(true);
            this.model.deleteAttrsForRatio();
        }.bind(this));

        // Create new Data Row
        $(contextActions).find("li#ratio").on("click", function () {
            this.model.createRatio();
            this.model.deleteAttrsForRatio();
        }.bind(this));

        Radio.trigger("ContextMenu", "setActions", contextActions, row.find("th.prop").text(), "glyphicon-stats");

        // Set the current year for all inputs
        $(contextActions).find("li#barChart #input-year input").val(new Date().getFullYear() - 1);

        // Highlight the selected row
        row.parent("tbody").parent("table").find("tr").removeClass("selected");
        row.addClass("selected");
    }
});

export default DashboardTableView;
