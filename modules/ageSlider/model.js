import Tool from "../core/modelList/tool/model";

const AgeSlider = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true
    }),
    initialize: function () {
        this.superInitialize();
        // var slider = document.getElementById("myRange");
        // var output = document.getElementById("demo");
        // output.innerHTML = slider.value; // Display the default slider value

        // Update the current slider value (each time you drag the slider handle)
        // slider.oninput = function () {
        //     output.innerHTML = this.value;
        //     console.log(this.value);
        // }
    },
    toggleIsActive: function () {
        const newState = !this.getIsActive();

        this.set("isActive", newState);

    },

});

export default AgeSlider;
