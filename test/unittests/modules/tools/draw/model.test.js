import VectorLayer from "ol/layer/Vector.js";
import {Select, Modify, Draw} from "ol/interaction.js";
import {Style, Text} from "ol/style.js";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Model from "@modules/tools/draw/model.js";
import ModelList from "@modules/core/modelList/list.js";
import {expect} from "chai";
import Map from "ol/Map";
import View from "ol/View";

describe("drawModel", function () {
    var model;

    before(function () {
        model = new Model();
        model.collection = new ModelList();
    });

    describe("createLayer", function () {
        it("should return an result that be not undefined", function () {
            expect(model.createLayer(undefined)).to.exist;
        });
        it("the result should be an instance of vectorLayer for undefined input", function () {
            var result = model.createLayer(undefined);

            expect(result instanceof VectorLayer).to.be.true;
        });
        it("the result should be an instance of vectorLayer for undefined input", function () {
            var layer = new VectorLayer();

            expect(model.createLayer(layer)).is.equal(layer);
        });
    });

    describe("createDrawInteraction", function () {
        it("the result should be an instance of Draw for empty input", function () {
            var drawType = "",
                layer = new VectorLayer(),
                result = model.createDrawInteraction(drawType, layer);

            expect(result instanceof Draw).to.be.true;
        });
        it("should be the result color is the same as input color", function () {
            var drawType = {
                    geometry: "Point",
                    text: "Punkt zeichnen"
                },
                layer = new VectorLayer(),
                color = [55, 126, 184, 1],
                result = model.createDrawInteraction(drawType, layer);

            expect(result.getOverlay().getStyle().getFill().getColor()).to.deep.equal(color);
        });
    });

    describe("createDrawInteractionAndAddToMap", function () {
        it("the result should be two instances of draw", function () {
            var drawType = {
                    geometry: "Circle",
                    text: "Doppelkreis zeichnen"
                },
                layer = new VectorLayer(),
                isActive = true,
                maxFeatures = "";

            model.createDrawInteractionAndAddToMap(layer, drawType, isActive, maxFeatures);

            expect(model.get("drawInteraction") instanceof Draw).to.be.true;
            expect(model.get("drawInteraction2") instanceof Draw).to.be.true;
        });
        it("there should only be one drawInteraction", function () {
            var listOfDrawTypes = [{geometry: "Circle", text: "Kreis zeichnen"}, {geometry: "Point", text: "Punkt zeichnen"},
                    {geometry: "Text", text: "Text schreiben"}, {geometry: "LineString", text: "Linie zeichnen"}],
                layer = new VectorLayer(),
                isActive = true,
                maxFeatures = "";

            for (let index = 0; index < listOfDrawTypes.length; index++) {
                const drawType = listOfDrawTypes[index];

                model.setDrawInteraction(undefined);
                model.setDrawInteraction2(undefined);
                model.createDrawInteractionAndAddToMap(layer, drawType, isActive, maxFeatures);

                expect(model.get("drawInteraction") instanceof Draw).to.be.true;
                expect(model.get("drawInteraction2") instanceof Draw).to.be.false;
            }
        });
    });

    describe("adjustValueToUnits", function () {
        it("Should return the defined diameter unchanged (= in meters)", function () {
            const diameter = Math.random(),
                units = "m",
                result = model.adjustValueToUnits(diameter, units);

            expect(result).to.deep.equal(diameter);
        });
        it("Should return the defined diameter unchanged (= in kilometers)", function () {
            const diameter = Math.random(),
                units = "km",
                result = model.adjustValueToUnits(diameter, units);

            expect(result).to.deep.equal(diameter * 1000);
        });
    });

    describe("getDefinedRadius", function () {
        it("the result should be a value and the second input parameter.", function () {
            const doubleIsActive = true,
                circleRadiusOuter = Math.random(),
                circleRadiusInner = Math.random(),
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(circleRadiusOuter);
        });
        it("the result should be a value and the third input parameter.", function () {
            const doubleIsActive = false,
                circleRadiusOuter = Math.random(),
                circleRadiusInner = Math.random(),
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(circleRadiusInner);
        });
        it("the result should be undefined and the second input parameter.", function () {
            const doubleIsActive = true,
                circleRadiusOuter = undefined,
                circleRadiusInner = Math.random(),
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(undefined);
        });
        it("the result should be undefined and the third input parameter.", function () {
            const doubleIsActive = false,
                circleRadiusOuter = Math.random(),
                circleRadiusInner = undefined,
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(undefined);
        });
        it("the result should be a value and the third input parameter.", function () {
            const doubleIsActive = undefined,
                circleRadiusOuter = Math.random(),
                circleRadiusInner = Math.random(),
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(circleRadiusInner);
        });
        it("the result should be a not a number (NaN) and the second input parameter.", function () {
            const doubleIsActive = true,
                circleRadiusOuter = NaN,
                circleRadiusInner = Math.random(),
                result = model.getDefinedRadius(doubleIsActive, circleRadiusOuter, circleRadiusInner);

            expect(result).to.deep.equal(NaN);
        });
    });

    describe("transformNaNToUndefined", function () {
        it("should return undefined", function () {
            const result = model.transformNaNToUndefined(NaN);

            expect(result).to.deep.equal(undefined);
        });
        it("should return undefined", function () {
            const result = model.transformNaNToUndefined(undefined);

            expect(result).to.deep.equal(undefined);
        });
        it("should return the radius", function () {
            const radius = Math.random(),
                result = model.transformNaNToUndefined(radius);

            expect(result).to.deep.equal(radius);
        });
    });

    describe("getCircleExtentByDistanceLat", function () {
        const testMap = new Map({
                target: "map",
                view: new View({
                    projection: "EPSG:25832"
                })
            }),
            earthRadius = 6378137;

        it("should return an array with two values.", function () {
            const circleCenter = [563054.1959507341, 5931428.60952855],
                diameter = 2000,
                result = model.getCircleExtentByDistanceLat(circleCenter, diameter, testMap, earthRadius);

            expect(result).to.deep.equal([563040.8522628784, 5932427.960697326]);
        });

        it("should return an array with two values.", function () {
            const circleCenter = [561307.9626221351, 5931661.158251739],
                diameter = -2000,
                result = model.getCircleExtentByDistanceLat(circleCenter, diameter, testMap, earthRadius);

            expect(result).to.deep.equal([561320.9362901135, 5930661.805980023]);
        });
    });

    describe("getCircleExtentByDistanceLon", function () {
        const testMap = new Map({
                target: "map",
                view: new View({
                    projection: "EPSG:25832"
                })
            }),
            earthRadius = 6378137;

        it("should return an array with two values", function () {
            const circleCenter = [561307.9626221351, 5931661.158251739],
                diameter = 2000,
                result = model.getCircleExtentByDistanceLon(circleCenter, diameter, testMap, earthRadius);

            expect(result).to.deep.equal([562309.6945844457, 5931674.269837391]);
        });
        it("should return an array with two values", function () {
            const circleCenter = [561307.9626221351, 5931661.158251739],
                diameter = -2000,
                result = model.getCircleExtentByDistanceLon(circleCenter, diameter, testMap, earthRadius);

            expect(result).to.deep.equal([560306.2294113865, 5931648.259190894]);
        });
    });

    describe("assortResultCoordinates", function () {
        it("should return an array with four correct coordinates.", function () {
            const circleCenter = [561964.1286114944, 5931572.964070238],
                resultCoordinates = [
                    [561957.5719733026, 5932072.640277341],
                    [561970.6848649463, 5931073.288230813],
                    [562464.9943155645, 5931579.562693274],
                    [561463.2625920147, 5931566.418576883]
                ],
                result = model.assortResultCoordinates(circleCenter, resultCoordinates),
                assortedCoordinates = [
                    561964.1286114944, 5931572.964070238,
                    561463.2625920147, 5931566.418576883
                ];

            expect(result).to.deep.equal(assortedCoordinates);
        });
    });

    describe("deactivateDrawInteraction", function () {
        before(function () {
            var drawType = "",
                layer = new VectorLayer(),
                drawInteraction1 = model.createDrawInteraction(drawType, layer),
                drawInteraction2 = model.createDrawInteraction(drawType, layer);

            model.setDrawInteraction(drawInteraction1);
            model.setDrawInteraction2(drawInteraction2);
            model.deactivateDrawInteraction();
        });

        it("should deactivate the first draw Interaction", function () {

            expect(model.get("drawInteraction").get("active")).to.be.false;
        });

        it("should deactivate the second draw Interaction", function () {

            expect(model.get("drawInteraction2").get("active")).to.be.false;
        });
    });

    describe("checkAndRemovePreviousDrawInteraction", function () {
        before(function () {
            var drawType = "",
                layer = new VectorLayer(),
                drawInteraction1 = model.createDrawInteraction(drawType, layer),
                drawInteraction2 = model.createDrawInteraction(drawType, layer);

            model.setDrawInteraction(drawInteraction1);
            model.setDrawInteraction2(drawInteraction2);
            model.checkAndRemovePreviousDrawInteraction();
        });

        it("should deactivate the first draw Interaction", function () {

            expect(model.get("drawInteraction")).to.be.undefined;
        });

        it("should deactivate the second draw Interaction", function () {

            expect(model.get("drawInteraction2")).to.be.undefined;
        });
    });

    describe("createDrawInteractionAndAddToMap", function () {
        it("the result should be two draw Interactions", function () {
            const drawType = "",
                layer = new VectorLayer(),
                isActive = true,
                maxFeatures = undefined,
                result = model.createDrawInteractionAndAddToMap(layer, drawType, isActive, maxFeatures);

            expect(result[0] instanceof Draw).to.be.true;
            expect(result[1] instanceof Draw).to.be.true;
        });
    });

    describe("setDrawType", function () {
        it("should return 'undefined'", function () {
            model.setMethodCircle(undefined, undefined);
            model.setDrawType(undefined, undefined);

            expect(model.get("methodCircle")).to.be.undefined;
        });
        it("should return 'interactiv'", function () {
            model.setDrawType("Circle", "Kreis zeichnen");

            expect(model.get("methodCircle")).to.deep.equal("interactiv");
        });
        it("should return 'defined'", function () {
            model.setDrawType("Circle", "Doppelkreis zeichnen");

            expect(model.get("methodCircle")).to.deep.equal("defined");
        });
    });

    describe("getStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var result;

            model.setDrawType(undefined, undefined);
            model.setColor([]);
            result = model.getStyle();
            expect(result instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            var result = model.getStyle(undefined, undefined);

            expect(result instanceof Style).to.be.true;
        });
        it("should return result color to be the same as input color for geometry point", function () {
            var color = [55, 126, 184, 1],
                result;

            model.setDrawType("Point", "Punkt zeichnen");
            model.setColor(color);
            result = model.getStyle();

            expect(result.getFill().getColor()).to.deep.equal(color);
        });
        it("should be the result color ist the same as input color for text", function () {
            var color = [255, 0, 0, 1],
                result;

            model.setDrawType("text", "Text schreiben");
            model.setColor(color);
            result = model.getStyle();

            expect(result.getText().getFill().getColor()).to.deep.equal(color);
        });
    });

    describe("getTextStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var color = [],
                text = "",
                fontSize = 0,
                font = "";

            expect(model.getTextStyle(color, text, fontSize, font) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style and Text for empty input", function () {
            var color = [],
                text = "",
                fontSize = 0,
                font = "";

            expect(model.getTextStyle(color, text, fontSize, font).getText() instanceof Text).to.be.true;
        });
        it("should be the result fontSize ist the same as input fontSize", function () {
            var color = [255, 255, 0, 1],
                text = "",
                fontSize = 10,
                font = "Arial",
                result = model.getTextStyle(color, text, fontSize, font);

            expect(result.getText().getFont()).to.equal("10px Arial");
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(model.getTextStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
    });

    describe("getDrawStyle", function () {
        it("the result should be an instance of Style for empty input", function () {
            var color = [],
                drawGeometryType = "",
                strokeWidth = 0,
                radius = 0;

            expect(model.getDrawStyle(color, drawGeometryType, strokeWidth, radius) instanceof Style).to.be.true;
        });
        it("the result should be an instance of Style for undefined input", function () {
            expect(model.getDrawStyle(undefined, undefined, undefined, undefined) instanceof Style).to.be.true;
        });
        it("should be the result color ist the same as input color", function () {
            var color = [0, 0, 0, 1],
                drawGeometryType = "Point",
                strokeWidth = 10,
                radius = 20,
                result = model.getDrawStyle(color, drawGeometryType, strokeWidth, radius);

            expect(result.getFill().getColor()).to.equal(color);
        });
        it("should be the result strokeWidth ist the same as input strokeWidth", function () {
            var color = [0, 0, 0, 1],
                drawGeometryType = "Point",
                strokeWidth = 10,
                radius = 20,
                result = model.getDrawStyle(color, drawGeometryType, strokeWidth, radius);

            expect(result.getStroke().getWidth()).to.equal(strokeWidth);
        });

        describe("resetModule", function () {
            it("should radius is equal default radius", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.setRadius(10000);
                model.resetModule();
                expect(model.get("radius")).to.deep.equal(model.defaults.radius);
            });
            it("should opacity is equal default opacity", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.setOpacity(0.5);
                model.resetModule();

                expect(model.get("opacity")).is.equal(model.defaults.opacity);
            });
            it("should color is equal default color", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.setColor([111, 112, 113, 0.4]);
                model.resetModule();

                expect(model.get("color")).is.equal(model.defaults.color);
            });
            it("should drawType is equal default drawType", function () {
                model.setDrawType("Point", "Punkt zeichnen");
                model.resetModule();

                expect(model.get("drawType")).to.deep.equal(model.defaults.drawType);
            });
        });

        describe("startSelectInteraction", function () {
            it("should be an instance of Select for empty input", function () {
                model.startSelectInteraction(new VectorLayer());

                expect(model.get("selectInteraction") instanceof Select).to.be.true;
            });
        });

        describe("createSelectInteraction", function () {
            it("the result should be an instance of Select for empty input", function () {
                expect(model.createSelectInteraction(new VectorLayer()) instanceof Select).to.be.true;
            });
        });

        describe("createModifyInteraction", function () {
            it("should be an instance of Modify for empty input", function () {
                var interaction = model.createModifyInteraction(new VectorLayer({source: new VectorSource()}));

                expect(interaction instanceof Modify).to.be.true;
            });
        });

        describe("deleteFeatures", function () {
            it("should empty the layerSource", function () {
                model.setLayer(model.createLayer());
                model.get("layer").getSource().getFeatures().push(new Feature());
                model.deleteFeatures();

                expect(model.get("layer").getSource().getFeatures()).is.empty;
            });
        });

    });
    describe("inititalizeWithoutGUI", function () {
        before(function () {
            var params = {"drawType": "Polygon", "color": null, "opacity": 0.5, "maxFeatures": 2, "initialJSON": {"type": "Polygon", "coordinates": [[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]}};

            model.inititalizeWithoutGUI(params);
        });


        it("should not render to Window", function () {
            expect(model.get("renderToWindow")).to.be.false;
        });
        it("should activate Tool", function () {
            expect(model.get("isActive")).to.be.true;
        });
        it("should set drawType", function () {
            expect(model.get("drawType").geometry).to.equal("Polygon");
        });
        it("should set Opacity", function () {
            expect(model.get("opacity")).to.equal(0.5);
        });
        it("should add Feature", function () {
            var feature = model.get("layer").getSource().getFeatures();

            expect(feature).to.have.lengthOf(1);
        });

    });

    describe("editFeaturesWithoutGUI", function () {
        before(function () {
            model.editFeaturesWithoutGUI();
        });
        it("should activate modify Interaction", function () {
            expect(model.get("modifyInteraction").get("active")).to.be.true;
        });
        it("should deactivate draw Interaction", function () {
            expect(model.get("drawInteraction").get("active")).to.be.false;
        });
    });

    describe("cancelDrawWithoutGUI", function () {
        before(function () {
            var drawType = "",
                layer = new VectorLayer();

            model.createDrawInteraction(drawType, layer);
            model.cancelDrawWithoutGUI();
        });

        it("should deactivate modify Interaction", function () {

            expect(model.get("modifyInteraction").get("active")).to.be.false;
        });
        it("should deactivate draw Interaction", function () {

            expect(model.get("drawInteraction").get("active")).to.be.false;
        });
        it("should deactivate select Interaction", function () {

            expect(model.get("selectInteraction").get("active")).to.be.false;
        });
        it("should reset Module", function () {
            expect(model.get("radius")).to.deep.equal(model.defaults.radius);
            expect(model.get("opacity")).is.equal(model.defaults.opacity);
            expect(model.get("color")).is.equal(model.defaults.color);
            expect(model.get("drawType")).to.deep.equal(model.defaults.drawType);
        });
        it("should deactivate Tool", function () {
            expect(model.get("isActive")).to.be.false;
        });
    });

    describe("downloadFeaturesWithoutGUI", function () {
        var downloadedFeatures,
            featureCollectionFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]}, "properties": null}]},
            multiPolygonfeatColFromJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": {"type": "MultiPolygon", "coordinates": [[[[559656.9477852482, 5930649.742761639], [559514.0728624006, 5932126.116964397], [561180.9469622886, 5931935.617067266], [560831.6971508835, 5930824.367667342], [559656.9477852482, 5930649.742761639]]]]}, "properties": null}]};

        it("should return FeatureCollection", function () {
            downloadedFeatures = model.downloadFeaturesWithoutGUI();
            expect(downloadedFeatures).to.deep.equal(JSON.stringify(featureCollectionFromJson));
        });

        it("should return multiPolygon in FeatureCollection", function () {
            downloadedFeatures = model.downloadFeaturesWithoutGUI({"geomType": "multiGeometry"});
            expect(downloadedFeatures).to.deep.equal(JSON.stringify(multiPolygonfeatColFromJson));
        });

    });
});
