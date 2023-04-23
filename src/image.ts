import { mat4, vec3 } from "gl-matrix";
import { Program } from "./program";
import { Vertex } from "./vertex";
import { Texture } from "./Texture";

export const imageVS = `
precision highp float;
attribute vec2 position;
attribute vec2 textureUV;

uniform mat4 uMatrix;

varying vec2 textureCoordinate;

void main()
{
    gl_Position = uMatrix * vec4(position.xy, 0.0, 1.0);
    textureCoordinate = textureUV;
}
`;

export const imageFS = `
precision highp float;
varying vec2 textureCoordinate;
uniform sampler2D input1;
void main()
{
    gl_FragColor = texture2D(input1, textureCoordinate);
}
`;

export class Photo {
    private readonly VERTEX = [-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1];

    private _program: Program | null;
    private _vertex: Vertex | null;
    private _texture: Texture | null;

    constructor(image: HTMLImageElement, private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._program = new Program(imageVS, imageFS, this._gl);
        this._vertex = new Vertex(this.VERTEX, this._gl);
        this._texture = new Texture(image.width, image.height, this._gl);
        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, this._texture!.glHandle);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    render() {
        const gl = this._gl;

        gl.useProgram(this._program!.glHandle);
        const stride = 4 * 4;
        this._vertex!.vertexAttribPointer(this._program!.getAttribLocation('position'), stride, 0);
        this._vertex!.vertexAttribPointer(this._program!.getAttribLocation('textureUV'), stride, 2 * 4);
        var modelMatrix = mat4.create();
        var scaleVector3 = vec3.create();
        vec3.set(scaleVector3, 0.7, 0.7, 1.0);
        mat4.scale(modelMatrix, modelMatrix, scaleVector3);
        mat4.rotateZ(modelMatrix, modelMatrix, 15 * (Math.PI / 180));
        gl.uniformMatrix4fv(this._program!.getUniformLocation('uMatrix'), false, modelMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture!.glHandle);
        this._program!.setUniform('input1', 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        this._vertex?.disableVertexAttribPointers();
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.useProgram(null);
    }

    destroy() {
        this._program?.destroy();
        this._vertex?.destroy();
        this._texture?.destroy();

        this._program = null;
        this._vertex = null;
        this._texture = null;
    }
}