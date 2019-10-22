
import FeaturesLoader from "./featuresLoader/model";
import ColorCodeMapView from "./colorCodeMap/view";
import ColorCodeMap from "./colorCodeMap/model";
import SaveSelectionCosiView from "./saveSelection/view";
import SaveSelectionCosi from "./saveSelection/model";
import TimeSliderView from "./timeSlider/view";
import TimeSlider from "./timeSlider/model";
import InfoScreen from "./infoScreen/view";
import InfoScreenModel from "./infoScreen/model";

const tools = {
    SaveSelectionCosi: new SaveSelectionCosi({
        parentId: "tools",
        type: "tool"
    }),
    TimeSlider: new TimeSlider({
        parentId: "tools",
        type: "tool"
    }),
    InfoScreenModel: new InfoScreenModel({
        windowName: "CoSI Info Screen",
        title: "CoSI Info Screen",
        name: "Zweites Fenster öffnen",
        parentId: "root",
        type: "tool",
        glyphicon: "glyphicon-new-window"
    })
};

/**
 * @returns {void}
 */
function initializeCosi () {
    new FeaturesLoader();

    Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

    new ColorCodeMapView({model: new ColorCodeMap()});
    new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
    new TimeSliderView({model: tools.TimeSlider});
    new InfoScreen({model: tools.InfoScreenModel});
}

export default initializeCosi;
