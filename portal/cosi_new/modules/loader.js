
import FeaturesLoader from "./featuresLoader/model";

import SaveSelectionCosiView from "./saveSelection/view";
import SaveSelectionCosi from "./saveSelection/model";

const tools = {
    SaveSelectionCosi: new SaveSelectionCosi({
        parentId: "tools",
        type: "tool"
    })
};

/**
 * @returns {void}
 */
function initializeCosi () {
    new FeaturesLoader();

    Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

    new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
}

export default initializeCosi;
