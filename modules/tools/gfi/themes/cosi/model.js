import Theme from "../model";

const CosiTheme = Theme.extend({
    initialize: function () {
        var clickedElementData = {};

        $.each(this.get("feature")["values_"], function (key, value) {
            if (typeof value !== "object") {
                clickedElementData[key] = value;
            }
        });

        Radio.trigger("LocalStorage", "sendMessage", "element-select", clickedElementData);

        //Hack to never have a gfiWindow
        setTimeout(function(){
            console.log("remove")
            $(".gfi-detached").remove();
        }, 300);
    },

    sendData: function () {
    }
});
export default CosiTheme;
