export const defaultVS = `
precision highp float;
attribute vec2 position;
attribute vec2 textureUV;

varying vec2 textureCoordinate;

void main()
{
    gl_Position = vec4(position.xy, 0.0, 1.0);
    textureCoordinate = textureUV;
}
`;

export const defaultFS = `
precision highp float;
varying vec2 textureCoordinate;
uniform sampler2D input1;
void main()
{
    vec4 color = texture2D(input1, textureCoordinate);
    gl_FragColor = vec4(color.r, color.g, color.b , color.a);
}
`;