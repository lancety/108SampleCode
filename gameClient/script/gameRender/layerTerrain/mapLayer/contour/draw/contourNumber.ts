import {iGameData_Map} from "../../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";

export function drawContourNumber(ctx, map: iGameData_Map) {
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    for (let i = 0; i < map.mesh.state.numSolidTriangles; i++) {
        const tPos = map.mesh.t_pos(i);
        ctx.fillText(map.buffer.t_elevation[i].toFixed(3), tPos[0], tPos[1]);
    }

    // ctx.fillStyle = "yellow";
    // for (let i = 0; i < map.mesh.numSolidRegions; i++) {
    //     let rPos = map.mesh.r_pos(i);
    //     ctx.fillText(map.r_elevation[i].toFixed(3), rPos[0], rPos[1]);
    // }
}