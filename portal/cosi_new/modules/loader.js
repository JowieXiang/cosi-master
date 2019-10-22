
import tools from "./tools";

import FeaturesLoader from "./featuresLoader/model";
import ColorCodeMapView from "./colorCodeMap/view";
import ColorCodeMap from "./colorCodeMap/model";
import DashboardView from "./dashboard/view";
import SelectDistrictView from "./selectDistrict/view";
import SaveSelectionCosiView from "./saveSelection/view";
import InfoScreenView from "./infoScreen/view";
import TimeSliderView from "./timeSlider/view";

/**
 * @returns {void}
 */
function initializeCosi () {
    const dashboard = new DashboardView({model: tools.Dashboard});

    // Handle TouchScreen / InfoScreen Loading
    if (!window.location.pathname.includes("infoscreen.html")) {
        new FeaturesLoader();
        Radio.trigger("ModelList", "addModelsAndUpdate", Object.values(tools));

        new ColorCodeMapView({model: new ColorCodeMap()});
        new SaveSelectionCosiView({model: tools.SaveSelectionCosi});
        new TimeSliderView({model: tools.TimeSlider});
        new SelectDistrictView({model: tools.SelectDistrict});
    }
    else {
        new InfoScreenView({
            title: "CoSI InfoScreen",
            children: [dashboard]
        });
    }
}

export default initializeCosi;
