import {clientScope} from "../../../../gameBase/global/clientScope";
import {iActorRenderInfoCache} from "../../../../gameBase/moduleActor/ARenderInfo.type";
import {eObjectGroup} from "../../../../gameBase/moduleObjectGroup/objectGroup.enum";
import {OGM} from "../../../../gameBase/moduleObjectGroup/objectGroupMap";
import {epObjectGroupPathIndex} from "../../../../gameBase/moduleObjectGroup/objectPath.type";
import {eCamScopeLevel} from "../../clientConstState/view/viewState.enum";
import {cConstState} from "../../global/baseScope";
import {pixiScope} from "../../global/pixiScope";
import {PixiGameViewLayer} from "../component/pixi_GameLayer";
import {pixiObjectUtil} from "../component/PixiObject.util";
import {PixiSpriteWrapper} from "../component/PixiSpriteWrapper";
import {PixiRegionView} from "../componentView/regionView";
import {updateSpineWrapper} from "../sprite/spineWrapper";
import {updateSpriteWrapper} from "../sprite/spriteWrapper";
import {epRegionViewGroup, epRegionViewGroupIndex} from "./regionLayer/regionLayer.type";
import {epTerrainLayer} from "./terrainLayerMag.enum";
import {objectGroupIs} from "../../../../gameBase/moduleObjectGroup/objectGroup.util";
import {PixiObjWrapper} from "../component/PixiObjWrapper";
import {epPhysicsLoc} from "../../../../gameBase/modulePhysics/props/physicsLoc.type";

export function terrainContentUpdater(terrainLayers: { [key in epTerrainLayer]: PixiGameViewLayer }) {
    pixiScope.ticker.add(async () => {
        const {actorRenderInfoMap, aiTickId} = clientScope;

        OGM.loop(actorRenderInfoMap, (renderInfo: iActorRenderInfoCache) => {
            if (renderInfo.aiObsTickId !== aiTickId) {
                // only hide moving sprites, static sprites stay where they are and removed together with region
                objectGroupIs.var(renderInfo.path[epObjectGroupPathIndex.gp]) && pixiObjectUtil.dispose(renderInfo);
            } else {
                _renderSwitch(renderInfo, terrainLayers)
            }
        });
    })
}

function _renderSwitch(renderInfo: iActorRenderInfoCache, layers: { [key in epTerrainLayer]: PixiGameViewLayer }) {
    const {path} = renderInfo;
    const gp = path[epObjectGroupPathIndex.gp];

    const groundObjViews = layers.region.views[epRegionViewGroup.groundObjViews] as PixiRegionView;
    const landDebugViews = layers.region.views[epRegionViewGroup.landDebugViews] as PixiRegionView;

    switch (gp) {
        case eObjectGroup.treeConst:
        case eObjectGroup.mineralConst:{
            const ridRefs = groundObjViews?.ridRefs[path[epObjectGroupPathIndex.gb]];
            const rope = ridRefs && OGM.getByPathArr(ridRefs, path) as PixiObjWrapper;
            if (rope === undefined) break;
            rope.sync && rope.sync(renderInfo);
            break;
        }

        case eObjectGroup.treeVar:
        case eObjectGroup.mineralVar:
            _renderSprite(renderInfo, groundObjViews);
            break;

        case eObjectGroup.itemLoot:
            _renderSprite(renderInfo, groundObjViews, groundObjViews.viewContainer?.contUnsorted);
            break;

        case eObjectGroup.lowIqVar:
        case eObjectGroup.midIqVar:
        case eObjectGroup.highIqVar:
        case eObjectGroup.player:
            _renderSpine(renderInfo, groundObjViews);
            break;

        case eObjectGroup.interactSensor:
        case eObjectGroup.toolHitSensor:
        case eObjectGroup.visionSensor:
        case eObjectGroup.smellSensor:
            _renderSprite(renderInfo, landDebugViews, groundObjViews.viewContainer?.contUnsorted);
            break;
    }
}

function _renderSpine(renderInfo: iActorRenderInfoCache, viewContainer) {
    if (viewContainer === undefined) {
        console.error(`container for ${renderInfo.path.join(" ")} not exist`);
        return;
    }
    if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.body) {
        updateSpineWrapper(renderInfo, viewContainer);
    } else {
        pixiObjectUtil.remove(renderInfo);
    }
}

function _renderSprite(renderInfo: iActorRenderInfoCache, viewContainer, renderContainer?) {
    if (viewContainer === undefined) {
        console.error(`container for ${renderInfo.path.join(" ")} not exist`);
        return;
    }
    if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.body) {
        updateSpriteWrapper(renderInfo, viewContainer, renderContainer);
    } else {
        pixiObjectUtil.remove(renderInfo);
    }
}