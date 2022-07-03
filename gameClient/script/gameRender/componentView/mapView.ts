import {eCustTerrain} from "../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {Logger} from "../../../../script_base/util/logger";
import {eCustTerrainUi} from "../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {ePixiDebug} from "../../global/pixiDebug";
import {GameLayer_Map} from "../layerTerrain/mapLayer/mapLayer";
import {iGameViewBaseProps,PixiBaseView} from "./baseView";

export interface iGameView_MapProps extends iGameViewBaseProps {

}

export class PixiMapView extends PixiBaseView {
    protected _logger = new Logger(ePixiDebug.vMap_common);
    protected _changedConfigProp: eCustTerrain | eCustTerrainUi | boolean;
    protected _confWatch;

    get _mapLayer(): GameLayer_Map {
        return this.parent as GameLayer_Map
    }

    set confChanged(prop: boolean | eCustTerrain | eCustTerrainUi) {
        this._changedConfigProp = prop;
    }

    constructor(_props: iGameView_MapProps) {
        super(_props);
    }
}