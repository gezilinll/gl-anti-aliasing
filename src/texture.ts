
export class Texture {
    width: number;
    height: number;
    glHandle: WebGLTexture | null = null;

    constructor(
        width: number,
        height: number,
        private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads
    ) {
        this.width = width;
        this.height = height;
        this._create();
    }

    private _create() {
        const gl = this._gl;
        this.glHandle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.glHandle);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    destroy() {
        this._gl.deleteTexture(this.glHandle);
        this.glHandle = null;
    }
}
