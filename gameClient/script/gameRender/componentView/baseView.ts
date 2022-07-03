import {Container, DisplayObject, Graphics, ParticleContainer} from "pixi.js";

import {iGameData_Map} from "../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {iGameData_Region} from "../../../../gameBase/gameConstFactory/terrain/region/region.abs";
import {iRegionProfile} from "../../../../gameBase/gameConstFactory/terrain/region/region.type";
import {iGameData_RegionGap} from "../../../../gameBase/gameConstFactory/terrain/regionGap/regionGap.abs";
import {Logger} from "../../../../script_base/util/logger";
import {Watchable} from "../../../../script_base/util/watchable";
import {eCamScopeLevel} from "../../clientConstState/view/viewState.enum";
import {cConstState} from "../../global/baseScope";
import {ePixiDebug} from "../../global/pixiDebug";
import {PixiContainer} from "../component/pixi_Container";
import {PixiTilingSprite} from "../component/pixi_TilingSprite";
import {iGameViewContainer, iGameViewContainerParticle} from "./baseView.type";


export interface iGameViewBaseProps {

}

export class PixiBaseView extends PixiContainer {
    protected _logger: Logger;

    get cachedMap(): Watchable<iGameData_Map> {
        return cConstState.terrainState.cachedMap;
    }

    get cachedRegionProfiles(): iRegionProfile[] {
        return cConstState.terrainState.cachedRegionProfile;
    }

    get cachedRegions(): Watchable<iGameData_Region>[] {
        return cConstState.terrainState.cachedRegions;
    }

    get cachedRegionGaps(): Watchable<iGameData_RegionGap>[] {
        return cConstState.terrainState.cachedRegionGaps;
    }

    /**
     * by default children added to this view container, if need to put into special Container,
     * 'new' container in this object in CHILD class, which will be inited in '_initViewContainer' in 'clearView'
     * @type {{}}
     * @protected
     */
    protected _viewContainer: iGameViewContainer;
    get viewContainer(): iGameViewContainer {
        return this._viewContainer;
    }
    protected _viewContainerParticle: iGameViewContainerParticle;
    get viewContainerParticle(): iGameViewContainerParticle {
        return this._viewContainerParticle;
    }

    constructor(protected _props: iGameViewBaseProps) {
        super();
    }

    public addViewChild<T extends DisplayObject>(child: T, extra?: any, parent?: Container): T {
        parent ? parent.addChild(child) : this.addChild(child);
        return child;
    }

    /**
     * reset states
     * unwatch/remove listeners, timeout, interval, dynamic texture generated specifically for this view
     * remove all sprite in view container(s)
     */
    public clearView() {
        globalThis.ty_debug[ePixiDebug.viewInitClear] && console.log("clearView", this.name)
        this._viewUnwatch();
        this._removeViewContainers();
    }

    /**
     * only init once after page loaded. for initiating view containers
     */
    public initView() {
        globalThis.ty_debug[ePixiDebug.viewInitClear] && console.log("initView", this.name)
        this._initViewContainers();
        this._viewWatch();
    }

    /**
     * shortcut for clear and init
     */
    public resetView() {
        globalThis.ty_debug[ePixiDebug.viewInitClear] && console.log("reset", this.name)
        this.clearView();
        this.initView();
    }

    /**
     * when view NOT under visible level of view scope,
     * - logic should pause,
     * - listener should stop triggering
     */
    protected _viewWatch() {

    }

    /**
     * when view IS under visible level of view scope,
     * - logic should run,
     * - listener should start triggering
     */
    protected _viewUnwatch() {

    }

    /**
     * if a view need several different purpose containers, creat the containers then this.addChild()
     * @protected
     */
    protected _initViewContainers() {
        this._viewContainer = {
            contBackground: new PixiContainer(),
            contUnsorted: new PixiContainer(),
            contSorted: new PixiContainer(),
        }

        const {contBackground, contUnsorted, contSorted} = this._viewContainer;

        contBackground.name = "contBackground";
        this.addChild(contBackground);

        contUnsorted.name = "contUnsorted";
        this.addChild(contUnsorted);

        contSorted.sortableChildren = true;
        contSorted.name = "contSorted";
        this.addChild(contSorted);
    }

    protected _removeViewContainers() {
        if (this._viewContainer) {
            // properly clean each container
            const viewContainers = Object.values(this._viewContainer);
            if (viewContainers.length > 0) {
                // if specified any custom container in the View, remove those container's children
                viewContainers.forEach((viewContainer: DisplayObject) => {
                    if (!viewContainer) return;

                    switch (viewContainer.constructor) {
                        case Graphics:
                            (viewContainer as Graphics).geometry && (viewContainer as Graphics).clear();
                            break;
                        case PixiTilingSprite:
                            console.log(viewContainer.name)
                            break;
                        default:
                            (viewContainer as Container).children.forEach(child => {
                                child?.parent?.removeChild(child);
                            });
                    }
                });
            }
        }

        this.removeChildren();
    }

    /**
     * render function
     * @param {eCamScopeLevel} level
     * @param {eCamScopeLevel} prevLevel
     * @param args
     */
    public renderFn(level: eCamScopeLevel, prevLevel: eCamScopeLevel, ...args) {
        console.error("calling abstract renderFn");
    }
}


