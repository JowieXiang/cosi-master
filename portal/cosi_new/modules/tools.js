import Dashboard from "./dashboard/model";
import SelectDistrict from "./selectDistrict/model";
import SaveSelectionCosi from "./saveSelection/model";
import InfoScreenHandler from "./infoScreen/infoScreenHandler/model";
import TimeSlider from "./timeSlider/model";

const tools = {
    SelectDistrict: new SelectDistrict({
        id: "selectDistrict",
        parentId: "root",
        type: "tool",
        name: "Gebiet auswählen",
        glyphicon: "glyphicon-picture",
        districtLayer: [
            {
                name: "Stadtteile",
                selector: "stadtteil",
                id: "1694"
            },
            {
                name: "Statistische Gebiete",
                selector: "statgebiet",
                id: "6071"
            }
        ]
    }),
    Dashboard: new Dashboard({
        parentId: "root",
        type: "tool",
        name: "Dashboard",
        id: "dashboard",
        glyphicon: "glyphicon-dashboard",
        renderToWindow: false
    }),
    SaveSelectionCosi: new SaveSelectionCosi({
        parentId: "tools",
        type: "tool"
    }),
    TimeSlider: new TimeSlider({
        parentId: "tools",
        type: "tool"
    }),
    InfoScreenModel: new InfoScreenHandler({
        windowName: "CoSI Info Screen",
        title: "CoSI Info Screen",
        name: "Zweites Fenster öffnen",
        parentId: "root",
        type: "tool",
        glyphicon: "glyphicon-new-window",
        renderToWindow: false
    })
};

export default tools;
