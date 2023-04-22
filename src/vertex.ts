export class Vertex {
    private _vertexBuffer: WebGLBuffer;

    constructor(data: number[], private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        const gl = this._gl;
        this._vertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    bind() {
        const gl = this._gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    }

    unbind() {
        const gl = this._gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

}