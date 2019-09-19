import Tool from "../../core/modelList/tool/model";

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
    getSignifier () {
        return this.get("timelineSignifier");
    },
    getPrefix () {
        return this.get("timelinePrefix");
    }
});

export default Timeline;