import ColorCodeMap from "./colorCodeMap/model";
import Dashboard from "./dashboard/model";
import DashboardTable from "./dashboardTable/model";
import SelectDistrict from "./selectDistrict/model";
import SaveSelectionCosi from "./saveSelection/model";
import TimeSlider from "./timeSlider/model";
import InfoScreenHandler from "./infoScreen/infoScreenHandler/model";

const general = {
        dashboardTable: new DashboardTable({
            name: "Übersicht",
            id: "dashboardTable"
        }),
        dashboard: new Dashboard({
            parentId: "root",
            type: "tool",
            name: "Dashboard",
            id: "dashboard",
            glyphicon: "glyphicon-dashboard",
            renderToWindow: false
        }),
        infoScreenHandler: new InfoScreenHandler({
            windowName: "CoSI Info Screen",
            title: "CoSI Info Screen",
            name: "Zweites Fenster öffnen",
            parentId: "root",
            type: "tool",
            glyphicon: "glyphicon-new-window",
            renderToWindow: false
        })
    },
    tools = !window.location.pathname.includes("infoscreen.html") ? {
        selectDistrict: new SelectDistrict({
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
        colorCodeMap: new ColorCodeMap(),
        saveSelectionCosi: new SaveSelectionCosi({
            parentId: "tools",
            type: "tool"
        }),
        timeSlider: new TimeSlider({
            parentId: "tools",
            type: "tool"
        })
    } : {};

export {tools, general};
