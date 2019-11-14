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
        "click .figure > .header > button.open": "toggleFigure",
        "click .btn-reset": "resetDropDown",
        "click #correlation-button": "createCorrelation"
    },
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});
        this.exportFilteredButtonView = new ExportButtonView({model: this.model.get("exportFilteredButtonModel")});
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});

        this.listenTo(this.model, {
            "isReady": this.render,
            "correlationValuesUpdated": this.renderCorrelationAttrs
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
    render: async function () {
        var attr = this.model.toJSON();

        if (!Radio.request("InfoScreen", "getIsWindowOpen")) {
            if (!Radio.request("Dashboard", "getWidgetById", "dashboard") && Radio.request("Dashboard", "dashboardOpen")) {
                this.$el.html(this.template(attr));
                this.$el.find(".filter-dropdown").prepend(this.filterDropdownView.render().el);


                Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
                    id: "dashboard",
                    name: "Übersicht",
                    glyphicon: "glyphicon-stats",
                    append: false
                });
            }
            if (attr.tableView.length === 0) {
                Radio.trigger("Dashboard", "destroyWidgetById", "dashboard");
            }

            this.$el.find(".table").html(this.tableTemplate(attr));
            this.$el.find("#export-button").html(this.exportButtonView.render().el);
            this.$el.find("#export-button-filtered").html(this.exportFilteredButtonView.render().el);
        }

        this.delegateEvents();

        return this;
    },
    renderCorrelationAttrs () {
        if (this.model.getAttrsForCorrelation().length > 0) {
            const btn = document.createElement("button");

            btn.className = "btn btn-primary";
            btn.id = "correlation-button";
            btn.innerHTML = `<strong>Korrelation erstellen:</strong><br /> ${this.model.getAttrsForCorrelation().join(" : ")}`;

            if (this.model.getAttrsForCorrelation().length < 2) {
                btn.setAttribute("disabled", true);
            }

            this.$el.find("#correlation").html(btn);
        }
        else {
            this.$el.find("#correlation").empty();
        }
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
    },
    toggleTimelineTable: function (event) {
        event.stopPropagation();
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },
    toggleGroup: function (event) {
        event.stopPropagation();
        const group = this.$(event.target).closest("thead").attr("id");

        // this.$(event.target).toggleClass("open");
        this.$el.find(`tbody#${group}`).toggleClass("open");
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
            contextActions = $(this.contextActions());

        // Create Bar Chart
        $(contextActions).find("li#barChart").get(0).addEventListener("click", function () {
            this.model.createChart([row.find("th.prop").attr("id")], "BarGraph", row.find("th.prop").text());
        }.bind(this));

        // Create Line Chart
        $(contextActions).find("li#lineChart").get(0).addEventListener("click", function () {
            this.model.createChart([row.find("th.prop").attr("id")], "Linegraph", row.find("th.prop").text());
        }.bind(this));

        // Add to Correlation
        $(contextActions).find("li#correlation").get(0).addEventListener("click", function () {
            this.model.addAttrForCorrelation(row.find("th.prop").attr("id"));
        }.bind(this));

        // Delete Correlation Data
        $(contextActions).find("li#delete-correlation").get(0).addEventListener("click", function () {
            this.model.deleteAttrsForCorrelation();
        }.bind(this));

        Radio.trigger("ContextMenu", "setActions", contextActions, row.find("th.prop").text(), "glyphicon-stats");

        // Highlight the selected row
        row.parent("tbody").parent("table").find("tr").removeClass("selected");
        row.addClass("selected");
    }
});

export default DashboardTableView;
