import Theme from "../model";

const CosiTheme = Theme.extend({
    initialize: function () {
        var clickedElementData = {};

        $.each(this.get("feature")["O"], function (key, value) {
            if (typeof value !== "object") {
                clickedElementData[key] = value;
            }
        });

        Radio.trigger("LocalStorage", "sendMessage", "element-select", clickedElementData);

        this.listenTo(Radio.channel("GFI"), {
            "afterRender": function () {
                $(".gfi-detached").remove();
            }
        }, this);
    },

    sendData: function () {
    }
});
export default CosiTheme;
