import "./style.less";
import template from "text-loader!./template.html";
import SnippetDropdownView from "../../../../modules/snippets/dropdown/view";

const ColorCodeMapView = Backbone.View.extend({
    events: {
        "click .btn-reset": "resetDropDown",
        "click .btn-prev-next": "prevNext"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "clearLegend": this.clearLegend,
            "setLegend": this.setLegend
        });

        this.listenTo(Radio.channel("SelectDistrict"), {
            "selectionChanged": this.checkDistrictSelection
        });

        this.render();
    },
    template: _.template(template),
    render: function () {
        $(".masterportal-container").append(this.$el.html(this.template()));
        this.renderDropDownView(this.model.get("dropDownModel"));
        this.$el.find("button").prop("disabled", true);
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
    prevNext: function (evt) {
        const options = this.$el.find(".selectpicker option"),
            direction = $(evt.target).attr("title") === "next" ? 1 : -1,
            currentIndex = this.$el.find(".selectpicker").get(0).selectedIndex;
        let newIndex = currentIndex + direction === 0 ? currentIndex + direction * 2 : currentIndex + direction;

        if (newIndex >= options.length) {
            newIndex = 1;
        }
        else if (newIndex <= 0) {
            newIndex = options.length - 1;
        }

        options.prop("selected", false);
        options.get(newIndex).setAttribute("selected", true);
        this.setDropdownValues(newIndex, options.get(newIndex).value);
    },
    setDropdownValues: function (index, value) {
        this.$el.find(".selectpicker").get(0).selectedIndex = index;
        this.$el.find(".dropdown-toggle span.filter-option").text(value);
        this.model.get("dropDownModel").updateSelectedValues(value);
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text and unstyle the district features
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.unStyleDistrictFeaturs(this.model.get("districtFeatures"));
        this.$el.find(".dropdown-toggle").addClass("bs-placeholder");
        this.setDropdownValues(0, "Statistische Daten anzeigen");
        this.clearLegend();
    },
    checkDistrictSelection (extent) {
        if (extent.length > 0) {
            this.$el.find("button").prop("disabled", false);
        }
        else {
            this.$el.find("button").prop("disabled", true);
        }
    }
});

export default ColorCodeMapView;
