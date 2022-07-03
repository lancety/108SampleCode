import {Graphics, Rectangle, Sprite, Text} from "pixi.js";

import {iGameData_Map} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {eMapDataBuffer} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.type";
import {
    biomeWater
} from "../../../../../../gameBase/gameConstState/planet/planetBiome.enum";
import {hexStrTo0x, hslStr2hex} from "../../../../../../script_base/util/color";
import {Logger} from "../../../../../../script_base/util/logger";
import {int} from "../../../../../../script_base/util/number";
import {ePlanetBiome} from "../../../../../../xlsx/script/planetBiome.type";
import {cConstState} from "../../../../global/baseScope";
import {ePixiDebug} from "../../../../global/pixiDebug";
import {PixiContainer} from "../../../component/pixi_Container";
import {renderBgColor} from "../../../pixi.type";
import {pixiTool} from "../../../pixiTool";
import {biomeLowLightColor} from "../../config/biomeColor";

export function drawRegionShape(container: PixiContainer, map: iGameData_Map, colormap, useNoiseOnEdge: boolean, underLayer?: boolean) {
    const {mesh, buffer} = map;
    const logger = new Logger(ePixiDebug.vMap_common);

    const regionShapeContainer = new PixiContainer();
    const batchSize = 1000;
    for (let f = 0; f <= Math.floor(mesh.state.numSolidRegions / batchSize); f++) {
        const rangeFrom = f * batchSize;
        const rangeTo = f === Math.floor(mesh.state.numSolidRegions / batchSize) ? rangeFrom + mesh.state.numSolidRegions % batchSize : (f + 1) * batchSize;

        const graphics = new Graphics();
        graphics.name = "noisyRegions" + (f * batchSize);

        for (let r = rangeFrom; r < rangeTo; r++) {
            const rBiome = buffer[eMapDataBuffer.r_biome][r];

            // todo ocean is not visible on map, so not need to draw it. use bg ocean color
            // if (map.buffer[eMapDataBuffer.r_biome][r] === eBiome.OCEAN) {
            //     continue;
            // }
            let path;
            if (useNoiseOnEdge) {
                path = mesh.r_circulate_path_noisy_flat([], r, nbSide => {
                    return !useNoiseOnEdge || !colormap.side(map, nbSide).noisy
                });
                // add last as first, so it close the path for drawing
                path.unshift(path[path.length - 2], path[path.length - 1]);
            } else {
                const circulate_t = mesh.r_circulate_t([], r);
                circulate_t.unshift(circulate_t[circulate_t.length - 1]);
                path = [];
                for (let t = 0; t < circulate_t.length; t++) {
                    path.push(...mesh.t_pos(circulate_t[t]))
                }
            }


            const debug: any = {
                debugRegionGroup: globalThis.ty_debug[ePixiDebug.vMap_regionGroup],
                debugMesh: logger.active,
                debugText: logger.active,
            };

            let color, alpha = 1;
            if (mesh.r_boundary(r)) {
                color = renderBgColor;
            } else if (underLayer && biomeWater.has(rBiome) ) {
                color = hexStrTo0x(biomeLowLightColor[rBiome]);
            } else {
                color = debug.debugRegionGroup && debugRegionGroupColor(logger, r, map, debug.debugRegionGroup) || hexStrTo0x(colormap.biome(map, r));
            }
            graphics.beginFill(color, alpha);
            graphics.drawPolygon(path);
            graphics.endFill();

            // debug.debugText && debugMeshText(map, regionShapeContainer, r);
        }
        regionShapeContainer.addChild(graphics);
    }

    let debugElevation;
    // debugElevation = logger.debugActivated && true;
    debugElevation && debugMapElevation(map, regionShapeContainer);
    const texture = pixiTool.generateTexture(regionShapeContainer, 1, 1, [0, 0, regionShapeContainer.width, regionShapeContainer.height]);
    regionShapeContainer.destroy({children: true, texture: true, baseTexture: true});

    const sprite = new Sprite(texture);
    sprite.name = "regionShape";
    // sprite.dynamicTextureAll(); // todo - texture need to be recycled
    container.addChild(sprite)
}

function debugRegionGroupColor(logger, rInd, map: iGameData_Map, debugRegionGroup) {
    const regionDist = map.buffer[eMapDataBuffer.r_groupDistribute][rInd];
    let regionDistColor;
    switch (regionDist) {
        // case residentialCode[eResidentialType.city]:
        //     regionDistColor = debugRegionGroup ? 0x111111 : 0xff3333;
        //     break;
        // case residentialCode[eResidentialType.town]:
        //     regionDistColor = debugRegionGroup ? 0x444444 : 0x3333ff;
        //     break;
        // case residentialCode[eResidentialType.country]:
        //     regionDistColor = debugRegionGroup ? 0xffffff: 0xffff33;
        //     break;
        default:
            if (debugRegionGroup) {
                switch (map.buffer[eMapDataBuffer.r_biome][rInd]) {
                    case ePlanetBiome.BEACH:
                        regionDistColor = 0xeeeeee;
                        break;
                    default:
                        regionDistColor = hexStrTo0x(hslStr2hex(`hsl(${map.buffer[eMapDataBuffer.r_groupIndexSub][rInd] * 65 % 255}, 100%, 50%)`));
                }
            } else {
                return;
            }
    }
    return regionDistColor;
}

function debugMeshText(map: iGameData_Map, container: PixiContainer, rInd: int) {
    const {mesh, buffer} = map;
    const biome = buffer[eMapDataBuffer.r_biome][rInd],
        groupId = buffer[eMapDataBuffer.r_groupIndex][rInd],
        groupIdSub = buffer[eMapDataBuffer.r_groupIndexSub][rInd],
        groupDepth = buffer[eMapDataBuffer.r_groupDepth][rInd],
        groupWeight = buffer[eMapDataBuffer.r_groupWeight][rInd],
        groupDistribute = buffer[eMapDataBuffer.r_groupDistribute][rInd];

    // if (biome === eBiome.OCEAN) {
    //     return;
    // }
    const regionInfo = new Text(`R.${rInd}.${biome}\nd${groupDepth}/w${groupWeight}-${groupId}/s${groupIdSub}`, {
        fontSize: cConstState.terrainState.mapStatus.rSpace / 10,
        fill: "#000000",
    });
    regionInfo.anchor.set(0.5, 0.5);
    regionInfo.x = mesh.r_x(rInd);
    regionInfo.y = mesh.r_y(rInd);
    regionInfo.resolution = Math.floor(cConstState.terrainState.mapStatus.mUnitMeter * 0.75);
    container.addChild(regionInfo);
}

function debugMapElevation(map: iGameData_Map, container: PixiContainer) {
    const {buffer, mesh} = map;
    map.buffer[eMapDataBuffer.r_elevation].forEach((r, rInd) => {
        const regionInfo = new Text(`${r.toFixed(2)}`, {
            fontSize: cConstState.terrainState.mapStatus.rSpace / 10,
            fill: "#000000",
        });
        regionInfo.anchor.set(0.5, 0.5);
        regionInfo.x = mesh.r_x(rInd);
        regionInfo.y = mesh.r_y(rInd);
        regionInfo.resolution = Math.floor(cConstState.terrainState.mapStatus.mUnitMeter * 0.75);
        container.addChild(regionInfo);
    });
    map.buffer[eMapDataBuffer.t_elevation].forEach((t, tInd) => {
        const regionInfo = new Text(`${t.toFixed(2)}`, {
            fontSize: 6,
            fill: "#ff0000",
        });
        regionInfo.anchor.set(0.5, 0.5);
        regionInfo.x = mesh.t_x(tInd);
        regionInfo.y = mesh.t_y(tInd);
        regionInfo.resolution = 10;
        container.addChild(regionInfo);
    });
}