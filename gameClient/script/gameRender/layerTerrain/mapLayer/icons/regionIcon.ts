import {Sprite, Texture} from "pixi.js";

import {iGameData_Map} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {eMapDataBuffer} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.type";
import {
    eRegionPointCategory,
    regionPointConfCode
} from "../../../../../../gameBase/gameConstFactory/terrain/map/regionGroup.type";
import {int} from "../../../../../../script_base/util/number";
import {ePlanetBiome} from "../../../../../../xlsx/script/planetBiome.type";
import {PixiContainer} from "../../../component/pixi_Container";
import {PixiParticle} from "../../../particles/pixi_particle";
import {pcSmoke} from "../../../particles/smoke";
import {makeBiomeIconSprite} from "./biomeIcon";
import {makeResidentialAreaIcon} from "./residentialIcon";
import {iObjMap} from "../../../../../../script_base/util/object.type";

/*
* Draw a biome icon in each of the regions
*/
export function drawRegionIcons(container: PixiContainer, map: iGameData_Map, mapIconsTexture: iObjMap<Texture>, randInt: (seed: int)=>int) {
    const {mesh, buffer} = map;
    const {r_groupDistribute, r_biome} = buffer;
    const radius = map.mesh.r_radius;

    for (let region = mesh.state.numBoundaryRegions; region < mesh.state.numRegions; region++) {
        const groupContainer = new PixiContainer();
        groupContainer.name = `regionIcon`;

        if (mesh.r_boundary(region)) {
            continue;
        }

        let iconSprite;
        const regionPointCode = r_groupDistribute[region];
        const regionPointConf = regionPointConfCode[regionPointCode];

        if (map.buffer[eMapDataBuffer.r_biome][region] === ePlanetBiome.OCEAN) {
            // todo - show it after ocean world is implemented
            continue;
        } else if (regionPointCode > 0 && regionPointConf.iconHide !== true) {
            const vertex = mesh.__r_vertex(region);

            switch (regionPointConf.category) {
                case eRegionPointCategory.residential: {
                    const textureName = '_0_' + regionPointConf.textureIndex;
                    iconSprite = makeResidentialAreaIcon(
                        textureName,
                        vertex,
                        radius * (1 + regionPointCode % 10 / 9),
                    )
                    iconSprite && groupContainer.addChild(iconSprite);
                    break;
                }
                case eRegionPointCategory.respawn: {

                    // console.log((PIXI as any).particles);

                    const respawnSmokeSprite = new Sprite();
                    respawnSmokeSprite.name = "respawnSprite";
                    respawnSmokeSprite.position.set(...vertex);

                    const smokeConf = pcSmoke(
                        radius * 4, 100,
                        Texture.from("/img/particles/cartoonSmoke_100.png"),
                        );

                    new PixiParticle(
                        respawnSmokeSprite,
                        smokeConf
                    ).watch().play();
                    groupContainer.addChild(respawnSmokeSprite);

                    break;
                }
                case eRegionPointCategory.dungeon:

                    break;
            }
        } else {
            iconSprite = makeBiomeIconSprite(
                r_biome[region],
                map.buffer.r_elevation[region],
                mesh.__r_vertex(region),
                radius,
                randInt,
            );
            iconSprite && groupContainer.addChild(iconSprite);
        }

        container.addChild(groupContainer);
    }
}
