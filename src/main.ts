import { Circle } from "./circle";

function getCanvas() {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  if (canvas == null || !canvas.getContext) throw new Error("Canvas not found");
  return canvas;
}

function openGlContext(canvas: HTMLCanvasElement) {
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

function render() {
  let gl = openGlContext(canvas);
  new Circle(gl).render(canvas.width, canvas.height);
}

const canvas = getCanvas();
resizeCanvas();

window.addEventListener('resize', resizeCanvas);


