export const defaultFragment = `

uniform sampler2D uSamplers[%count%];
%uniforms%

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;

%attrsVarying%


void main(void){
    vec4 color;
    %forloop%
    gl_FragColor = color * vColor;
}
`