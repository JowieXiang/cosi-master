define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        ChartPanelTemplate = require("text!modules/chartPanel/template.html"),
        ChartPanelModel = require("modules/chartPanel/model"),
        PieModel = require("modules/tools/chartRenderer/pie/pieModel"),
        Renderer = require("modules/chartPanel/renderer"),
        PieView = require("modules/tools/chartRenderer/pie/pieView"),
        $ = require("jquery"),
        Radio = require("backbone.radio"),
        View;

    View = Backbone.View.extend({

        id: "chart-panel",
        model: new ChartPanelModel(),
        chartRender: new Renderer(),
        template: _.template(ChartPanelTemplate),
        pieView: new PieView(),
        pieModel: new PieModel(),

        events: {
        },
        initialize: function () {
            var channel = Radio.channel("chartCaller");
            channel.on({
                "createChart": function (callerData) {
                    console.log('Called ' + callerData[0] + ' value ' + callerData[1]);
                    this.render(callerData[0], callerData[1]);
                },
                "deleteAll": function () {
                    this.render('deleteAll', false);
                }
            }, this);
        },

        render: function (dataIdent, isVisible) {
            if (isVisible) {
                var attr = this.model.toJSON();
                if (!$(this.$el).is(':visible')) {
                    this.$el.html(this.template(attr));
                }
                var i = 1;
                var graphElement = this.$el.find('#graph-' + i);
                while ($(graphElement).children().length >= 1 && i <=4) {
                    graphElement = this.$el.find('#graph-' + i);
                    i++;
                }
                if ($(graphElement).children().length >= 1) {
                    graphElement = this.$el.find('#graph-1');
                }

                this.pieModel.setHtmlElement(graphElement);
                this.pieModel.setChartTitle(dataIdent);
                this.pieView.setPieModel(this.pieModel);
                this.pieView.renderPie();
                // this.chartRender.getChartById(dataIdent, graphElement);
                $(graphElement).children().first().addClass(dataIdent);
                $("body").append(this.$el);
            } else {
                if (dataIdent == 'deleteAll') {
                    $(this.$el).remove();

                } else {
                    if (this.$el.find('.highcharts-container').length <= 1) {
                        $(this.$el).remove();
                    } else {
                        this.$el.find('.' + dataIdent).remove();

                        var tilesArr = this.$el.find('.tile');
                        var moveAllLeft = false;
                        for (var i = 0; i < tilesArr.length; i++) {
                            if (moveAllLeft) {
                                ($(tilesArr[i]).find('.highcharts-container')).appendTo(this.$el.find('#graph-'+(i)));
                                $(this.$el.find('#graph-'+(i+1))).removeAttr("data-highcharts-chart");
                            }
                            if ($(tilesArr[i]).children().length === 0) {
                                moveAllLeft = true;
                            }
                        }
                    }
                }
            }
        }
    });
    return View;
});
