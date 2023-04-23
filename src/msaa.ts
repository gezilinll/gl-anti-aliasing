import { Framebuffer } from "./framebuffer";

export class MSAAFrameBuffer {
    glHandle: WebGLFramebuffer | null = null;
    private _renderBuffer: WebGLRenderbuffer | null = null;
    private _blitBuffer: Framebuffer | null = null;
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

        this._renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, this.width, this.height);
        this.glHandle = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glHandle);
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            this._renderBuffer,
        );
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this._blitBuffer = new Framebuffer(this.width, this.height, gl);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Failed to create framebuffer:' + status);
        }
    }

    get texture() {
        const gl = this._gl;
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.glHandle);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this._blitBuffer!.glHandle);
        gl.blitFramebuffer(
            0,
            0,
            this.width,
            this.height,
            0,
            0,
            this.width,
            this.height,
            gl.COLOR_BUFFER_BIT,
            gl.NEAREST,
        );
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

        return this._blitBuffer!.texture!;
    }

    destroy() {
        this._gl.deleteFramebuffer(this.glHandle);
        this._gl.deleteRenderbuffer(this._renderBuffer);
        this._blitBuffer?.destroy();

        this.glHandle = null;
        this._renderBuffer = null;
        this._blitBuffer = null;
    }
}