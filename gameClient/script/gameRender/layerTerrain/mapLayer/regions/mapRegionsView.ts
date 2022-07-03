
import {
    custTerrain_detail,
    custTerrain_mesh,
    eCustTerrain
} from "../../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {gameUiConfig} from "../../../../clientGameConfig/gameUi/gameUiConfig";
import {eCustTerrainUi} from "../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {iGameView_MapProps,PixiMapView} from "../../../componentView/mapView";
import {getMapColor} from "../util/mapColor";
import {drawRegionShape} from "./region";
import {eCamScopeLevel} from "../../../../clientConstState/view/viewState.enum";
import {cConstState} from "../../../../global/baseScope";


export class GameView_MapRegions extends PixiMapView {
    private _watchTimeout;
    protected _changedConfigProp: eCustTerrain | eCustTerrainUi;
    protected _confWatch = [
        ...custTerrain_mesh,
        ...custTerrain_detail,
        eCustTerrainUi.noisyEdges,
        eCustTerrainUi.biomes,
    ];

    constructor(protected _props: iGameView_MapProps) {
        super(_props);
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
        const directlyRender = this._changedConfigProp === true ||
            [
                eCustTerrainUi.noisyEdges,
                eCustTerrainUi.biomes,
            ].indexOf(this._changedConfigProp as any) >= 0;
        if (directlyRender) {
            this.resetView();
            this._draw(gameUiConfig.terrainUi[eCustTerrainUi.noisyEdges])
        } else {
            this.resetView();
            this._draw(false)

            this._watchTimeout && clearTimeout(this._watchTimeout);
            this._watchTimeout = setTimeout(()=> {
                if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.regionSymbol) return;
                if (this.cachedMap.val?.buffer === undefined) return;
                this.resetView();
                this._draw(gameUiConfig.terrainUi[eCustTerrainUi.noisyEdges])
            }, 1000)
        }
    }

    private _draw(noisyEdge: boolean) {
        if (noisyEdge) {
            // console.log("noisy");
            drawRegionShape(this, this.cachedMap.val, getMapColor(), true);
        } else {
            // console.log("simple");
            drawRegionShape(this, this.cachedMap.val, getMapColor(), false);
        }
    }
}