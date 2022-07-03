import {Texture} from "pixi.js";

import {iActorRenderInfoCache} from "../../../../gameBase/moduleActor/ARenderInfo.type";
import {OGM} from "../../../../gameBase/moduleObjectGroup/objectGroupMap";
import {epObjectGroupPathIndex} from "../../../../gameBase/moduleObjectGroup/objectPath.type";
import {pixiScope} from "../../global/pixiScope";
import {PixiSpriteWrapper} from "../component/PixiSpriteWrapper";
import {PixiBaseView} from "../componentView/baseView";
import {spriteDebugInit, spriteDebugSync} from "./debug";
import {eObjectGroup} from "../../../../gameBase/moduleObjectGroup/objectGroup.enum";
import {iItemTemplate} from "../../../../gameBase/moduleItem/item.type";
import {assetTexture} from "../../gameAsset/assetTexture";
import {ItemSingleComponentUtil} from "../../../../gameBase/workerAi/_component/itemComponent/ItemSingleComponent.util";
import {PixiSpriteWrapperOOC} from "../component/PixiSpriteWrapperOOC";
import {objectGroupIs} from "../../../../gameBase/moduleObjectGroup/objectGroup.util";
import {epPhysicsLoc} from "../../../../gameBase/modulePhysics/props/physicsLoc.type";


/**
 * for making/adding 'var' sprite.
 * Dont use this one for 'const' sprite. The 'const' sprite are added in layer & view logic.
 * @param {iActorRenderInfo} renderInfo
 * @param {PixiBaseView} viewContainer
 * @returns {PixiSpriteWrapper}
 */
export function updateSpriteWrapper(renderInfo: iActorRenderInfoCache, viewContainer: PixiBaseView, renderContainer): PixiSpriteWrapper {
    let sprite = OGM.getByPathArr(pixiScope.pixiObjMap, renderInfo.path) as PixiSpriteWrapper;

    if (sprite && (sprite.parent === null || sprite.parent.parent === null)) {
        OGM.removeObj(pixiScope.pixiObjMap, sprite);
        sprite.parent?.removeChild(sprite);
        sprite.destroy();
        sprite = undefined;
    }
    if (sprite === undefined) {
        let texture: Texture;
        switch (renderInfo.path[epObjectGroupPathIndex.gp]) {
            case eObjectGroup.itemLoot: {
                const temp: iItemTemplate = ItemSingleComponentUtil.itemTemplate(renderInfo);
                if (temp.assetTexVar) {
                    texture = assetTexture[temp.assetTexVar]["_" + temp.assetRow + "_" + temp.assetColumn];
                }
                break;
            }
        }

        sprite = new PixiSpriteWrapperOOC({
            texture,
            renderInfo
        });
        OGM.addObj(pixiScope.pixiObjMap, sprite);
        spriteDebugInit(sprite, renderInfo);


        // todo - need specify new 'gp' in switch for newly added 'gp' actors
        viewContainer.addViewChild(
            sprite,
            objectGroupIs.static(renderInfo.path[epObjectGroupPathIndex.gp]) ?
                renderInfo.attrs[epPhysicsLoc.pr] : undefined,
            renderContainer,
        );
    }

    if (sprite) {
        sprite.sync(renderInfo);
        spriteDebugSync(sprite, renderInfo)
    }

    return sprite;
}

/**
 *
 * @param texture
 * @param renderInfo
 * @param SpriteClass
 */
export function makeSpriteWrapper(texture: Texture, renderInfo: iActorRenderInfoCache, SpriteClass = PixiSpriteWrapperOOC): PixiSpriteWrapper {
    const sprite = new SpriteClass({texture, renderInfo});
    OGM.addObj(pixiScope.pixiObjMap, sprite);
    spriteDebugInit(sprite, renderInfo);

    return sprite;
}