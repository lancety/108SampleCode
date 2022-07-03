import {iGameData_Map} from "../../../../../../../gameBase/gameConstFactory/terrain/map/map.abs";
import {iMapData_elevationGrid} from "../../../../../../../gameBase/gameConstFactory/terrain/map/map.type";
import {convertColumnData} from "../../../../../../../script_base/graph/contour/plotly/generator/pathinfo/calc_xyz";
import {cConstState} from "../../../../../global/baseScope";

// todo - this should be done in worker

export const mapElevationGrid = {} as iMapData_elevationGrid;
export function makeMapElevationGridData() {
    const grid = _asset_elevation_grid(cConstState.terrainState.cachedMap.val);
    // this.buffer.t_elevation_grid_x = grid.x;
    // this.buffer.t_elevation_grid_y = grid.y;
    // this.buffer.t_elevation_grid_z = grid.z;


    const structuredZ = [];
    const rowLength = grid.x.length;
    for (let y = 0; y < grid.y.length; y++) {
        structuredZ.push(grid.z.slice(rowLength * y, rowLength * (y + 1)));
    }

    mapElevationGrid.x = Array.from(grid.x);
    mapElevationGrid.y = Array.from(grid.y);
    mapElevationGrid.z = structuredZ;
}

function _offsetNumber(num, spacing) {
    if ((num % spacing) < spacing / 2) {
        num = num - num % spacing;
    } else {
        num = num - num % spacing + spacing;
    }

    return num;
}

function _asset_elevation_grid (map: iGameData_Map) {
    const x = [], y = [], z = [];
    for (let i = 0; i < map.mesh.state.numTriangles; i++) {
        const tPos = map.mesh.t_pos(i);
        const spacing = map.mesh.state.spacing / 2;
        x.push(_offsetNumber(tPos[0], spacing));
        y.push(_offsetNumber(map.mesh.state.meshSize[1] - tPos[1], spacing));
        z.push(map.buffer.t_elevation[i]);
    }

    const grid = convertColumnData(x, y, z);

    return {
        x: new Float32Array(grid.x),
        y: new Float32Array(grid.y),
        z: new Float32Array(grid.z.flat(2)),
    };
}