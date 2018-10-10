define(function (require) {
    var Backbone = require("backbone"),
        highcharts = require("highcharts"),
        Renderer;

    Renderer = Backbone.Model.extend({

        getChartById: function (chartIdFull, htmlElement) {
            var chartId = chartIdFull.substr(0, chartIdFull.indexOf('-'));
            var headline = chartIdFull.replace('-',' - ');

            if (chartId === 'Schülerstruktur') {
                htmlElement.highcharts({
                    chart: {
                        width: ($(document).width() / 5),
                        height: (($(document).width() / 5) * 0.66),
                        type: 'column'
                    },
                    title: {
                        text: headline,
                        style: {
                            fontSize: '8pt'
                        }
                    },
                    legend: {
                        enabled: false,
                        align: "right"
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        categories: ['Kern', 'Nord', 'Ost']
                    },

                    yAxis: {
                        allowDecimals: false,
                        min: 0,
                        title: {
                            text: 'Schüler im Schuljahr 2014/2015'
                        }
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    },
                    series: [{
                        name: 'Abschl. Haupt',
                        data: [8, 5, 9],
                        stack: 'male'
                    }, {
                        name: 'Abschl. Real',
                        data: [21, 7, 16],
                        stack: 'male'
                    }, {
                        name: 'Abschl. Abitur',
                        data: [52, 55, 64],
                        stack: 'male'
                    }, {
                        name: 'Grundschüler mit Familiensprache n. D',
                        data: [23, 39, 63],
                        stack: 'female'
                    }, {
                        name: 'Grundschüler mit Familiensprache D',
                        data: [260, 216, 296],
                        stack: 'female'
                    }]
                });
            } else if (chartId === 'Alterstruktur') {
                htmlElement.highcharts({
                    chart: {
                        width: ($(document).width() / 5),
                        height: (($(document).width() / 5) * 0.66),
                        type: 'column'
                    },
                    title: {
                        text: headline,
                        style: {
                            fontSize: '8pt'
                        }
                    },
                    xAxis: {
                        categories: [
                            'unter 6 J.',
                            'unter 15 J.',
                            'unter 18 J.',
                            '15-25-Jährige',
                            '18-65-Jährige',
                            'ab 65 J.',
                            'ab 80 J.'
                        ],
                        crosshair: true
                    },
                    yAxis: {
                        min: 0,
                        tickInterval: 1000,
                        title: {
                            text: 'Bewohner in Tsd.'
                        }
                    },
                    legend: {
                        enabled: false,
                        align: "right"
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} Einwohner</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    colors: [
                        '#90ed7d',
                        '#f7a35c',
                        '#7cb5ec'
                    ],
                    series: [{
                        name: 'Kern',
                        data: [511, 1221, 1471, 964, 5856, 693, 555]

                    }, {
                        name: 'Nord',
                        data: [443, 1154, 1380, 925, 5390, 1666, 435]

                    }, {
                        name: 'Ost',
                        data: [556, 1382, 1662, 1101, 5766, 2224, 557]
                    }]
                });
            } else if (chartId === 'Altersentwicklung') {
                htmlElement.highcharts({
                    chart: {
                        width: ($(document).width() / 5),
                        height: (($(document).width() / 5) * 0.66),
                        type: 'spline'
                    },
                    title: {
                        text: headline,
                        style: {
                            fontSize: '8pt'
                        }
                    },
                    xAxis: {
                        categories: ['2010', '2011', '2012', '2013', '2014', '2015']
                    },
                    yAxis: {
                        title: {
                            text: 'Einwohner in %'
                        }
                    },
                    tooltip: {
                        crosshairs: true,
                        shared: true
                    },
                    legend: {
                        enabled: false,
                        align: "right"
                    },
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        spline: {
                            marker: {
                                radius: 4,
                                lineColor: '#666666',
                                lineWidth: 1
                            }
                        }
                    },
                    series: [ {
                        name: 'Nord < 18 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [15.79995024,
                            15.75661117,
                            16.16751887,
                            16.0695027,
                            16.44555994,
                            16.35846373
                        ]
                    }, {
                        name: 'Nord > 64 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [20.50261259,
                            20.24975514,
                            20.03895788,
                            19.67645297,
                            19.66057129,
                            19.74869606
                        ]
                    }, {
                        name: 'Kern < 18 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [14.78377065,
                            14.80867196,
                            14.84577349,
                            14.65587045,
                            14.91833448,
                            16.30820399
                        ]
                    }, {
                        name: 'Kern > 64 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [19.82507289,
                            19.65406942,
                            19.71980221,
                            19.43319838,
                            19.61122613,
                            18.76940133
                        ]
                    }, {
                        name: 'Ost < 18 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [16.61617862,
                            16.21621622,
                            16.30350625,
                            16.69189189,
                            16.97247706,
                            17.21922918
                        ]
                    }, {
                        name: 'Ost > 64 Jahre',
                        label: {
                            enabled: false
                        },
                        data: [22.77572086,
                            22.96180478,
                            23.20539763,
                            23.05945946,
                            23.20247493,
                            23.04185661
                        ]
                    }]
                });
            } else if (chartId === 'Haushaltsstruktur') {
                htmlElement.highcharts({
                    chart: {
                        width: ($(document).width() / 5),
                        height: (($(document).width() / 5) * 0.66),
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: headline,
                        style: {
                            fontSize: '8pt'
                        }
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    legend: {
                        enabled: false,
                        align: "right"
                    },
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    colors: [
                        '#ff7474',
                        '#8085e9',
                        '#a65f6d',
                        '#7a9bc2'
                    ],
                    series: [{
                        name: 'Brands',
                        colorByPoint: true,
                        data: [{
                            name: 'Einpersonenhaushalt',
                            y: 2937
                        }, {
                            name: 'EP-Haushalt ab 65 Jahre',
                            y: 657
                        }, {
                            name: 'Haushalte mit Kindern',
                            y: 850
                        }, {
                            name: 'Haushalte Alleinerziehende',
                            y: 300
                        }]
                    }]
                });
            } else {
                htmlElement.highcharts({
                    chart: {
                        width: ($(document).width() / 5),
                        height: (($(document).width() / 5) * 0.66)
                    },
                    title: {
                        text: headline,
                        style: {
                            fontSize: '8pt'
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        categories: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Plums']
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        type: 'column',
                        name: 'Jane',
                        data: [3, 2, 1, 3, 4]
                    }, {
                        type: 'column',
                        name: 'John',
                        data: [2, 3, 5, 7, 6]
                    }, {
                        type: 'column',
                        name: 'Joe',
                        data: [4, 3, 3, 9, 0]
                    }, {
                        type: 'spline',
                        name: 'Average',
                        data: [3, 2.67, 3, 6.33, 3.33],
                        marker: {
                            lineWidth: 2,
                            lineColor: Highcharts.getOptions().colors[3],
                            fillColor: 'white'
                        }
                    }]
                });
            }
        }
    });
    return Renderer;
});


