/* global Feature Scenario */

const { initLabelStudio, dragKonva, waitForImage, serialize } = require("../helpers");
const assert = require("assert");

const config = `
  <View>
    <Image name="image" value="$image" zoomcontrol="true"/>
    <RectangleLabels name="label" toName="image">
        <Label value="Airplane" background="green"/>
        <Label value="Car" background="blue"/>
    </RectangleLabels>
    <RectangleLabels name="label2" toName="image">
        <Label value="F1"/>
        <Label value="Plane"/>
    </RectangleLabels>
  </View>
`;

const data = {
  image:
    "https://626c-blog-117f2e-1259075300.tcb.qcloud.la/%5Bimg%5Dlabel-studio/nick-owuor-astro-nic-visuals-wDifg5xc9Z4-unsplash.jpg?sign=36ed6d84f8f2a4617e7e3274df19df6f&t=1645608625",
};

Feature("Two or more same named tools referred same image").tag("@regress");

Scenario("Two RectangleLabels", async ({ I, AtImageView, AtLabels, AtSidebar }) => {
  I.amOnPage("/");
  I.executeAsyncScript(initLabelStudio, { config, data });

  AtImageView.waitForImage();
  I.executeAsyncScript(waitForImage);

  AtLabels.clickLabel("Plane");
  I.executeAsyncScript(dragKonva, 300, 300, 50, 50);
  AtLabels.clickLabel("Car");
  I.executeAsyncScript(dragKonva, 100, 600, 400, -300);
  AtSidebar.seeRegions(2);

  const result = await I.executeScript(serialize);

  assert.deepStrictEqual(result.length, 2);
});
