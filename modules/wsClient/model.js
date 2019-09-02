
const WsClientModel = Backbone.Model.extend({
    defaults:{
      "connection": null  
    },
    initialize:function(){
        const channel = Radio.channel("WebSocket");
        channel.reply({
            "getConnection": this.getConnection
        })
        // var host = location.origin.replace(/^http/, 'ws')
        const host = "ws://cosiwebsocket.herokuapp.com/";
        const connection = new WebSocket(host);

        connection.onmessage = function (event) {
            alert(event.data);
        };

    },
    getConnection:function(){
        return this.connection;
    }

})
export default WsClientModel;
