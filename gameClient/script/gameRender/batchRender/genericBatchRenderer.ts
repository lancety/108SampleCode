import {AbstractBatchRenderer, BatchTextureArray, ViewableBuffer} from '@pixi/core';
import {Dict, premultiplyBlendMode} from '@pixi/utils';
import {BatchGeometry, IBatchableElement, IBatchFactoryOptions, Renderer} from "pixi.js";
import {defaultFragment} from "./defaultFragment";
import {defaultVertex} from "./defaultVertex";
import {DefaultBatchShaderGenerator} from "./defaultBatchShaderGenerator";
import {PixiSprite} from "../component/pixi_Sprite";
import {int} from "../../../../script_base/util/number";
import {
    epDefaultBatchAttrType,
    iDefaultBatchShaderGeneratorProps,
    iDefaultBatchShaderAttrConf
} from "./defaultBatchShaderGenerator.type";
import {DefaultBatchGeometry} from "./defaultBatchGeometry";
import {premultiplyTint} from "./util";

interface iGenericBatchRendererFactoryProps extends IBatchFactoryOptions, iDefaultBatchShaderGeneratorProps {
    forceMaxTextures: int,
}

export class GenericBatchRendererFactory {
    static create(options?: iGenericBatchRendererFactoryProps): typeof AbstractBatchRenderer {
        const {
            // extended
            vertex, fragment, geometryClass,
            // custom
            forceMaxTextures, uniformsMapping, attributeMapping,
        } = Object.assign({
            vertex: defaultVertex,
            fragment: defaultFragment,
            geometryClass: BatchGeometry,
        }, options);
        const vertexSize = attributeMapping.reduce((prev, curr, currIndex) => {
            return prev + curr.size
        }, 6)

        return class GenericBatchRenderer extends AbstractBatchRenderer {
            _iIndex: number;
            _aIndex: number;
            _dcIndex: number;
            _bufferedElements: Array<any>;
            _attributeBuffer: ViewableBuffer;
            _indexBuffer: Uint16Array;
            vertexSize: number;
            forceMaxTextures = forceMaxTextures;

            constructor(renderer: Renderer) {
                super(renderer);

                this.shaderGenerator = new DefaultBatchShaderGenerator(
                    vertex,
                    fragment,
                    options,
                );
                this.geometryClass = class extends DefaultBatchGeometry {
                    constructor(_static = false) {
                        super(_static, attributeMapping);
                    }
                };
                this.vertexSize = vertexSize;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            getUniforms(sprite: PixiSprite): any {
                return sprite.batchUniforms;
            }

            syncUniforms(obj: Dict<any>): void {
                if (!obj) return;
                const sh = this._shader;

                for (const key in obj) {
                    sh.uniforms[key] = obj[key];
                }
            }

            defUniforms = {};

            buildDrawCalls(texArray: BatchTextureArray, start: number, finish: number): void {
                const thisAny = this as any;

                const {
                    _bufferedElements: elements,
                    _attributeBuffer,
                    _indexBuffer,
                    vertexSize,
                } = this;
                const drawCalls = AbstractBatchRenderer._drawCallPool;

                let dcIndex: number = this._dcIndex;
                let aIndex: number = this._aIndex;
                let iIndex: number = this._iIndex;

                let drawCall = drawCalls[dcIndex] as any;

                drawCall.start = this._iIndex;
                drawCall.texArray = texArray;

                for (let i = start; i < finish; ++i) {
                    const sprite = elements[i];
                    const tex = sprite._texture.baseTexture;
                    const spriteBlendMode = premultiplyBlendMode[
                        tex.alphaMode ? 1 : 0][sprite.blendMode];
                    const uniforms = this.getUniforms(sprite);

                    elements[i] = null;

                    // here is the difference
                    if (start < i && (drawCall.blend !== spriteBlendMode || drawCall.uniforms !== uniforms)) {
                        drawCall.size = iIndex - drawCall.start;
                        start = i;
                        drawCall = drawCalls[++dcIndex];
                        drawCall.texArray = texArray;
                        drawCall.start = iIndex;
                    }

                    this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
                    aIndex += sprite.vertexData.length / 2 * vertexSize;
                    iIndex += sprite.indices.length;

                    drawCall.blend = spriteBlendMode;
                    // here is the difference
                    drawCall.uniforms = uniforms;
                }

                if (start < finish) {
                    drawCall.size = iIndex - drawCall.start;
                    ++dcIndex;
                }

                thisAny._dcIndex = dcIndex;
                thisAny._aIndex = aIndex;
                thisAny._iIndex = iIndex;
            }

            drawBatches(): void {
                const dcCount = this._dcIndex;
                const {gl, state: stateSystem, shader: shaderSystem} = this.renderer;
                const drawCalls = AbstractBatchRenderer._drawCallPool;
                let curUniforms: any = null;
                let curTexArray: BatchTextureArray = null;

                for (let i = 0; i < dcCount; i++) {
                    const {texArray, type, size, start, blend, uniforms} = drawCalls[i] as any;

                    if (curTexArray !== texArray) {
                        curTexArray = texArray;
                        this.bindAndClearTexArray(texArray);
                    }
                    // here is the difference
                    if (curUniforms !== uniforms) {
                        curUniforms = uniforms;
                        this.syncUniforms(uniforms);
                        (shaderSystem as any).syncUniformGroup((this._shader as any).uniformGroup);
                    }

                    this.state.blendMode = blend;
                    stateSystem.set(this.state);
                    gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
                }
            }

            contextChange(): void {
                if (!this.forceMaxTextures) {
                    super.contextChange();
                    this.syncUniforms(this.defUniforms);

                    return;
                }

                // we can override MAX_TEXTURES with this hack

                const thisAny = this as any;

                thisAny.MAX_TEXTURES = this.forceMaxTextures;
                this._shader = thisAny.shaderGenerator.generateShader(this.MAX_TEXTURES);
                this.syncUniforms(this.defUniforms);
                for (let i = 0; i < thisAny._packedGeometryPoolSize; i++) {
                    /* eslint-disable max-len */
                    thisAny._packedGeometries[i] = new (this.geometryClass)();
                }
                this.initFlushBuffers();
            }

            packInterleavedGeometry(element: IBatchableElement, attributeBuffer: ViewableBuffer, indexBuffer: Uint16Array,
                                    aIndex: number, iIndex: number): void {
                const {
                    uint32View,
                    float32View,
                } = attributeBuffer;

                const packedVertices = aIndex / this.vertexSize;
                const uvs = element.uvs;
                const indicies = element.indices;
                const vertexData = element.vertexData;
                const textureId = element._texture.baseTexture._batchLocation;

                const alpha = Math.min(element.worldAlpha, 1.0);
                const argb = (alpha < 1.0
                    && element._texture.baseTexture.alphaMode)
                    ? premultiplyTint(element._tintRGB, alpha)
                    : element._tintRGB + (alpha * 255 << 24);

                // lets not worry about tint! for now..
                for (let i = 0; i < vertexData.length; i += 2) {
                    float32View[aIndex++] = vertexData[i];
                    float32View[aIndex++] = vertexData[i + 1];
                    float32View[aIndex++] = uvs[i];
                    float32View[aIndex++] = uvs[i + 1];
                    uint32View[aIndex++] = argb;
                    float32View[aIndex++] = textureId;

                    let attrItem: iDefaultBatchShaderAttrConf;
                    let view;
                    for (let q = 0; q < attributeMapping.length; q++) {
                        attrItem = attributeMapping[q];
                        switch (attrItem.type) {
                            case epDefaultBatchAttrType.float:
                                view = float32View;
                                break;
                            case epDefaultBatchAttrType.int:
                                view = uint32View;
                                break;
                        }

                        aIndex = this._attrViewInsert(element, float32View, attrItem, aIndex);
                    }
                }

                for (let i = 0; i < indicies.length; i++) {
                    indexBuffer[iIndex++] = packedVertices + indicies[i];
                }
            }

            private _attrViewInsert(
                element: IBatchableElement,
                bufferView,
                attrItem: iDefaultBatchShaderAttrConf,
                aIndex: int
            ): int {
                if (attrItem.size === 1) {
                    bufferView[aIndex++] = element["batchAttrs"][attrItem.name];
                } else {
                    for (let ai = 0; ai < attrItem.size; ai++) {
                        bufferView[aIndex++] = element["batchAttrs"][attrItem.name];
                    }
                }

                return aIndex;
            }
        }
    }
}
