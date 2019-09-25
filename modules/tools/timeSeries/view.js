import Template from "text-loader!./template.html";
import SnippetDropdownView from "../../snippets/dropdown/view";
import SnippetSliderView from "../../snippets/slider/view";

const TimeSeriesView = Backbone.View.extend({
    events: {
        "click button.btn-slider": "buttonClickCallback",
        "click button.close": function () {
            this.model.setIsActive(false);
        }
    },
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "renderDropDownView": this.renderDropDownView,
            "renderSliderView": this.renderSliderView,
            "renderGraph": this.renderGraph,
            "stopRunning": this.setButtonToPlay,
            "remove": this.remove
        });
    },
    id: "time-series",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true, "40%");
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
        this.$el.find(".time-series-slider").prepend(sliderView.render().$el);
    },

    remove: function () {
        this.$el.remove();
        Radio.trigger("Sidebar", "toggle", false);
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
        this.$el.find("button > .glyphicon").addClass("glyphicon-play");
        this.$el.find("button > .glyphicon").removeClass("glyphicon-pause");
    },

    setButtonToPause: function () {
        this.$el.find("button > .glyphicon").addClass("glyphicon-pause");
        this.$el.find("button > .glyphicon").removeClass("glyphicon-play");
    },

    renderGraph: function (graphData, value, getMaxYAxisValue) {
        this.$el.find(".time-series-graph").empty();

        Radio.trigger("Graph", "createGraph", {
            graphType: "BarGraph",
            selector: ".time-series-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: graphData,
            attrToShowArray: ["jahr_" + value],
            xAttr: "stat_gebiet",
            xAxisLabel: {
                "rotate": 45
            },
            yAxisLabel: {
                "maxValue": getMaxYAxisValue
            },
            margin: {
                left: 60,
                top: 20,
                right: 20,
                bottom: 40
            },
            width: document.getElementsByClassName("sidebar")[0].offsetWidth - 20,
            height: document.getElementsByClassName("sidebar")[0].offsetHeight - (document.getElementsByClassName("sidebar")[0].offsetHeight * 0.75),
            svgClass: "time-series-graph-svg"
        });
    }
});

export default TimeSeriesView;
