import { Circle } from "./circle";
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

function resizeCanvas() {
  const ratio = window.devicePixelRatio;
  const width = window.innerWidth;
  const height = window.innerHeight;
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
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex.glHandle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTEX), gl.STATIC_DRAW);
  const positionAttributeLocation = program.getAttribLocation('position');
  const texCoordAttributeLocation = program.getAttribLocation('textureUV');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  const stride = 4 * 4;
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, stride, 0);
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, stride, 2 * 4);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  program.setUniform('input1', 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.disableVertexAttribArray(positionAttributeLocation);
  gl.disableVertexAttribArray(texCoordAttributeLocation);
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

  renderTexture(fCircle.texture!.glHandle!);

  circleRenderer.destroy();
}

const canvas = getCanvas();
resizeCanvas();

window.addEventListener('resize', resizeCanvas);


