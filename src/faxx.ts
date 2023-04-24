import { Program } from "./program";
import { Vertex } from "./vertex";

export const faxxVS = `
precision highp float;
attribute vec2 position;
attribute vec2 textureUV;

varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;
varying vec2 textureCoordinate;

uniform vec2 resolution;
uniform vec2 inverseVP;

void texcoords(vec2 fragCoord) {
    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
    v_rgbM = vec2(fragCoord * inverseVP);
}

void main()
{
    gl_Position = vec4(position.xy, 0.0, 1.0);

    textureCoordinate = textureUV * resolution;

    texcoords(textureCoordinate);
}
`;

export const faxxFS = `
precision highp float;
varying vec2 textureCoordinate;
uniform vec2 resolution;
uniform vec2 inverseVP;
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform sampler2D input1;

#define FXAA_REDUCE_MIN   (1.0 / 128.0)
#define FXAA_REDUCE_MUL   (1.0 / 8.0)
#define FXAA_SPAN_MAX     8.0

vec4 applyFXAA(sampler2D tex, vec2 fragCoord)
{
    vec4 color;
    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
    vec4 texColor = texture2D(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                  dir * rcpDirMin)) * inverseVP;

    vec4 rgbA = 0.5 * (
                       texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)) +
                       texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)));
    vec4 rgbB = rgbA * 0.5 + 0.25 * (
                                     texture2D(tex, fragCoord * inverseVP + dir * -0.5) +
                                     texture2D(tex, fragCoord * inverseVP + dir * 0.5));

    float lumaB = dot(rgbB.rgb, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA.rgb, texColor.a);
    else
        color = vec4(rgbB.rgb, texColor.a);
    return color;
}

void main()
{
    gl_FragColor = applyFXAA(input1, textureCoordinate);
}
`;
export class FAXX {
    private readonly VERTEX = [-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1];

    private _program: Program | null;
    private _vertex: Vertex | null;

    constructor(private _gl: WebGLRenderingContextBase & WebGLRenderingContextOverloads) {
        this._program = new Program(faxxVS, faxxFS, this._gl);
        this._vertex = new Vertex(this.VERTEX, this._gl);
    }

    render(texture: WebGLTexture, width: number, height: number) {
        const gl = this._gl;

        gl.useProgram(this._program!.glHandle);
        const stride = 4 * 4;
        this._vertex!.vertexAttribPointer(this._program!.getAttribLocation('position'), stride, 0);
        this._vertex!.vertexAttribPointer(this._program!.getAttribLocation('textureUV'), stride, 2 * 4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        this._program!.setUniform('input1', 0);
        const resolution = Array.from([width, height]);
        const resolutionVP = Array.from([1 / width, 1 / height]);
        this._program!.setUniform('resolution', resolution);
        this._program!.setUniform('inverseVP', resolutionVP);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindTexture(gl.TEXTURE_2D, null);
        this._vertex!.disableVertexAttribPointers();
        gl.useProgram(null);
    }

    destroy() {
        this._program?.destroy();
        this._vertex?.destroy();

        this._program = null;
        this._vertex = null;
    }
}

