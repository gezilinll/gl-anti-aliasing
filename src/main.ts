import { Circle } from "./circle";
import { FAXX } from "./faxx";
import { Framebuffer } from "./framebuffer";
import { Photo } from "./image";
import { MSAAFrameBuffer } from "./msaa";
import { Program } from "./program";
import { defaultFS, defaultVS } from "./shaders";
import { Triangle } from "./triangle";
import { Vertex } from "./vertex";

function loadImage(url: string, onload: (img: HTMLImageElement) => void) {
  var img = new Image();
  img.src = url;
  img.onload = function () {
    onload(img);
  };
  return img;
};

function getCanvas() {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  if (canvas == null || !canvas.getContext) throw new Error("Canvas not found");
  return canvas;
}

function getGLContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { antialias: true });
  if (gl == null) throw new Error("WebGL not supported");
  return gl;
}

let setStyleWidth = 0;
let setStyleHeight = 0;
let drawType = 'Circle';
let image: HTMLImageElement | null = null;
let fxaaEnabled = false;
let msaaEnabled = false;
let coverageAlpha = false;
let coverageBlend = false;

function resizeCanvas() {
  const ratio = window.devicePixelRatio;
  const width = window.innerWidth - 100 * ratio;
  const height = window.innerHeight - 100 * ratio;
  const bufferWidth = Math.ceil(width * ratio);
  const bufferHeight = Math.ceil(height * ratio);
  if (
    canvas.width !== bufferWidth ||
    canvas.height !== bufferHeight ||
    setStyleWidth !== width ||
    setStyleHeight !== height
  ) {
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
    canvas.style.setProperty("width", `${width}px`);
    canvas.style.setProperty("height", `${height}px`);
    setStyleWidth = width;
    setStyleHeight = height;
  }
  render();
}

function renderTexture(texture: WebGLTexture) {
  let gl = getGLContext(canvas);

  const program = new Program(defaultVS, defaultFS, gl);
  gl.useProgram(program.glHandle);

  const VERTEX = [-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1];

  const vertex = new Vertex(VERTEX, gl);
  const stride = 4 * 4;
  vertex.vertexAttribPointer(program.getAttribLocation('position'), stride, 0);
  vertex.vertexAttribPointer(program.getAttribLocation('textureUV'), stride, 2 * 4);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  program.setUniform('input1', 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.bindTexture(gl.TEXTURE_2D, null);
  vertex.disableVertexAttribPointers();
  gl.useProgram(null);

  vertex.destroy();
  program.destroy();
}

function configureAlphaForCoverage() {
  let gl = getGLContext(canvas);
  if (coverageAlpha) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
  } else {
    gl.clearColor(1.0, 1.0, 1.0, 0.0);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function configureBlendForCoverage() {
  let gl = getGLContext(canvas);
  if (coverageBlend) {
    gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.enable(gl.SAMPLE_COVERAGE);
    // gl.sampleCoverage(1.0, false);
    // gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);

    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  }
}

function render() {
  if (!image) {
    return;
  }

  let gl = getGLContext(canvas);
  const screen =
    msaaEnabled ? new MSAAFrameBuffer(canvas.width, canvas.height, gl)
      : new Framebuffer(canvas.width, canvas.height, gl);
  gl.bindFramebuffer(gl.FRAMEBUFFER, screen.glHandle);

  configureBlendForCoverage();

  configureAlphaForCoverage();

  const size = Math.min(canvas.width, canvas.height);
  gl.viewport((canvas.width - size) / 2, (canvas.height - size) / 2, size, size);

  if (drawType === 'Circle') {
    const circleRenderer = new Circle(gl);
    circleRenderer.render();
    circleRenderer.destroy();
  } else if (drawType === 'Image') {
    const imageRenderer = new Photo(image, gl);
    imageRenderer.render();
    imageRenderer.destroy();
  } else {
    const triangleRenderer = new Triangle(gl);
    triangleRenderer.render();
    triangleRenderer.destroy();
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);

  if (fxaaEnabled) {
    let gl = getGLContext(canvas);
    const fxaa = new FAXX(gl);
    fxaa.render(screen!.texture!.glHandle!, canvas.width, canvas.height);
    fxaa.destroy();
  } else {
    renderTexture(screen!.texture!.glHandle!);
  }

  screen!.destroy();
}

const canvas = getCanvas();
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

document.querySelector('#circle')!.addEventListener('click', () => {
  drawType = 'Circle';
  render();
});
document.querySelector('#image')!.addEventListener('click', () => {
  drawType = 'Image';
  render();
});
document.querySelector('#triangle')!.addEventListener('click', () => {
  drawType = 'Triangle';
  render();
});

document.querySelector('#cNone')!.addEventListener('click', () => {
  coverageAlpha = false;
  coverageBlend = false;
  render();
});
document.querySelector('#cAlpha')!.addEventListener('click', () => {
  coverageAlpha = true;
  coverageBlend = false;
  render();
});
document.querySelector('#cBlend')!.addEventListener('click', () => {
  coverageAlpha = false;
  coverageBlend = true;
  render();
});
document.querySelector('#cALL')!.addEventListener('click', () => {
  coverageAlpha = true;
  coverageBlend = true;
  render();
});

document.querySelector('#aaNone')!.addEventListener('change', () => {
  fxaaEnabled = false;
  msaaEnabled = false;
  render();
});
document.querySelector('#fxaa')!.addEventListener('change', () => {
  fxaaEnabled = true;
  msaaEnabled = false;
  render();
});
document.querySelector('#msaa')!.addEventListener('change', () => {
  msaaEnabled = true;
  fxaaEnabled = false;
  render();
});
document.querySelector('#aaAll')!.addEventListener('change', () => {
  fxaaEnabled = true;
  msaaEnabled = true;
  render();
});

loadImage('../assets/image.png', (img) => {
  image = img;
  render();
});