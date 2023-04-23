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

    private _program: Program | null;
    private _vertex: Vertex | null;

    constructor(private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._program = new Program(circleVS, circleFS, this._gl);
        this._vertex = new Vertex(this.VERTEX, this._gl);
    }

    render() {
        const gl = this._gl;

        gl.useProgram(this._program!.glHandle);
        this._vertex!.vertexAttribPointer(this._program!.getAttribLocation('position'), 2 * 4, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this._vertex?.disableVertexAttribPointers();

        gl.useProgram(null);
    }

    destroy() {
        this._program?.destroy();
        this._vertex?.destroy();

        this._program = null;
        this._vertex = null;
    }
}