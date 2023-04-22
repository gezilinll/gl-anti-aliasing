import { Texture } from "./Texture";

export class Framebuffer {
    glHandle: WebGLFramebuffer | null = null;
    texture: Texture | null = null;
    width: number;
    height: number;

    constructor(
        width: number,
        height: number,
        private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads,
    ) {
        this.width = width;
        this.height = height;
        this._create();
    }

    private _create() {
        const gl = this._gl;
        this.glHandle = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glHandle);

        this.texture = new Texture(this.width, this.height, this._gl);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture.glHandle,
            0,
        );

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Failed to create framebuffer:' + status);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    destroy() {
        this._gl.deleteFramebuffer(this.glHandle);
        this.texture?.destroy();

        this.glHandle = null;
        this.texture = null;
    }
}