import {vector2} from "../../../../script_base/@type/graph";
import {float} from "../../../../script_base/util/number";
import {cConstState} from "../../global/baseScope";
import {PixiGameViewLayer} from "../component/pixi_GameLayer";
import {iPixiGameLayerMagProps, PixiGameLayerMag} from "../component/pixi_GameLayerManager";
import {GameLayer_MapDraft} from "./mapDraftLayer/mapDraftLayer";
import {GameLayer_Map} from "./mapLayer/mapLayer";
import {GameLayer_Region} from "./regionLayer/regionLayer";
import {terrainContentUpdater} from "./terrainContentUpdater";
import {epTerrainLayer} from "./terrainLayerMag.enum";

interface iTerrainLayerMagProps extends iPixiGameLayerMagProps {

}


export class TerrainLayerMag extends PixiGameLayerMag {
    protected _layersConfig = {
        [epTerrainLayer.mapDraft]: GameLayer_MapDraft,
        [epTerrainLayer.map]: GameLayer_Map,
        [epTerrainLayer.region]: GameLayer_Region,
    };

    public layers = {} as { [key in epTerrainLayer]: PixiGameViewLayer };

    constructor(protected _props: iTerrainLayerMagProps) {
        super(_props);
        this._initLayers();
        terrainContentUpdater(this.layers);

        cConstState.terrainViewState.viewMeshScale.watch((newScale: vector2<float>, oldScale: vector2<float>) => {
            Object.values(this.layers).forEach((layer: PixiGameViewLayer) => {
                layer.scale.set(...newScale);
            });
        });
    }
}