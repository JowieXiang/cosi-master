import WsClientInputTemplate from "text-loader!./template.html";
import WsClientInputModel from "./model";

const WsClientInputView = Backbone.View.extend({
    events: {
        "click #wsSubmit": "wsSend",
        "change #webSocketTextarea": "textChange"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }

        this.model.getConnection().onmessage = (event) => {
            alert(event.data);
        };
    },
    model: new WsClientInputModel(),
    template: _.template(WsClientInputTemplate),

    render: function (model, value) {
        var attr = this.model.toJSON();

        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attr));
        }
        return this;
    },
    wsSend: function () {
        const connection = this.model.getConnection();

        connection.send(this.model.get("text"));
    },
    textChange: function (evt) {
        var text = $(evt.target).val();

        this.model.set("text", text);
        // console.log(text);
    }
});


export default WsClientInputView;
