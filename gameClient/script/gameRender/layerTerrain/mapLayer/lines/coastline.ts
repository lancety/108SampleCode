import {Graphics, Point} from "pixi.js";

import {iGameData_Map} from "../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {PixiMapView} from "../../../componentView/mapView";
import {useNoiseOnEdges} from "../util/draw_util";

export function drawCoastlines(container: PixiMapView, map: iGameData_Map, colormap, useNoiseOnEdge: boolean) {
    // ctx.lineCap = 'round';
    // ctx.lineJoin = 'round';
    const castleSide = [];
    for (let i = 0; i < map.mesh.state.numSolidSides; i++) {
        colormap.is_coast_s(map, i) && castleSide.push(i);
    }

    const batchSize = 500;
    for (let f = 0; f < Math.floor(castleSide.length / batchSize) + 1; f++) {

        const graphics = new Graphics();
        graphics.name = "coastlines" + (f * batchSize);
        container.addChild(graphics);
        useNoiseOnEdges(graphics, map, colormap, useNoiseOnEdge, castleSide.slice(f * batchSize, (f + 1) * batchSize));
    }
}