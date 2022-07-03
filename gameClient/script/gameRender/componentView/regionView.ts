import {Container, DisplayObject, ParticleContainer, UPDATE_PRIORITY} from "pixi.js";

import {GeoUtil} from "../../../../gameBase/gameUtil/geoUtil";
import {eObjectGroup} from "../../../../gameBase/moduleObjectGroup/objectGroup.enum";
import {OGM} from "../../../../gameBase/moduleObjectGroup/objectGroupMap";
import {objPathArr} from "../../../../gameBase/moduleObjectGroup/objectPath";
import {iObjectPathArr} from "../../../../gameBase/moduleObjectGroup/objectPath.type";
import {QuadQuery} from "../../../../script_base/quadquery/quadQuery";
import {int} from "../../../../script_base/util/number";
import {eCamScopeLevel} from "../../clientConstState/view/viewState.enum";
import {cConstState} from "../../global/baseScope";
import {pixiScope} from "../../global/pixiScope";
import {iPixiOOCCustProps} from "../component/_pixi_CustProps.type";
import {PixiSpriteWrapper} from "../component/PixiSpriteWrapper";
import {iGameViewBaseProps, PixiBaseView} from "./baseView";
import {iObjectBranchMap} from "../../../../gameBase/moduleObjectGroup/objectGroupMap.type";


export interface iGameView_RegionProps extends iGameViewBaseProps {

}

export class PixiRegionView extends PixiBaseView {
    constructor(protected _props: iGameView_RegionProps) {
        super(_props);
    }

    /*
    *
    * inherited methods
    *
    * */

    /**
     * region view dont directly remove everything from containers,
     * because dynamic obj should be kept, OR find a better way to maintain those dynamic objects in region view
     */
    public clearView() {
        super.clearView();
        // this is how region view clean up
        for (const rid in this.ridRefs) {
            this._removeFn(parseInt(rid));
        }
    }

    protected _viewWatch() {
        this._watchChildrenCull();
        super._viewWatch();
    }

    protected _viewUnwatch() {
        this._unwatchChildrenCull();
        super._viewUnwatch();
    }

    /**
     * instead of calling container.addChild, we use:
     *  - ridRefs to keep a link list for each region, use it to remove these children from view container
     *  - ridQuad to keep a pos quad tree, for querying children inside a view rectangle scope
     * @param {int} rid     int region id
     * @param {} child   list of DisplayObject
     * @param parent
     * @returns {T[0]}  return first child added in the list
     */
    public addViewChild<T extends DisplayObject>(child: T, rid?: int, parent?: Container): T {
        parent ? parent.addChild(child) : this.addChild(child);
        this._ridRefsInsert(child, rid);
        this._ridQuadInsert(child);
        return child;
    }

    public renderFn(level, prevLevel, rid: int) {
        this.ridRefs[rid] = this.ridRefs[rid] || {} as iObjectBranchMap<DisplayObject>;
    }


    /*
    *
    * region view specific logic
    *
    * */

    /**
     * regionView specific logic - when rcBatch render all visible regions, need to reset by this
     * reset or init or what ever need to be done when level changed
     * @param level
     * @param prevLevel
     * @returns {boolean}
     */
    public triggerReset(level, prevLevel): boolean {
        if (level <= eCamScopeLevel.regionSymbol && prevLevel > eCamScopeLevel.regionSymbol) {
            this.resetView();
            return true;
        }
    }


    protected _visible: int[] = [];
    protected __increaseId = 0;
    get _increaseId() {
        this.__increaseId++;
        return this.__increaseId;
    }

    /**
     * static region item is saved in here
     * @type {{[p: number]: []}}
     * @protected
     */
    public ridRefs: { [rid: number]: iObjectBranchMap<DisplayObject> } = {};

    protected _ridRefsInsert(child: DisplayObject, rid?: int) {
        if (rid) {
            // for gap rid, another side might not "rc" yet
            this.ridRefs[rid] = this.ridRefs[rid] || {} as iObjectBranchMap<DisplayObject>;

            let path: iObjectPathArr = (child as PixiSpriteWrapper).path;
            if (path === undefined) {
                path = objPathArr.get(rid, eObjectGroup.ungrouped, this._increaseId);
            }
            OGM.addByPathArr(this.ridRefs[rid], path, child);
        }
    }


    /**
     * access of this object MUST happen after pixi object process, so it can use its transform data and parent data
     * @type {QuadQuery}
     * @protected
     */
    protected _ridQuads: QuadQuery;

    protected _ridQuadInsert(child: DisplayObject) {
        if (child.parent.constructor === ParticleContainer) {
            return;
        }
        if (child.x === 0 && child.y === 0) {
            return;
        }

        this._ridQuads = this._ridQuads || new QuadQuery({
            maxCellItems: 10,
            minCellSize: GeoUtil.convMeter2MapValue(10),
            width: cConstState.terrainState.cachedMap.val.mesh.state.meshSize[0],
            height: cConstState.terrainState.cachedMap.val.mesh.state.meshSize[1],
            xywh: function (obj: iPixiOOCCustProps, checkonly): boolean {
                if (!obj || obj.parent === null || obj.xywh === undefined) {
                    return false;
                }
                if (checkonly !== true) {
                    this._xywh.set(obj.xywh);
                }
                return true;
            }
        });

        (child as undefined as iPixiOOCCustProps).oocFrame = 0;
        this._ridQuads.in(0, child);
    }

    public visibilityBatch(visible: int[], needShow: int[], needHide: int[]) {
        const level = cConstState.viewState.camScopeLevel.val;
        const prevLevel = cConstState.viewState.camScopeLevel.valPrev;

        // console.log("rcRids", "V", visible.join(","), "S", needShow.join(","), "H", needHide.join(","))

        this._visible.splice(0) && this._visible.push(...visible);
        needShow.forEach(rid => {
            this.renderFn(level, prevLevel, rid);
        })
        needHide.forEach(rid => {
            this._removeFn(rid)
        })
    }

    public visibilityShow(rid: int) {
        const level = cConstState.viewState.camScopeLevel.val;
        const prevLevel = cConstState.viewState.camScopeLevel.valPrev;
        this._visible.indexOf(rid) === -1 && this._visible.push(rid);
        this.renderFn(level, prevLevel, rid);
    }

    public renderBatch(level, prevLevel) {
        // console.log("batch", this._visible.join(","));
        this._visible.forEach(rid => cConstState.terrainState.cachedRegions[rid].val && this.renderFn(level, prevLevel, rid));
    }

    protected _removeFn(rid: int) {
        if (this.ridRefs[rid]) {
            OGM.loop(this.ridRefs[rid], function (child: DisplayObject) {
                child?.parent?.removeChild(child);
            })
            delete this.ridRefs[rid];

        }

        if (this._ridQuads && cConstState.terrainState.cachedRegions[rid]?.val) {
            const lt = cConstState.terrainState.cachedRegions[rid].val.state.regionProfile.mLT;
            const rb = cConstState.terrainState.cachedRegions[rid].val.state.regionProfile.mRB;
            this._ridQuads.out(0, ...lt, rb[0] - lt[0], rb[1] - lt[1]);
            delete this._ridQuads[rid];
        }
    }

    /*
     *
     * culling static sprite
     *
     */

    protected _watchChildrenCull() {
        pixiScope.ticker.add(this._childrenCull, undefined, UPDATE_PRIORITY.HIGH);
    }

    protected _unwatchChildrenCull() {
        pixiScope.ticker.remove(this._childrenCull);
    }

    // private _lastObjsCull = 0;
    protected _childrenCull = () => {
        if (this._ridQuads === undefined) return;

        const [lt, rb] = cConstState.viewState.camMeshEdge.val;
        const objs = this._ridQuads.query(0, ...lt, rb[0] - lt[0], rb[1] - lt[1]);
        // if (this._lastObjsCull !== objs.length) {
        //     this._lastObjsCull = objs.length;
        //     console.log('after cull obj length', objs.length, ...lt, rb[0] - lt[0], rb[1] - lt[1]);
        // }
        objs.forEach((child: iPixiOOCCustProps) => {
            child.oocFrame = pixiScope.ticker.lastTime;
        });
    }
}