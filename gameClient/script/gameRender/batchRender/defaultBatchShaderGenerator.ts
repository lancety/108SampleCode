import {BatchShaderGenerator, Shader} from "pixi.js";
import {
    iDefaultBatchAttrMapping,
    iDefaultBatchShaderGeneratorProps,
    iDefaultBatchUniformMapping
} from "./defaultBatchShaderGenerator.type";
import {str_capitalise} from "../../../../script_base/util/string";



export class DefaultBatchShaderGenerator extends BatchShaderGenerator {
    constructor(vertexSrc: string, fragTemplate: string, protected options: iDefaultBatchShaderGeneratorProps) {
        super(vertexSrc, fragTemplate);
        this._updateAttributes();
    }
    generateShader(maxTextures: number): Shader {
        const shader = super.generateShader(maxTextures);
        this.options.uniformsMapping.forEach(item => {
            shader.uniforms[item.name] = item.value;
        })
        return shader;
    }

    private _updateAttributes() {
        const uniforms = this.options.uniformsMapping;
        const attrs = this.options.attributeMapping;
        if (Array.isArray(attrs) === false || attrs.length === 0) {
            this.vertexSrc = this.vertexSrc.replace(/%attrs%/gi, "");
            this.vertexSrc = this.vertexSrc.replace(/%attrsVarying%/gi, "");
            this.vertexSrc = this.vertexSrc.replace(/%varyingSet%/gi, "");

            this.fragTemplate = this.fragTemplate.replace(/%attrsVarying%/gi, "");

        } else {
            this.vertexSrc = this.vertexSrc.replace(/%attrs%/gi, this._makeAttrSrc(attrs));
            this.vertexSrc = this.vertexSrc.replace(/%attrsVarying%/gi, this._makeVaryingSrc(attrs));
            this.vertexSrc = this.vertexSrc.replace(/%varyingSet%/gi, this._makeVaryingSet(attrs));

            this.fragTemplate = this.fragTemplate.replace(/%attrsVarying%/gi, this._makeVaryingSrc(attrs));
        }
        if (Array.isArray(uniforms) === false || uniforms.length === 0) {
            this.vertexSrc = this.vertexSrc.replace(/%uniforms%/gi, "");
            this.fragTemplate = this.fragTemplate.replace(/%uniforms%/gi, "");
        } else {
            this.vertexSrc = this.vertexSrc.replace(/%uniforms%/gi, this._makeUniformSrc(uniforms));
            this.fragTemplate = this.fragTemplate.replace(/%uniforms%/gi, this._makeUniformSrc(uniforms));
        }
    }

    private _makeUniformSrc(uniformMapping: iDefaultBatchUniformMapping): string {
        let src = "";
        uniformMapping.forEach(item => {
            src += `uniform ${item.glType} ${item.name};
`
        })
        return src;
    }

    private _makeAttrSrc(attrMapping: iDefaultBatchAttrMapping): string {
        let src = "";
        attrMapping.forEach(item => {
            src += `attribute ${item.glType} a${str_capitalise(item.name)};
`
        })
        return src;
    }
    private _makeVaryingSrc(attrMapping: iDefaultBatchAttrMapping): string {
        let src = "";
        attrMapping.forEach(item => {
            src += `varying ${item.glType} v${str_capitalise(item.name)};
`
        })
        return src;
    }

    private _makeVaryingSet(attrMapping: iDefaultBatchAttrMapping): string {
        let src = "";
        attrMapping.forEach(item => {
            src += `v${str_capitalise(item.name)}=a${str_capitalise(item.name)};
`;
        })
        return src;
    }

    generateSampleSrc(maxTextures: number): string
    {
        let src = '';

        src += '\n';
        src += '\n';

        for (let i = 0; i < maxTextures; i++)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxTextures - 1)
            {
                src += `if(vTextureId < ${i}.5)`;
            }

            src += '\n{\n\t';
            src += `
        color = texture2D(
            uSamplers[${i}],
            ${this.options.samplerUvSrc[i] || "vec2(0, 0)"}
        );
        `;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }
}