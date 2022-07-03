import {
    custTerrain_detail,
    custTerrain_mesh,
    eCustTerrain,
} from "../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {terrainConfUtil} from "../../../../../gameBase/gameConfig/game/customWorld/custTerrain.util";
import {gameConfig} from "../../../../../gameBase/gameConfig/game/gameConfig";
import {Logger} from "../../../../../script_base/util/logger";
import {eCamScopeLevel} from "../../../clientConstState/view/viewState.enum";
import {eCustTerrainUi} from "../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {cConstFactory, cConstState} from "../../../global/baseScope";
import {ePixiDebug} from "../../../global/pixiDebug";
import {iPixiGameLayerProps, PixiGameViewLayer} from "../../component/pixi_GameLayer";
import {PixiMapView} from "../../componentView/mapView";
import {GameView_MapContour} from "./contour/mapContourView";
import {GameView_MapIcons} from "./icons/mapIconsView";
import {GameView_MapLight} from "./light/mapLightView";
import {GameView_MapLines} from "./lines/mapLinesView";
import {epMapViewGroup, epMapViewGroupOrderedKey} from "./mapLayer.type";
import {GameView_MapRegions} from "./regions/mapRegionsView";

type iGameLayerProps_Map = iPixiGameLayerProps

const viewMap = {
    [epMapViewGroup.regions]: GameView_MapRegions,
    [epMapViewGroup.contour]: GameView_MapContour,
    [epMapViewGroup.lines]: GameView_MapLines,
    [epMapViewGroup.icons]: GameView_MapIcons,
    [epMapViewGroup.light]: GameView_MapLight,
};

export class GameLayer_Map extends PixiGameViewLayer {
    readonly _logger = new Logger(ePixiDebug.terrainLayer_map);

    protected _viewGroupConfig = {};

    public views: { [containerName: string]: PixiMapView } = {} as any;

    constructor(protected _props: iGameLayerProps_Map) {
        super(_props);

        epMapViewGroupOrderedKey.forEach(view => {
            this._viewGroupConfig[view] = viewMap[view];
        })

        this._initAll();
        this._updateMap(eCustTerrain.seed);  // call once so map is generated

//         this.filters = [new Filter(undefined, `
// precision highp float;
//
// varying vec2 vTextureCoord;
//
// uniform sampler2D uSampler;
// uniform vec4 inputSize;
// uniform vec4 outputFrame;
//
// vec2 warpAmount = vec2( 2.0 / 4.0, 2.0 / 4.0 );
//
// void main() {
//     vec2 pos = vTextureCoord * 2.0 - 1.0;
//     pos *= vec2(
//         1.0 + (pos.y * pos.y) * warpAmount.x,
//         1.0 + (pos.x * pos.x) * warpAmount.y
//     );
//     pos = pos * 0.5 + 0.5;
//
//     gl_FragColor = texture2D( uSampler, pos );
// }
//         `)];
    }

    protected _initAll() {
        super._initAll();
    }

    protected _watchCamScopeLevel(level: eCamScopeLevel, prevLevel: eCamScopeLevel) {
        if( level > eCamScopeLevel.regionSymbol) {
            if (prevLevel <= eCamScopeLevel.regionSymbol) {
                this._initAll();
                Object.keys(epMapViewGroup).forEach(viewName => {
                    this.views[viewName].confChanged = true;
                    this.views[viewName].renderFn(
                        cConstState.viewState.camScopeLevel.val,
                        cConstState.viewState.camScopeLevel.valPrev,
                    )
                })
            }
        } else if (prevLevel > eCamScopeLevel.regionSymbol && level <= eCamScopeLevel.regionSymbol) {
            this._clearAll()
        }
    }

    protected async _watchMapConf(confKey) {
        if (gameConfig.isExistWorld) {
            return;
        }

        await this._updateMap(confKey, true);
    }

    // when map detail regenerated
    protected async _watchMapUiConf(confKey, val, valPrev) {
        await this._updateMap(confKey);
    }

    private async _updateMesh() {
        if (terrainConfUtil.matchTerrainConfigCache(gameConfig.custTerrainWatch, this.cachedMap, true)) {
            return;
        }
        await cConstFactory.mapMag.updateMesh();
        this._logger.log("updated mesh");
    }

    private async _updateMapDetail() {
        if (terrainConfUtil.matchTerrainConfigCache(gameConfig.custTerrainWatch, this.cachedMap)) {
            return;
        }
        await cConstFactory.mapMag.updateMapDetail();
        this._logger.log("updated map detail");
    }

    /**
     * giving changed config or without, to update map layer views;
     * @param {eCustTerrain | eCustTerrainUi | boolean} updatedConfig or true (force 'rc')
     * @param reset
     * @returns {Promise<void>}
     * @private
     */
    private async _updateMap(updatedConfig?: eCustTerrain | eCustTerrainUi | boolean, reset?: boolean) {
        await this._updateMesh();
        await this._updateMapDetail();

        if (cConstState.viewState.camScopeLevel.val <= eCamScopeLevel.regionSymbol) return;

        Object.keys(epMapViewGroup).forEach(viewName => {
            const view = this.views[viewName]
            reset && view.resetView();
            view.confChanged = updatedConfig;
            view.renderFn(eCamScopeLevel.world, eCamScopeLevel.world)
        })
    }
}