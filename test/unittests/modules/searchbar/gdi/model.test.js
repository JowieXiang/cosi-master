import Model from "@modules/searchbar/gdi/model.js";
import {expect} from "chai";

describe("modules/searchbar/gdi", function () {
    var model = {},
        config = {
            "minChars": 4,
            "serviceId": "elastic"
        };

    before(function () {
        model = new Model(config);
    });
    describe("check Defaults and Settings", function () {
        it("minChars Value should be 4", function () {
            expect(model.get("minChars")).to.equal(4);
        });
        it("change of minChars Value should return 5", function () {
            model.setMinChars(5);
            expect(model.get("minChars")).to.equal(5);
        });

        it("ServiceID Value should be 'elastic'", function () {
            expect(model.get("serviceId")).to.equal("elastic");
        });
        it("change of ServiceID Value should return 4711", function () {
            model.setServiceId("4711");
            expect(model.get("serviceId")).to.equal("4711");
        });
    });
    describe("createQueryString", function () {
        var searchString = "festge",
            query = "";

        it("the created query should be an object", function () {
            query = model.createQuery(searchString);
            expect(query).to.be.an("object");
        });
        it("the created query should contain the correct query_string", function () {
            expect(query.bool.must).to.be.an("array").to.deep.include({
                query_string: {
                    "fields": ["datasets.md_name^2", "name^2", "datasets.keywords"],
                    "query": "*" + searchString + "*",
                    "lowercase_expanded_terms": false
                }
            },
            {match:
                {
                    typ: "WMS"
                }
            });
        });
    });
});
