import WsClientModel from "./model"
const WsClientView = Backbone.View.extend({
    model: new WsClientModel(),

    initialize: function () {
    },
    getConnection: function(){
        // return this.model.get("connection");
        return this.model.get('connection');
    }
});

export default WsClientView;
