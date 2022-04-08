
// canvas 实现 watermark
export default function __canvasWM({
  container = document.body,
  width = '200px',
  height = '160px',
  textAlign = 'center',
  textBaseline = 'middle',
  font = "12px Heiti",
  fillStyle = 'rgba(184, 184, 184, 0.35)',
  content = '请勿外传',
  rotate = '20',
  zIndex = 999999,
} = {}) {
  const canvas = document.createElement('canvas');

  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  const ctx = canvas.getContext("2d");

  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.rotate(Math.PI / 180 * rotate);
  ctx.fillText(content, parseFloat(width) / 3, parseFloat(height) / 10);

  const base64Url = canvas.toDataURL();
  const __wm = document.querySelector('.__wm');

  const watermarkDiv = __wm || document.createElement("div");
  const styleStr = `
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      z-index:${zIndex};
      pointer-events:none;
      background-repeat:repeat;
      background-image:url('${base64Url}')`;

  watermarkDiv.setAttribute('style', styleStr);
  watermarkDiv.classList.add('__wm');

  if (!__wm && container) {
    container.style.position = 'relative';
    container.insertBefore(watermarkDiv, container.firstChild);
  }

  // const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  // if (MutationObserver) {
  //   let mo = new MutationObserver(function() {
  //     const __wm = document.querySelector('.__wm');
      
  //     // 只在__wm元素变动才重新调用 __canvasWM
  //     if ((__wm && __wm.getAttribute('style') !== styleStr) || !__wm) {
  //       // 避免一直触发
  //       mo.disconnect();
  //       mo = null;
  //       __canvasWM(args);
  //     }
  //   });

  //   mo.observe(container, {
  //     attributes: true,
  //     subtree: true,
  //     childList: true,
  //   });
  // }
}