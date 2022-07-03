import {creationConfig} from "../../../../gameBase/gameConfig/creations/creationConfig";
import {iActorRenderInfoCache} from "../../../../gameBase/moduleActor/ARenderInfo.type";
import {objectGroupIs} from "../../../../gameBase/moduleObjectGroup/objectGroup.util";
import {OGM} from "../../../../gameBase/moduleObjectGroup/objectGroupMap";
import {epObjectGroupPathIndex} from "../../../../gameBase/moduleObjectGroup/objectPath.type";
import {iPixiLoaderResource} from "../../../../script_component/pixi/lib.spine.type";
import {eCreationCategoryIndexKey} from "../../../../script_share/@type/creationProfile";
import {pixiScope} from "../../global/pixiScope";
import {PixiSpineWrapper} from "../component/PixiSpineWrapper";
import {PixiBaseView} from "../componentView/baseView";
import {spriteDebugInit, spriteDebugSync} from "./debug";
import {iPlayerCustomCreation} from "../../../../gameBase/gameConfig/creations/creationConfig.type";
import {epSpineComponentAttrs} from "../../../../gameBase/workerAi/_component/spineComponent/SpineComponent.attr.enum";


let creationCategoryName;
let creation: iPlayerCustomCreation;
let resourceName: string, resource: iPixiLoaderResource;
/**
 * for making/adding 'var' spine sprite.
 * Dont use this one for 'const' sprite. The 'const' sprite are added in layer & view logic.
 * @param {iActorRenderInfo} renderInfo
 * @param {PixiBaseView} viewContainer
 * @returns {PixiSpineWrapper}
 */
export function updateSpineWrapper(renderInfo: iActorRenderInfoCache, viewContainer: PixiBaseView): PixiSpineWrapper {
    creationCategoryName = eCreationCategoryIndexKey[renderInfo.attrs[epSpineComponentAttrs.creationCat]];
    creation = creationConfig.collections[creationCategoryName] && creationConfig.collections[creationCategoryName][renderInfo.attrs[epSpineComponentAttrs.creationId]];

    if (creation === undefined) {
        console.error('missing creation id');
        return;
    }

    resourceName = `spine_${creation.category}_${creation.name}_${creation.version}_${creation.accUuid.slice(-6)}`;
    resource = pixiScope?.loader.resources[resourceName];
    if (resource === undefined || (resource as any).spineDataReady !== true) {
        return;
    }

    if (objectGroupIs.var(renderInfo.path[epObjectGroupPathIndex.gp]) === false) {
        console.error("not var renderInfo updated", renderInfo)
    }

    let wrapper = OGM.getByPathArr(pixiScope.pixiObjMap, renderInfo.path) as PixiSpineWrapper;

    if (wrapper && (wrapper.sprite.state === null || wrapper.parent === null || wrapper.parent.parent === null)) {
        OGM.removeObj(pixiScope.pixiObjMap, wrapper);
        wrapper.parent?.removeChild(wrapper);
        wrapper.destroy();
        wrapper = undefined;
    }
    if (wrapper === undefined) {
        wrapper = new PixiSpineWrapper({
            renderInfo,
            // data: resource.spineDataCopy(),    // this is a copy, not the original source
            data: resource.spineDataCopy(),
        });
        OGM.addObj(pixiScope.pixiObjMap, wrapper);
        spriteDebugInit(wrapper, renderInfo);

        viewContainer.addViewChild(wrapper, objectGroupIs.static(renderInfo.path[epObjectGroupPathIndex.gp]));
    }

    if (wrapper) {
        wrapper.sync(renderInfo);
        spriteDebugSync(wrapper, renderInfo);
    }

    return wrapper;
}