
import {vector2} from "../../../../../../script_base/@type/graph";
import {float, int} from "../../../../../../script_base/util/number";
import {ePlanetBiome} from "../../../../../../xlsx/script/planetBiome.type";
import {pixiScope} from "../../../../global/pixiScope";
import {PixiContainer} from "../../../component/pixi_Container";
import {eBiomeIconRow} from "../../../../gameAsset/icon/biomeIcon.tex";
import {assetTexture} from "../../../../gameAsset/assetTexture";
import {enAssetTexture} from "../../../../gameAsset/assetTexture.enum";
import {Sprite} from "pixi.js";

export function makeBiomeIconSprite(
    biome, elevation, pos: vector2, radius: float, randInt,
): Sprite {
    let row = eBiomeIconRow[biome];
    // NOTE: mountains reflect elevation, but the biome
    // calculation reflects tempOffset, so if you set the biome
    // bias to be 'cold', you'll get more snow, but you shouldn't
    // get more mountains, so the mountains are calculated
    // separately from biomes
    if (row === 5 && pos[1] < 300) {
        row = 9;
    }
    if (elevation > 0.7) {
        row = 1;
    }
    if (row === undefined) {
        return;
    }
    const col = 1 + randInt(5);

    const texture = assetTexture[enAssetTexture.iconBiome]["_" + row + "_" + col];
    const sprite = new Sprite(texture);
    sprite.x = pos[0];
    sprite.y = pos[1];
    sprite.anchor.set(0.5, 0.5);
    sprite.width = 1.5 * radius;
    sprite.height = 1.5 * radius;
    return sprite;
}

const biomeFilterEffectCache = {
    water: undefined,
    desert: undefined,
};
let needAttachTicker = true;
export function makeBiomeFilterEffect( config: {groupBiome: number, groupContainer: PixiContainer, amp?: int, length?: int }) {
     const{groupBiome, groupContainer} = config;
    let {amp, length} = config;
    amp = amp || 6;
    length = length || 6;
    switch (groupBiome) {
        case ePlanetBiome.OCEAN:
        case ePlanetBiome.LAKE:
        case ePlanetBiome.MARSH: {
            // biomeFilterEffectCache.water = biomeFilterEffectCache.water || new ReflectionFilter({
            //     mirror: false,
            //     boundary: 0,
            //     amplitude: new Array(2).fill(amp / 2),
            //     waveLength: new Array(2).fill(length),
            //     time: 0,
            // });
            // groupContainer.filters = [biomeFilterEffectCache.water];
            break;
        }
        case ePlanetBiome.SUBTROPICAL_DESERT:
        case ePlanetBiome.TROPICAL_DESERT: {
            // biomeFilterEffectCache.desert = biomeFilterEffectCache.desert || new ReflectionFilter({
            //     mirror: false,
            //     boundary: 0,
            //     amplitude: new Array(2).fill(amp / 6),
            //     waveLength: new Array(2).fill(length * 2),
            //     time: 0,
            // });
            // groupContainer.filters = [biomeFilterEffectCache.desert];
            break;
        }
    }

    if (needAttachTicker) {
        pixiScope.ticker.add((tick)=> {
            biomeFilterEffectCache.water && (biomeFilterEffectCache.water.time += tick / 20);
            biomeFilterEffectCache.desert && (biomeFilterEffectCache.desert.time += tick / 20);
        });

        needAttachTicker = false;
    }
}