import { Circle } from "./circle";
import { FAXX } from "./faxx";
import { Framebuffer } from "./framebuffer";
import { Photo } from "./image";
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
  const gl = canvas.getContext("webgl2");
  if (gl == null) throw new Error("WebGL not supported");
  return gl;
}

let setStyleWidth = 0;
let setStyleHeight = 0;
let drawType = 'Circle';
let image: HTMLImageElement | null = null;
let fxaaEnabled = false;

function resizeCanvas() {
  const ratio = window.devicePixelRatio;
  const width = window.innerWidth - 100;
  const height = window.innerHeight - 100;
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

function render() {
  if (!image) {
    return;
  }

  let gl = getGLContext(canvas);
  const screen = new Framebuffer(canvas.width, canvas.height, gl);
  gl.bindFramebuffer(gl.FRAMEBUFFER, screen.glHandle);
  gl.clearColor(1.0, 1.0, 1.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const size = Math.min(setStyleWidth, setStyleHeight);
  gl.viewport((setStyleWidth - size) / 2, (setStyleHeight - size) / 2, size, size);

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
  gl.viewport(0, 0, setStyleWidth, setStyleHeight);

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


document.querySelector('#fxaa')!.addEventListener('change', () => {
  fxaaEnabled = document.querySelector('#fxaa')!.checked;
  render();
});

loadImage('../assets/image.png', (img) => {
  image = img;
  render();
});