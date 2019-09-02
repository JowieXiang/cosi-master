import Tool from "../../core/modelList/tool/model";


const WsClientInputModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        "text": "",
        connection: null
    }),

    initialize: function () {
        const host = "ws://cosiwebsocket.herokuapp.com/";

        this.superInitialize();
        this.set("connection", new WebSocket(host));
    },

    getConnection: function () {
        return this.get("connection");
    }
});

export default WsClientInputModel;
