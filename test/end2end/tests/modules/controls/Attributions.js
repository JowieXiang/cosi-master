const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {isCustom} = require("../../../settings"),
    {until, By} = webdriver;

/**
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function AttributionsTests ({builder, url, resolution}) {
    const skipAll = !isCustom(url); // attributions only active in custom

    (skipAll ? describe.skip : describe)("Modules Controls Attributions", function () {
        let driver, attributionsButton, attributionsDiv;

        before(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        after(async function () {
            await driver.quit();
        });

        it("should have an attributions button", async function () {
            await driver.wait(until.elementLocated(By.css(".attributions-button")), 50000);
            attributionsButton = await driver.findElement(By.css(".attributions-button"));

            expect(attributionsButton).to.exist;
        });

        it("should open/close closed/opened attributions on clicking attribution button", async function () {
            await attributionsButton.click();
            expect((await driver.findElements(By.css(".attributions-div"))).length).to.equal(0);
            attributionsButton = await driver.findElement(By.css(".attributions-button"));
            await attributionsButton.click();
            attributionsDiv = await driver.findElement(By.css(".attributions-div"));
            expect(attributionsDiv).to.exist;
        });

        it("should have attributions text 'Attributierung für Fachlayer'", async function () {
            const attributionsHeader = await driver.findElement(By.xpath("//dt[contains(.,'Krankenhäuser:')]")),
                attributionsText = await driver.findElement(By.xpath("//dd/span[contains(.,'Attributierung für Fachlayer')]"));

            expect(attributionsHeader).to.exist;
            expect(attributionsText).to.exist;
        });
    });
}

module.exports = AttributionsTests;
