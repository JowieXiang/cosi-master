import Template from "text-loader!./template.html";
import SnippetSliderView from "../../../../modules/snippets/slider/view";
import TimeSliderModel from "./model";
import "./style.less";

const TimeSliderView = Backbone.View.extend({
    events: {
        "click button.btn-slider": "buttonClickCallback",
        "click button.close": function () {
            this.model.setIsActive(false);
        }
    },
    initialize: function () {
        this.model = new TimeSliderModel();
        this.listenTo(this.model, {
            "render": this.render,
            "renderSliderView": this.renderSliderView,
            "renderGraph": this.renderGraph,
            "stopRunning": this.setButtonToPlay
        });
    },
    id: "time-series",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.delegateEvents();

        return this;
    },

    renderSliderView: function (sliderModel, title) {
        const sliderView = new SnippetSliderView({model: sliderModel});

        this.$el.find(".slider-container").remove();
        this.$el.find(".time-series-slider").prepend(sliderView.render().$el);
        Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
            id: "time-slider",
            name: "Zeitreihen Analyse " + title,
            glyphicon: "glyphicon-time"
        });
    },

    buttonClickCallback: function () {
        if (this.model.get("isRunning")) {
            this.setButtonToPlay();
            this.model.setIsRunning(false);
        }
        else {
            this.setButtonToPause();
            this.model.setIsRunning(true);
            this.model.runningTimeSlider();
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

        Radio.trigger("GraphV2", "createGraph", {
            graphType: "BarGraph",
            selector: ".time-series-graph",
            scaleTypeX: "ordinal",
            scaleTypeY: "linear",
            data: graphData,
            attrToShowArray: ["jahr_" + value],
            xAttr: "statgebiet",
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
            width: $(window).width() * 0.4,
            height: $(window).height() * 0.4,
            svgClass: "time-series-graph-svg"
        });
    }
});

export default TimeSliderView;
