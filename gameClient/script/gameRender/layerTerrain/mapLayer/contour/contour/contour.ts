import {ContourManager} from "../../../../../../../script_base/graph/contour/plotly";
import {
    eContourConfig,
    iContourConfig,
    iContourManagerConfig
} from "../../../../../../../script_base/graph/contour/plotly/index.type";
import {gameUiConfig} from "../../../../../clientGameConfig/gameUi/gameUiConfig";
import {eCustTerrainUi, iTerrainUiConfigWatch} from "../../../../../clientGameConfig/gameUi/terrain/terrainUiConfig.type";
import {cConstState} from "../../../../../global/baseScope";
import {mapElevationGrid} from "./mapElevationGrid";


function _newContourManagerConfig(): iContourManagerConfig {
    const terrainUiConfigWatch: iTerrainUiConfigWatch = gameUiConfig.terrainUiWatch;
    const {cachedMap} = cConstState.terrainState;
    const newContourConfig: iContourConfig = {
        // type: string,
        [eContourConfig.start]: terrainUiConfigWatch[eCustTerrainUi.con_start].val,
        [eContourConfig.end]: terrainUiConfigWatch[eCustTerrainUi.con_end].val,
        [eContourConfig.size]: terrainUiConfigWatch[eCustTerrainUi.con_size].val,
        [eContourConfig.smoothing]: terrainUiConfigWatch[eCustTerrainUi.con_smooth].val,
        [eContourConfig.fillOpacity]: terrainUiConfigWatch[eCustTerrainUi.con_fillOpacity].val,
    };

    return {
        size: cachedMap.val.mesh.state.meshSize,
        contourConfig: Object.assign({
            [eContourConfig.type]: "levels",
            [eContourConfig.start]: -1,
            [eContourConfig.end]: 1,
            [eContourConfig.size]: 0.025,
            [eContourConfig.fillOpacity]: 0.25,
            [eContourConfig.smoothing]: 2,
        }, newContourConfig),
        dataSource: mapElevationGrid
    } as iContourManagerConfig;
}

let map_contourManager;
export function updateMapContour() {
    const newConfig = _newContourManagerConfig();
    map_contourManager = map_contourManager || new ContourManager(newConfig);
    map_contourManager.updateSource(newConfig);
    map_contourManager.updateContourGraphics();
}
export function getMapContourMag() {
    return map_contourManager;
}