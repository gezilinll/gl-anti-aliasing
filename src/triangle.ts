import { Program } from "./program";
import { Vertex } from "./vertex";

export const triangleVS = `
precision highp float;
attribute vec2 position;
void main()
{
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const triangleFS = `
precision highp float;
precision highp int;

void main()
{
    gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}
`;

export class Triangle {
    private readonly VERTEX = [0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0];

    private _program: Program | null;
    private _vertex: Vertex | null;

    constructor(private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._program = new Program(triangleVS, triangleFS, this._gl);
        this._vertex = new Vertex(this.VERTEX, this._gl);
    }

    render() {
        const gl = this._gl;

        gl.useProgram(this._program!.glHandle);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertex!.glHandle);
        gl.enableVertexAttribArray(this._program!.getAttribLocation('position'));
        gl.vertexAttribPointer(this._program!.getAttribLocation('position'), 3, this._gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.disableVertexAttribArray(this._program!.getAttribLocation('position'));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.useProgram(null);
    }

    destroy() {
        this._program?.destroy();
        this._vertex?.destroy();

        this._program = null;
        this._vertex = null;
    }
}