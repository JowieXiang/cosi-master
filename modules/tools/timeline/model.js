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
                    col[newPropertyKey] = [];

                    delete col[prop];
                }
                if (prop.includes(this.getPrefix()) && typeof newPropertyKey !== "undefined") {
                    const year = prop.replace(this.getPrefix(), "").slice(0, 4);

                    col[newPropertyKey].push([year, col[prop]]);

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
                }
            }
            // Break if the found date is from last year
            if (latestYear === new Date().getFullYear() - 1) {
                break;
            }
        }

        return selector;
    },
    getSignifier () {
        return this.get("timelineSignifier");
    },
    getPrefix () {
        return this.get("timelinePrefix");
    }
});

export default Timeline;