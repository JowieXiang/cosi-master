import initializeCockpitModel from "../cockpit/model";
import Template from "text-loader!./template.html";
import TemplateLegend from "text-loader!./template_legend.html";
import "bootstrap/js/dropdown";
import "bootstrap-select";
import "./style.less";

const CockpitView = Backbone.View.extend({
    events: {
        "changed.bs.select .selectpicker-district": function (evt) {
            this.mapSelectedValues(evt, "districts");
            this.redrawGraphs();
            this.renderLegend();
        },
        "changed.bs.select .selectpicker-suburb": function (evt) {
            this.mapSelectedValues(evt, "suburbs");
            this.redrawGraphs();
            this.renderLegend();
        },
        "changed.bs.select .selectpicker-year": function (evt) {
            this.mapSelectedValues(evt, "years");
            this.redrawGraphs();
        },
        "click input.month": function (e) {
            this.model.setFilterObjectByKey("monthMode", e.target.checked);
            this.redrawGraphs();
        },
        "click input.flat": function (e) {
            this.model.setFilterObjectByKey("flatMode", e.target.checked);
            this.redrawGraphs();
        }
    },
    /**
     * Initialize function
     * @returns {void}
     */
    initialize: function () {
        this.model = initializeCockpitModel();
        this.render(this.model, this.model.get("isActive"));
    },
    id: "cockpit_bauvorhaben",
    template: _.template(Template),
    templateLegend: _.template(TemplateLegend),
    /**
     * Todo
     * @param {initializeCockpitModel} model Todo
     * @param {Boolean} value Todo
     * @returns {CockpitView} - Todo
     */
    render: function (model, value) {
        if (value) {
            const attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true, "40%");
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            Radio.trigger("Sidebar", "toggle", false);
            this.undelegateEvents();
        }
        this.initDropdown();
        return this;
    },
    /**
     * Renders legend
     * @returns {void}
     */
    renderLegend: function () {
        const districts = this.model.get("filterObject").districts,
            suburbs = this.model.get("filterObject").suburbs,
            administrativeUnits = suburbs.length > 0 ? suburbs : districts;

        this.$el.find(".legend").html("");
        this.$el.find(".legend").html(this.templateLegend({administrativeUnits: administrativeUnits}));
    },
    /**
     * inits the dropdown list
     * @see {@link https://developer.snapappointments.com/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdown: function () {
        this.$el.find(".selectpicker").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            actionsBox: true,
            deselectAllText: "Nichts auswählen",
            selectAllText: "Alle auswählen"
        });
        // selects all items
        this.$el.find(".selectpicker-district").selectpicker("selectAll");
        this.$el.find(".selectpicker-year").selectpicker("selectAll");
    },

    /**
     * maps the selected values from multiple drop-down list
     * @param {jQuery.Event} evt - changed event
     * @param {string} key - districts or years
     * @returns {void}
     */
    mapSelectedValues: function (evt, key) {
        let selectedValues = Array.from(evt.target.options).map(function (option) {
            const isOptionSelected = $(option)[0].selected;
            let value;

            if (isOptionSelected) {
                value = $(option)[0].value;
                if (!isNaN(parseInt(value, 10))) {
                    value = parseInt(value, 10);
                }
            }
            return value;
        });

        selectedValues = _.without(selectedValues, undefined);
        this.model.setFilterObjectByKey(key, selectedValues);
    },
    redrawGraphs: function () {
        this.$el.find(".graph-svg").remove();
        this.model.prepareDataForGraph();
    }
});

export default CockpitView;
