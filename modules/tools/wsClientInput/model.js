import Tool from "../../core/modelList/tool/model";


const WsClientInputModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        "text":""
    }),

    initialize: function () {

        this.superInitialize();
        
    },

 
});

export default WsClientInputModel;
