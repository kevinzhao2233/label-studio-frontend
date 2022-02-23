/* global Feature, Scenario, locate */

Feature("Time traveling");

const IMAGE = "https://626c-blog-117f2e-1259075300.tcb.qcloud.la/%5Bimg%5Dlabel-studio/nick-owuor-astro-nic-visuals-wDifg5xc9Z4-unsplash.jpg?sign=36ed6d84f8f2a4617e7e3274df19df6f&t=1645608625";

Scenario("Travel through history with the selected brush region", async function({ I, LabelStudio, AtImageView, AtSidebar }) {
  I.amOnPage("/");
  LabelStudio.init({
    data: { image: IMAGE },
    config: `<View>
    <Image name="img" value="$image" />
    <Brush name="tag" toName="img" />
    <Labels name="labels">
        <Label value="1"></Label>
    </Labels>
  </View>`,
  });
  await AtImageView.waitForImage();
  AtSidebar.seeRegions(0);
  AtSidebar.dontSeeSelectedRegion();

  // Draw a brush region
  await AtImageView.lookForStage();
  AtImageView.drawThroughPoints([
    [50, 50], [100, 50], [50, 80],
  ]);
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Add a brush stroke to the last created region (2 strokes, 1 region)
  AtImageView.drawThroughPoints([
    [50, 100], [100, 100], [50, 130],
  ]);
  // Check that we are drawing in the same region
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Go back through history
  I.pressKey(["ctrl", "z"]);

  // The brush region still should be selected (1 stroke, 1 region)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Try the same with redo
  I.pressKey(["ctrl", "shift", "z"]);

  // The brush region still should be selected (2 strokes, 1 region)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();
});

Scenario("Travel through history after moving the rectangle region", async function({ I, LabelStudio, AtImageView, AtAudioView, AtSidebar }) {
  I.amOnPage("/");
  LabelStudio.init({
    data: { image: IMAGE },
    config: `<View>
    <Image name="img" value="$image" />
    <Rectangle name="tag" toName="img" />
    <Labels name="labels">
        <Label value="1"></Label>
    </Labels>
  </View>`,
  });
  await AtImageView.waitForImage();
  AtSidebar.seeRegions(0);
  AtSidebar.dontSeeSelectedRegion();

  // Draw a rectangle region
  await AtImageView.lookForStage();
  AtImageView.drawByDrag(100,100,200,200);
  // Select the region
  AtImageView.clickAt(200,200);
  // Check that the region is created and selected
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Move the last created region 2 times
  AtImageView.drawByDrag(200,200,100,0);
  AtImageView.drawByDrag(300,200,0,-100);

  // When we move region we should do not create any other region or loose the selection (moved 2 times)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Go back through history
  I.pressKey(["ctrl", "z"]);

  // The rectangle region still should be selected (moved 1 time)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Repeat going back through history
  I.pressKey(["ctrl", "z"]);

  // The rectangle region still should be selected (moved 0 times)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();

  // Try the same with redo
  I.pressKey(["ctrl", "shift", "z"]);

  // The brush region still should be selected (moved 1 time)
  AtSidebar.seeRegions(1);
  AtSidebar.seeSelectedRegion();
});