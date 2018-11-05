const Message = Backbone.Model.extend({
    defaults: {
        type: "select" | "deselect" | "topic-select" | "tool-interaction",
        data: ""
    },
    setId: function (value) {
        this.set("type", value);
    },

    setName: function (value) {
        this.set("data", value);
    }

});
export default Message;
