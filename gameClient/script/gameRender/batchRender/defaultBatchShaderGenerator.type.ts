import {Matrix} from "pixi.js";
import {int} from "../../../../script_base/util/number";
import {epGLSLType} from "./glsl.type";

export type tDefaultBatchShaderUniformType = number | Float32Array | Matrix;

export interface iDefaultBatchShaderUniformConf {
    name: string,
    value: tDefaultBatchShaderUniformType,
    glType: epGLSLType,
}

export interface iDefaultBatchShaderAttrConf {
    name: string,
    type: epDefaultBatchAttrType,
    glType: epGLSLType,
    size: int
}


export enum epDefaultBatchAttrType {
    float = "float",
    int = "int",
}

export type iDefaultBatchAttrMapping = Array<iDefaultBatchShaderAttrConf>;  // [nameWithoutAVPrefix, type, size]
export type iDefaultBatchUniformMapping = Array<iDefaultBatchShaderUniformConf>;  // [nameOfUniform, type]

export interface iDefaultBatchShaderGeneratorProps {
    attributeMapping: iDefaultBatchAttrMapping,
    uniformsMapping: iDefaultBatchUniformMapping,
    samplerUvSrc: string[],     // todo - this might need to be same amount as texture max limit in batch renderer
}