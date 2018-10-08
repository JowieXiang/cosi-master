define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        $ = require("jquery"),
        CosiTheme;

    CosiTheme = Theme.extend({
        initialize: function () {
            var clickedElementData = {};

            $.each( this.get("feature")["O"], function( key, value ) {
                if ( typeof value === "string") {
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

    return CosiTheme;
});
