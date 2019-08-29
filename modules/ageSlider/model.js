import Tool from "../core/modelList/tool/model";

const AgeSlider = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true
    }),
    initialize: function () {
        this.superInitialize();


    },
    toggleIsActive: function () {
        const newState = !this.getIsActive();

        this.set("isActive", newState);

    },

});

export default AgeSlider;
