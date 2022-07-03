import {Watchable} from "../../../../script_base/util/watchable";
import {eCamScopeLevel} from "../../clientConstState/view/viewState.enum";
import {PixiContainer} from "../component/pixi_Container";
import {ParticleContainer} from "pixi.js";
import {eObjectGroup} from "../../../../gameBase/moduleObjectGroup/objectGroup.enum";


export interface iGameViewBase_watchable {
    visible: Watchable<boolean>,
    viewType: Watchable<eCamScopeLevel>,    // max scope value from x, y
}

export interface iGameViewContainer {
    contBackground: PixiContainer,
    contSorted: PixiContainer,
    contUnsorted: PixiContainer,
}

export type iGameViewContainerParticle = {[key in eObjectGroup]?: ParticleContainer}