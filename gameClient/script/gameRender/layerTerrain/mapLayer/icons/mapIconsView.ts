import {
    custTerrain_detail,
    custTerrain_mesh,
    eCustTerrain
} from "../../../../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {random} from "../../../../../../script_base/util/random";
import {iGameView_MapProps,PixiMapView} from "../../../componentView/mapView";
import {drawRegionIcons} from "./regionIcon";
import makeRandInt = random.makeRandInt;
import {gameConfig} from "../../../../../../gameBase/gameConfig/game/gameConfig";
import {gameUiConfig} from "../../../../clientGameConfig/gameUi/gameUiConfig";
import {eCustTerrainUi} from "../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {assetTexture} from "../../../../gameAsset/assetTexture";
import {enAssetTexture} from "../../../../gameAsset/assetTexture.enum";

export class GameView_MapIcons extends PixiMapView {
    protected _changedConfigProp: eCustTerrainUi;
    protected _confWatch = [
        ...custTerrain_mesh,
        ...custTerrain_detail,
        eCustTerrainUi.icons,
    ];

    constructor(protected _props: iGameView_MapProps) {
        super(_props);
    }

    public renderFn(level, prevLevel) {
        // it is ok to simply resetView based on val flag if there is no external PIXI obj binding.
        // E.G. PIXI object created from here, and bind to parent layer or other sibling view
        if (gameUiConfig.terrainUiWatch[eCustTerrainUi.icons].val !== true) {
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

        drawRegionIcons(this, this.cachedMap.val, assetTexture[enAssetTexture.iconBiome], makeRandInt(gameConfig.custTerrainWatch[eCustTerrain.riverVariant].val))
    }
}