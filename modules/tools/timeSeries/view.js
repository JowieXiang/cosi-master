import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import SnippetSliderView from "../../snippets/slider/view";

const TimeSeriesView = Backbone.View.extend({
    events: {
        "click button": "buttonClickCallback"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "renderDropDownView": this.renderDropDownView,
            "renderSliderView": this.renderSliderView,
            "renderGraph": this.renderGraph,
            "stopRunning": this.setButtonToPlay
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

    buttonClickCallback: function () {
        if (this.model.get("isRunning")) {
            this.setButtonToPlay();
            this.model.setIsRunning(false);
        }
        else {
            this.setButtonToPause();
            this.model.setIsRunning(true);
            this.model.runningTimeSeries();
        }
    },

    setButtonToPlay: function () {
        this.$el.find(".glyphicon").addClass("glyphicon-play");
        this.$el.find(".glyphicon").removeClass("glyphicon-pause");
    },

    setButtonToPause: function () {
        this.$el.find(".glyphicon").addClass("glyphicon-pause");
        this.$el.find(".glyphicon").removeClass("glyphicon-play");
    },

    renderGraph: function (graphData, value) {
        this.$el.find(".dashboard-graph").empty();

        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".dashboard-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: graphData,
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
