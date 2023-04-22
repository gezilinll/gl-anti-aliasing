import { Program } from "./program";
import { Vertex } from "./vertex";

export const circleVS = `
precision highp float;
attribute vec2 position;

varying vec2 textureCoordinate;

void main()
{
    gl_Position = vec4(position.xy, 0.0, 1.0);
    textureCoordinate = position.xy;
}
`;

export const circleFS = `
precision highp float;
precision highp int;

varying vec2 textureCoordinate;

void main()
{
    float dist = length(textureCoordinate);
    if (dist > 0.8) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragColor = vec4(1.0, 0.5, 0.5, 1.0);
    }
}
`;

export class Circle {
    private readonly VERTEX = [-1, -1, 1, -1, -1, 1, 1, 1];

    private _program: Program;
    private _vertex: Vertex;

    constructor(private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._program = new Program(circleVS, circleFS, this._gl);
        this._vertex = new Vertex(this.VERTEX, this._gl);
    }

    render(canvasWidth: number, canvasHeight: number) {
        const gl = this._gl;
        const size = Math.min(canvasWidth, canvasHeight);
        gl.viewport((canvasWidth - size) / 2, (canvasHeight - size) / 2, size, size);

        this._program.use();
        this._vertex.bind();
        const positionAttributeLocation = this._program.getAttribLocation('position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 2 * 4, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.disableVertexAttribArray(positionAttributeLocation);
        this._vertex.unbind();
        this._program.unuse();

        gl.viewport(0, 0, canvasWidth, canvasHeight)
    }
}