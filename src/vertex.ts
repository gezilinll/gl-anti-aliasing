export class Vertex {
    glHandle: WebGLBuffer | null;

    private _vertexPointers: number[] = [];

    constructor(data: number[], private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        const gl = this._gl;
        this.glHandle = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glHandle);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    vertexAttribPointer(location: number, stride: number, offset: number) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.glHandle);
        this._gl.enableVertexAttribArray(location);
        this._gl.vertexAttribPointer(location, 2, this._gl.FLOAT, false, stride, offset);

        this._vertexPointers.push(location);
    }

    disableVertexAttribPointers() {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
        this._vertexPointers.forEach((location) => { this._gl.disableVertexAttribArray(location); });
        this._vertexPointers = [];
    }

    destroy() {
        this._gl.deleteBuffer(this.glHandle);
        this.glHandle = null;
    }
}