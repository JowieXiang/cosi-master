
import FeaturesLoader from "./featuresLoader/model";

import SaveSelectionCosiView from "./saveSelection/view";
import SaveSelectionCosi from "./saveSelection/model";
import InfoScreen from "./infoScreen/view";
import InfoScreenModel from "./infoScreen/model";

const tools = {
    SaveSelectionCosi: new SaveSelectionCosi({
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

    new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
    new InfoScreen({model: tools.InfoScreenModel});
}

export default initializeCosi;
