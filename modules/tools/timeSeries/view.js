import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import SnippetSliderView from "../../snippets/slider/view";

const TimeSeriesView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "renderDropDownView": this.renderDropDownView,
            "renderSliderView": this.renderSliderView,
            "createGraph": this.createGraph
        });
    },
    id: "time-series",
    template: _.template(Template),
    render: function () {
        this.$el.html(this.template());
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();

        return this;
    },

    renderDropDownView: function (dropdownModel) {
        const dropdownView = new SnippetDropdownView({model: dropdownModel});

        this.$el.find(".dropdown").append(dropdownView.render().el);
    },

    renderSliderView: function (sliderModel) {
        const sliderView = new SnippetSliderView({model: sliderModel});

        this.$el.find(".slider-container").remove();
        this.$el.find(".slider").prepend(sliderView.render().$el);
    },

    createGraph: function (value) {
        console.info(value);
        this.$el.find(".dashboard-graph").empty();
        // const sliderView = new SnippetSliderView({model: this.model.get("sliderModel")});

        // this.$el.find(".slider-container").remove();
        // this.$el.append(sliderView.render().$el);
        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".dashboard-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: this.model.get("graphData"),
            attrToShowArray: ["jahr_" + value],
            xAttr: "stat_gebiet",
            xAxisLabel: {
                "rotate": 45
            },
            yAxisLabel: "jahr_" + value,
            margin: {
                left: 60,
                top: 20,
                right: 20,
                bottom: 40
            },
            width: document.getElementsByClassName("sidebar")[0].offsetWidth - 20,
            height: document.getElementsByClassName("sidebar")[0].offsetHeight - (document.getElementsByClassName("sidebar")[0].offsetHeight * 0.75),
            svgClass: "dashboard-grapg-svg"
        });
    }
});

export default TimeSeriesView;
