import {getBlendFilter} from "@pixi/picture";
import {BLEND_MODES, Mesh} from "pixi.js";

import {custTerrain_mesh, eCustTerrain,} from "../../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {gameUiConfig} from "../../../../clientGameConfig/gameUi/gameUiConfig";
import {eCustTerrainUi} from "../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {cConstState} from "../../../../global/baseScope";
import {PixiAlphaFilter} from "../../../component/pixi_AlphaFilter";
import {PixiContainer} from "../../../component/pixi_Container";
import {iGameView_MapProps, PixiMapView} from "../../../componentView/mapView";
import {eUniforms, getMapLightMesh} from "../regions/lightMesh";
import {eCamScopeLevel} from "../../../../clientConstState/view/viewState.enum";

export class GameView_MapLight extends PixiMapView {
    private _watchTimeout;
    protected _changedConfigProp: eCustTerrain | eCustTerrainUi;
    protected _confWatch = [
        ...custTerrain_mesh,
        eCustTerrain.persistence,
        eCustTerrainUi.lighting,
    ];

    constructor(protected _props: iGameView_MapProps) {
        super(_props);
    }

    protected _viewWatch() {
        super._viewWatch();
        this._drawLight();
    }

    protected _viewUnwatch() {
        super._viewUnwatch();
        this._detachLight();
    }

    public renderFn(level, prevLevel) {
        if ((
            // @ts-ignore - no need to take action
            this._changedConfigProp === true ||
            this._confWatch.indexOf(this._changedConfigProp) >= 0
        ) === false) {
            return;
        }

        // @ts-ignore
        const directlyRender = this._changedConfigProp === true || this._changedConfigProp === eCustTerrainUi.lighting;
        if (directlyRender) {
            this.resetView();
            this._drawLight()
        } else {
            this.resetView();
            this._watchTimeout && clearTimeout(this._watchTimeout);
            this._watchTimeout = setTimeout(() => {
                if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.regionSymbol) return;
                this.resetView();
                this._drawLight()
            }, 1000)
        }
    }


    private _drawLight() {
        gameUiConfig.terrainUi[eCustTerrainUi.lighting] ?
            this._attachLight() :
            this._detachLight();
    }


    private _attachLight() {
        if (this.cachedMap.val?.buffer === undefined) return;

        this._detachLight();

        this._attachLightMesh(this._mapLayer);
        this._watchGlobalLight();
    }

    private _detachLight() {
        this._detachLightMesh(this._mapLayer);
        this._unwatchGlobalLight();
    }

    private _lightCont: PixiContainer;
    private _lightMesh: Mesh;

    private _attachLightMesh(targetContainer: PixiContainer) {
        this._lightMesh = getMapLightMesh({
            globalLightType: cConstState.worldState.globalLightType.val,
            globalLightPos: cConstState.worldState.globalLightPos.val,
            mapData: this.cachedMap.val
        });

        this._lightCont = new PixiContainer({name: "light"});
        this._lightCont.addChild(this._lightMesh);
        this._lightCont.filters = [
            getBlendFilter(BLEND_MODES.OVERLAY),
            new PixiAlphaFilter(),
        ];

        targetContainer.addChild(this._lightCont);
    }

    private _detachLightMesh(targetContainer: PixiContainer) {
        if (this._lightCont) {
            targetContainer.removeChild(this._lightCont);
            this._lightCont.destroy();
            delete this._lightCont;

            this._lightMesh.destroy();
            delete this._lightMesh;
        }
    }

    private _watchGlobalLight() {
        cConstState.worldState.globalLightType.watch(this._watchLightType);
        cConstState.worldState.globalLightPos.watch(this._watchLightPos);
    }

    private _unwatchGlobalLight() {
        cConstState.worldState.globalLightType.unwatch(this._watchLightType);
        cConstState.worldState.globalLightPos.unwatch(this._watchLightPos);
    }

    private _watchLightType = (val, valPrev) => {
        if (this._lightCont === undefined) return;
        const uniforms = this._lightMesh.shader.uniforms;
        uniforms[eUniforms.globalLightType] = val;
    }
    private _watchLightPos = (val, valPrev) => {
        if (this._lightCont === undefined) return;
        const uniforms = this._lightMesh.shader.uniforms;
        uniforms[eUniforms.globalLightPos].forEach((p, i) => {
            uniforms[eUniforms.globalLightPos][i] = val[i];
        })
    }
}