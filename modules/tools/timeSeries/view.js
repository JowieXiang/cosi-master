import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import SnippetSliderView from "../../snippets/slider/view";

const TimeSeriesView = Backbone.View.extend({
    initialize: function () {
        this.listenToOnce(this.model, {
            "change:isActive": function () {
                this.scopeDropdownView = new SnippetDropdownView({model: this.model.get("dropdownModel")});
            }
        });

        this.listenTo(this.model, {
            "change:isActive": function () {
                this.render();
                this.renderSlider(this.model.get("value"));
            },
            "renderSlider": this.renderSlider
        });

        if (this.model.get("isActive") === true) {
            this.scopeDropdownView = new SnippetDropdownView({model: this.model.get("dropdownModel")});
            this.render();
        }
    },
    id: "time-series",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.$el.find(".dropdown").append(this.scopeDropdownView.render().el);
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();

        return this;
    },

    renderSlider: function (value) {
        this.$el.find(".dashboard-graph").empty();
        const sliderView = new SnippetSliderView({model: this.model.get("sliderModel")});

        this.$el.find(".slider-container").remove();
        this.$el.append(sliderView.render().$el);
        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".dashboard-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: this.model.get("graphData"),
            attrToShowArray: ["jahr_" + value],
            xAttr: "stat_gebiet",
            xAxisLabel: "stat_gebiet",
            yAxisLabel: "jahr_" + value,
            margin: {
                left: 40,
                top: 25,
                right: 20,
                bottom: 40
            },
            width: 300,
            height: $(window).height() * 0.15,
            svgClass: "dashboard-grapg-svg"
        });
    }
});

export default TimeSeriesView;
