const config = `
<View>
  <Image name="img" value="$image"></Image>
  <EllipseLabels name="tag" toName="img" fillOpacity="0.5" strokeWidth="3">
    <Label value="Planet" background="yellow"></Label>
    <Label value="Moonwalker" background="red"></Label>
  </EllipseLabels>
  <Choices name="choice" toName="img">
    <Choice value="Space" />
    <Choice value="Underground" />
  </Choices>
</View>
`;

const data = {
  image:
    "https://626c-blog-117f2e-1259075300.tcb.qcloud.la/%5Bimg%5Dlabel-studio/nick-owuor-astro-nic-visuals-wDifg5xc9Z4-unsplash.jpg?sign=36ed6d84f8f2a4617e7e3274df19df6f&t=1645608625",
};

const result = [
  {
    from_name: "tag",
    id: "CPnIaS1e7v",
    image_rotation: 0,
    original_height: 2802,
    original_width: 2242,
    to_name: "img",
    type: "ellipselabels",
    origin: "manual",
    value: {
      x: 50.4,
      y: 50.763073639274279,
      ellipselabels: ["Planet"],
      rotation: 0,
      radiusY: 10.672358591248665,
      radiusX: 13.333333333333334,
    },
  },
  {
    from_name: "choice",
    id: "CkRNBWbSiK",
    to_name: "img",
    type: "choices",
    origin: "manual",
    value: {
      choices: ["Space"],
    },
  },
];

const title = "Ellipses on Image";

module.exports = { config, data, result, title };
