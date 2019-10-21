
import FeaturesLoader from "./featuresLoader/model";
import ColorCodeMapView from "./colorCodeMap/view";
import SaveSelectionCosiView from "./saveSelection/view";
import SaveSelectionCosi from "./saveSelection/model";
import TimeSliderView from "./timeSlider/view";
import TimeSlider from "./timeSlider/model";

const tools = {
    SaveSelectionCosi: new SaveSelectionCosi({
        parentId: "tools",
        type: "tool"
    }),
    TimeSlider: new TimeSlider({
        parentId: "tools",
        type: "tool"
    })
};

/**
 * @returns {void}
 */
function initializeCosi () {
    new FeaturesLoader();
    new ColorCodeMapView();

    Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

    new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
    new TimeSliderView({model: tools.TimeSlider});
}

export default initializeCosi;
