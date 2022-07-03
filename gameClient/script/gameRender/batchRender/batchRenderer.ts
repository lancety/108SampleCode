import {Renderer} from "pixi.js";
import {epDefaultBatchAttrType} from "./defaultBatchShaderGenerator.type";
import {epGLSLType} from "./glsl.type";


export async function batchRendererInit() {
    const {GenericBatchRendererFactory} = await import(/* webpackChunkName: "batchRenderer" */ './genericBatchRenderer');
    Renderer.registerPlugin('batch_waterSurface', GenericBatchRendererFactory.create({
        // vertex: waterSurface[0],
        // fragment: waterSurfaceFrag,
        forceMaxTextures: 3,
        samplerUvSrc: [`
            vec2(
                fract(vTextureCoord.x / vScale - cos(vMoveRadian) * uTime / 400.),
                fract(vTextureCoord.y / vScale - sin(vMoveRadian) * uTime / 400.)
            ) + vec2(
                cos(uTime + vTextureCoord.x * 404.) * 0.001,
                sin(uTime + vTextureCoord.x * 804.) * 0.001
            )
        `],
        attributeMapping: [
            {name: 'scale', type: epDefaultBatchAttrType.float, size: 1, glType: epGLSLType.float},
            {name: 'moveRadian', type: epDefaultBatchAttrType.float, size: 1, glType: epGLSLType.float},
        ],
        uniformsMapping: [
            {name: "uTime", value: 0, glType: epGLSLType.float},
        ]
    }));

}