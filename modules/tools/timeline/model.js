import Tool from "../../core/modelList/tool/model";
import {TileLayer, VectorLayer} from "ol/layer";
import VectorSource from "ol/source/Vector";

const Timeline = Tool.extend({
    defaults: {
        properties: {},
        timelineSignifier: "kategorie",
        timelinePrefix: "jahr_"
    },
    initialize () {
        const channel = Radio.channel("Timeline");

        channel.reply({
            "createTimelineTable": function (inputTable) {
                return this.convertTable(inputTable);
            },
            "getLatestFieldFromProperties": function (input) {
                return this.getLatestField(input);
            },
            "fillUpTimelineGaps": function (inputTable, outputType = "Object") {
                return this.fillUpTimelineGaps(inputTable, outputType);
            }
        }, this);
    },
    convertTable (inputTable) {
        const timelineTable = inputTable;

        timelineTable.forEach((col) => {
            let newPropertyKey;

            for (const prop in col) {
                if (prop.includes(this.getSignifier())) {
                    newPropertyKey = col[prop];
                    col[newPropertyKey] = {};

                    delete col[prop];
                }
                if (prop.includes(this.getPrefix()) && typeof newPropertyKey !== "undefined") {
                    const year = prop.replace(this.getPrefix(), "").slice(0, 4);

                    col[newPropertyKey][year] = col[prop];

                    delete col[prop];
                }
            }
        });

        return timelineTable;
    },
    getLatestField (properties) {
        let latestYear = 0,
            selector;

        // find latest year
        for (const prop in properties) {
            if (prop.includes(this.getPrefix())) {
                if (parseFloat(prop.replace(this.getPrefix(), "")) > latestYear) {
                    latestYear = parseFloat(prop.replace(this.getPrefix(), ""));
                    selector = prop;
                    console.log(latestYear, selector);
                }
            }
            // Break if the found date is from last year
            if (latestYear === new Date().getFullYear() - 1) {
                break;
            }
        }

        return selector;
    },
    fillUpTimelineGaps (inputTable, outputType = "Object") {
        for (const prop in inputTable[0]) {
            if (inputTable[0][prop] instanceof Object) {
                const range = inputTable
                    .map(col => col[prop])
                    .map(timeline => timeline ? Object.keys(timeline) : [])
                    .reduce((allYears, yearsOfCol) => [...allYears, ...yearsOfCol], [])
                    .reduce((years, year) => {
                        years[year] = "-";
                        return years;
                    }, {});

                inputTable.forEach(col => {
                    if (col[prop] instanceof Object) {
                        col[prop] = outputType === "Array" ? Object.entries({...range, ...col[prop]}).reverse() : {...range, ...col[prop]};
                    }
                });
            }
        }

        return inputTable;
    },
    getSignifier () {
        return this.get("timelineSignifier");
    },
    getPrefix () {
        return this.get("timelinePrefix");
    }
});

export default Timeline;