import {
    custTerrain_detail,
    custTerrain_mesh,
    eCustTerrain
} from "../../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {gameUiConfig} from "../../../../clientGameConfig/gameUi/gameUiConfig";
import {eCustTerrainUi} from "../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {iGameView_MapProps,PixiMapView} from "../../../componentView/mapView";
import {getMapColor} from "../util/mapColor";
import {drawCoastlines} from "./coastline";
import {drawRivers} from "./river";
import {eCamScopeLevel} from "../../../../clientConstState/view/viewState.enum";
import {cConstState} from "../../../../global/baseScope";

export class GameView_MapLines extends PixiMapView {
    private _watchTimeout;
    protected _changedConfigProp: eCustTerrain | eCustTerrainUi;
    protected _confWatch = [
        ...custTerrain_mesh,
        ...custTerrain_detail,
        eCustTerrain.persistence,
        eCustTerrainUi.noisyEdges,
    ];

    constructor(protected _props: iGameView_MapProps) {
        super(_props);
    }

    public renderFn(level, prevLevel) {
        // it is ok to simply resetView based on val flag if there is no external PIXI obj binding.
        // E.G. PIXI object created from here, and bind to parent layer or other sibling view
        if (gameUiConfig.terrainUiWatch[eCustTerrainUi.noisyEdges].val !== true) {
            this.resetView();
        }

        if ((
            // @ts-ignore - no need to take action
            this._changedConfigProp === true ||
            this._confWatch.indexOf(this._changedConfigProp) >= 0
        ) === false) {
            return;
        }

        // @ts-ignore
        const directRender = this._changedConfigProp === true ||
            [eCustTerrainUi.noisyEdges].indexOf(this._changedConfigProp as any) >= 0;
        if (directRender === true) {
            this.resetView();
            this._draw(gameUiConfig.terrainUiWatch[eCustTerrainUi.noisyEdges].val)
        } else {
            this.resetView();
            this._draw(false)

            this._watchTimeout && clearTimeout(this._watchTimeout);
            this._watchTimeout = setTimeout(()=> {
                if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.regionSymbol) return;
                if (this.cachedMap.val?.buffer === undefined) return;
                this.resetView();
                this._draw(gameUiConfig.terrainUiWatch[eCustTerrainUi.noisyEdges].val)
            }, 1000)
        }
    }

    private _draw(noisyEdge: boolean) {
        const map = this.cachedMap.val;
        if (map.buffer === undefined) return;
        drawCoastlines(this, map, getMapColor(), noisyEdge)
        drawRivers(this, map, getMapColor(), noisyEdge)
    }
}