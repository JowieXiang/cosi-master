import "./style.less";
import template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";

const ColorCodeMapView = Backbone.View.extend({
    events: {
        "click .btn-reset": "resetDropDown"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "clearLegend": this.clearLegend,
            "setLegend": this.setLegend
        });

        this.render();
    },
    template: _.template(template),
    render: function () {
        $(".masterportal-container").append(this.$el.html(this.template()));
        this.renderDropDownView(this.model.get("dropDownModel"));
        return this;
    },
    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({model: dropdownModel});

        this.$el.find(".color-code").prepend(dropdownView.render().el);
    },

    clearLegend: function () {
        this.$el.find("#color-code-legend").empty();
    },
    setLegend: function (data) {
        for (let i = 0; i < data.values.length; i++) {
            this.$el.find("#color-code-legend").append(`
            <li style="display:inline;">
                <svg width="20" height="20">
                    <rect width="20"  height="20" style="fill:${data.colors[i]};stroke-width:.5;stroke:rgb(0,0,0)" />
                </svg>
                    <span style="font-size: 20px;">${Number.isInteger(data.values[i]) ? data.values[i] : data.values[i].toFixed(2)}</span>
            </li>
            `);
        }
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text and unstyle the district features
     * @returns {void}
     */
    resetDropDown: function () {
        this.$el.find(".dropdown-toggle").addClass("bs-placeholder");
        this.$el.find(".dropdown-toggle span.filter-option").text("Demografische Daten anzeigen");
        this.model.unStyleDistrictFeaturs(this.model.get("districtFeatures"));
        this.clearLegend();
    }
});

export default ColorCodeMapView;
