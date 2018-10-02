define(function (require) {

    var Template = require("text!modules/infoScreen/template.html"),
        InfoScreenModel = require("modules/infoScreen/model"),
        BarView = require("modules/tools/chartRenderer/bar-line/barView"),
        Radio = require("backbone.radio"),
        $ = require("jquery"),
        InfoScreenView;

    InfoScreenView = Backbone.View.extend({
        className: "info-screen",
        id: "infoScreen",
        model: new InfoScreenModel(),
        template: _.template(Template),
        barView: new BarView(),
        initialize: function () {

            $("#testarea").text("placehodler");
            this.listenTo(Radio.channel("LocalStorage"), {
                "newStorageMessage": function (message) {
                    $("#testarea").text(JSON.stringify(message));
                    if (message.type = 'topic-select') {

                        this.model.loadChartDataForTopic(message.data);

                        var plotLine = message.data === "grobo" ? this.model.getColumnPlotLine() : null;
                        var plotLine2 = message.data === "grobo" ? this.model.getColumn2PlotLine() : null;

                        // Bar-Chart 1
                        this.barView.setBarParameters(document.getElementById("chart-column-1"),
                            this.model.getColumnData(), this.model.getColumnCategories(), this.model.getColumnTitle(),
                            this.model.getColumnSubTitle(), null, 'column', null, null, plotLine);
                        this.barView.renderBar();

                        // Bar-Chart 2
                        this.barView.setBarParameters(document.getElementById("chart-column-2"),
                            this.model.getColumnData2(), this.model.getColumnCategories(), this.model.getColumn2Title(),
                            this.model.getColumn2SubTitle(), null, 'column', null, null, plotLine2);
                        this.barView.renderBar();

                        if (message.data === "grobo") {
                            this.lineCategories = this.chartUtils.getUniqueSeriesNames(jsonData, ['jahr']);
                            this.lineData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
                                'Geburten', 'jahr', this.lineCategories, 'Groß Borstel');
                            this.lineTitle = 'Geburten pro Jahr zwischen 2012-2016';
                            this.lineSubTitle = '';

                            this.pieTitle = 'Gesamtbevölkerungsverteilung (2016)';
                            this.pieSubTitle = '';
                            this.pieData = this.chartUtils.getSeriesData(jsonData, 'Stadtgebiet',
                                'Bev_lkerung', 'jahr', ['2016'], 'Groß Borstel');
                        }

                    }
                }
            }, this);


            this.render();
        },

        render: function () {
            var attr = this.model.toJSON();
            $("#info-screen").append(this.$el.html(this.template(attr)));
        }
    });

    return InfoScreenView;
});
