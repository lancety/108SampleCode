import {PixiSprite} from "../component/pixi_Sprite";
import {iActorRenderInfoCache} from "../../../../gameBase/moduleActor/ARenderInfo.type";
import {Texture} from "pixi.js";
import {GeoUtil} from "../../../../gameBase/gameUtil/geoUtil";
import {epPhysicsBase} from "../../../../gameBase/modulePhysics/props/physicsBase.enum";
import {objectGroupIs} from "../../../../gameBase/moduleObjectGroup/objectGroup.util";
import {epObjectGroupPathIndex} from "../../../../gameBase/moduleObjectGroup/objectPath.type";
import {OGM} from "../../../../gameBase/moduleObjectGroup/objectGroupMap";
import {pixiScope} from "../../global/pixiScope";
import {spriteDebugInit} from "./debug";


export function makeSprite(texture: Texture, renderInfo: iActorRenderInfoCache, SpriteClass = PixiSprite): PixiSprite {
    const {path, physicsOpts, attrs} = renderInfo;
    const posMap = GeoUtil.transMeter2Map([
        attrs[epPhysicsBase.px],
        attrs[epPhysicsBase.py],
    ]);
    const [widthMap, heightMap] = GeoUtil.convMeter2Map(physicsOpts.size);

    const sprite = new SpriteClass(texture);
    sprite.path = path;
    sprite.renderInfo = renderInfo;
    sprite.name = path.join("_");
    sprite.x = posMap[0];
    sprite.y = posMap[1];
    sprite.zIndex = sprite.y;
    sprite.width = widthMap;
    sprite.height = heightMap;

    // Q: iBody has isStatic, why not use it directly?
    // A: render engine shows all visible elements on screen (1 - 25+ regions), which physics engine cannot take
    //    that much of elements at same time (normally 3 - 5 regions), so cannot get all those region elements from
    //    physics engine, so cannot use body instance to make these sprites because availability of 2 group are diff.
    sprite.spriteStatic = objectGroupIs.static(path[epObjectGroupPathIndex.gp]);
    OGM.addObj(pixiScope.pixiObjMap, sprite);
    spriteDebugInit(sprite, renderInfo);
    return sprite;
}