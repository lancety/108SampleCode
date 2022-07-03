import {Graphics, Point} from "pixi.js";

import {iGameData_Map} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {int} from "../../../../../../script_base/util/number";
import {PixiContainer} from "../../../component/pixi_Container";
import {useNoiseOnEdges} from "../util/draw_util";


export function drawRivers(container: PixiContainer, map: iGameData_Map, colormap, useNoiseOnEdge: boolean) {
    const riverSide: int[] = [];
    for (let i = 0; i < map.mesh.state.numSolidSides; i++) {
        colormap.is_river_s(map, i) && riverSide.push(i);
    }

    const batchSize = 500;
    for (let f = 0; f < Math.floor(riverSide.length / batchSize) + 1; f++) {
        const graphics = new Graphics();
        graphics.name = "rivers" + (f * batchSize);
        container.addChild(graphics);

        useNoiseOnEdges(graphics, map, colormap, useNoiseOnEdge, riverSide.slice(f * batchSize, (f + 1) * batchSize));
    }
}