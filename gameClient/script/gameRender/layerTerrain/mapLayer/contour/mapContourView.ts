import {custTerrain_mesh, eCustTerrain,} from "../../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {gameUiConfig} from "../../../../clientGameConfig/gameUi/gameUiConfig";
import {custTerrainUi_contour, eCustTerrainUi} from "../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {iGameView_MapProps,PixiMapView} from "../../../componentView/mapView";
import {getMapContourMag, updateMapContour} from "./contour/contour";
import {makeMapElevationGridData} from "./contour/mapElevationGrid";
import {drawContourPath} from "./draw/contourPath";
import {eCamScopeLevel} from "../../../../clientConstState/view/viewState.enum";
import {cConstState} from "../../../../global/baseScope";

export class GameView_MapContour extends PixiMapView {
    private _watchTimeout;
    private _watchTimeoutNeedMakeContourData: boolean;
    protected _changedConfigProp: eCustTerrainUi;
    protected _confWatch = [
        ...custTerrain_mesh,
        eCustTerrain.persistence,
        ...custTerrainUi_contour,
    ];

    constructor(protected _props: iGameView_MapProps) {
        super(_props);
    }

    public renderFn(level, prevLevel) {
        if (gameUiConfig.terrainUiWatch[eCustTerrainUi.con_show].val !== true) {
            this.resetView();
            return;
        }

        if ((
            // @ts-ignore - no need to take action
            this._changedConfigProp === true ||
            this._confWatch.indexOf(this._changedConfigProp) >= 0
        ) === false) {
            return;
        }

        if (this._watchTimeoutNeedMakeContourData !== true) {
            this._watchTimeoutNeedMakeContourData = this._changedConfigProp && this._changedConfigProp !== eCustTerrainUi.con_fillOpacity;
        }

        if (
            // @ts-ignore
            this._changedConfigProp === true  ||
            custTerrainUi_contour.indexOf(this._changedConfigProp as any) >= 0
        ) {
            this.resetView();
            this._drawContour();
        } else {
            // map mesh changed - need to delay display
            this._watchTimeout && clearTimeout(this._watchTimeout);
            this._watchTimeout = setTimeout(()=> {
                if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.regionSymbol) return;
                if (this.cachedMap.val.buffer === undefined) return;
                this.resetView();
                this._drawContour();
            }, 1000);
        }
    }

    private _drawContour() {
        if (this._watchTimeoutNeedMakeContourData) {
            makeMapElevationGridData();
            updateMapContour();
            this._logger.log("updated contour");
        }

        const contourMag = getMapContourMag();
        if (contourMag === undefined) {
            return; // todo
        }
        drawContourPath(
            this,
            {
                fillOpacity: gameUiConfig.terrainUiWatch[eCustTerrainUi.con_fillOpacity].val,
                size: gameUiConfig.terrainUiWatch[eCustTerrainUi.con_size].val,
                start: gameUiConfig.terrainUiWatch[eCustTerrainUi.con_start].val,
                end: gameUiConfig.terrainUiWatch[eCustTerrainUi.con_end].val,
            },
            contourMag.pathActionList,
            contourMag.pathinfo.map(pathinfo => pathinfo.level)
        );
    }
}