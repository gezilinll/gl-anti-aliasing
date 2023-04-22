export class Vertex {
    glHandle: WebGLBuffer | null;

    constructor(data: number[], private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        const gl = this._gl;
        this.glHandle = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glHandle);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    destroy() {
        this._gl.deleteBuffer(this.glHandle);
        this.glHandle = null;
    }
}