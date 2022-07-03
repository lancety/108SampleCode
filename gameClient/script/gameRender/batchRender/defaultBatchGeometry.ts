import {Buffer, Geometry, TYPES} from "pixi.js";
import {epDefaultBatchAttrType, iDefaultBatchAttrMapping} from "./defaultBatchShaderGenerator.type";
import {str_capitalise} from "../../../../script_base/util/string";


export class DefaultBatchGeometry extends Geometry {
    public _buffer: any;
    public _indexBuffer: any;

    constructor(_static = false, custAttrs: iDefaultBatchAttrMapping) {
        super();

        this._buffer = new Buffer(null, _static, false);
        this._indexBuffer = new Buffer(null, _static, true);
        this._addAttrs(custAttrs);
    }

    protected _addAttrs(custAttrs: iDefaultBatchAttrMapping) {
        this._addAttrsDefault();
        this._addAttrsCustom(custAttrs);

        this.addIndex(this._indexBuffer);
    }

    protected _addAttrsDefault() {
        this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aTextureCoord', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aColor', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)
            .addAttribute('aTextureId', this._buffer, 1, true, TYPES.FLOAT);
    }

    protected _addAttrsCustom(custAttrs: iDefaultBatchAttrMapping) {
        custAttrs.forEach(item => {
            switch (item.type) {
                case epDefaultBatchAttrType.float:
                    this.addAttribute(`a${str_capitalise(item.name)}`, this._buffer, item.size, false, TYPES.FLOAT)
                    break;
                default:
                    console.error("not supported custom attr type");
            }
        })
    }
}