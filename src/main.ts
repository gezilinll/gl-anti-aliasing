import { Circle } from "./circle";
import { FAXX } from "./faxx";
import { Framebuffer } from "./framebuffer";
import { Program } from "./program";
import { defaultFS, defaultVS } from "./shaders";
import { Vertex } from "./vertex";

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
let faxxEnabled = false;

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
  let gl = getGLContext(canvas);

  const fCircle = new Framebuffer(canvas.width, canvas.height, gl);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fCircle.glHandle);
  const circleRenderer = new Circle(gl);
  circleRenderer.render(canvas.width, canvas.height);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);


  if (faxxEnabled) {
    const fxaa = new FAXX(gl);
    fxaa.render(fCircle.texture!.glHandle!, canvas.width, canvas.height);
    fxaa.destroy();
  } else {
    renderTexture(fCircle.texture!.glHandle!);
  }

  circleRenderer.destroy();
}

const canvas = getCanvas();
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

document.querySelector('#faxx')!.addEventListener('change', () => {
  faxxEnabled = document.querySelector('#faxx')!.checked;
  render();
});
