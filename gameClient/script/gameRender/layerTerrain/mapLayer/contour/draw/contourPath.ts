import {BLEND_MODES,Graphics} from "pixi.js";

import {contourHeatColor} from "../../../../../../../script_base/graph/contour/plotly/render/render.type";
import {tPathAction, tPathActionList} from "../../../../../../../script_base/graph/svg/svgPathToArray";
import {hexStrTo0x, rgbaStrToHex} from "../../../../../../../script_base/util/color";
import {float} from "../../../../../../../script_base/util/number";
import {PixiAlphaFilter} from "../../../../component/pixi_AlphaFilter";
import {PixiContainer} from "../../../../component/pixi_Container";



interface iContourState {
    fillOpacity?: float,
    strokeOpacity?: float,
    size?: float,
    start?: float,
    end?: float,
}

export function drawContourPath(
    container: PixiContainer,
    state: iContourState,
    pathArray: tPathActionList[],
    levels: float[],
) {
    const shouldFill = state.fillOpacity >= 0.1;

    const filter = new PixiAlphaFilter();
    filter.alpha = shouldFill ? state.fillOpacity + 0.1 : (state.strokeOpacity || 1);
    container.filters = [filter];
    container.sortableChildren = true;
    // set batch size for graphics
    pathArray.forEach((pathActionList: tPathActionList, ind) => {
        if (state.start >= state.end) {
            return;
        }
        const percent = getPercent(levels[ind], state.start, state.end);

        const graphics = new Graphics();
        graphics.name = `contourPath_${levels[ind]}`;
        container.addChild(graphics);

        graphics.zIndex = ind;
        graphics.alpha = shouldFill? 1 - state.fillOpacity : 0.2;
        graphics.lineStyle(0.5, 0x000000);

        pathActionList.forEach(function (action) {
            draw(graphics, action, shouldFill, function(){
                graphics.beginFill(hexStrTo0x(getColor(percent)))
            });
        });
    })
}

function draw(graphics: Graphics, action: tPathAction, shouldFill?: boolean, beginFill?) {
    switch (action[0]) {
        case "M":
            shouldFill && beginFill();
            graphics.moveTo(action[1], action[2]);
            break;
        case "L":
            graphics.lineTo(action[1], action[2]);
            break;
        case "C":
            graphics.bezierCurveTo(action[1], action[2], action[3], action[4], action[5], action[6]);
            break;
        case "Q":
            graphics.quadraticCurveTo(action[1], action[2], action[3], action[4]);
            break;
        case "Z":
            shouldFill && graphics.endFill();
            graphics.closePath();
            break;
    }
}

function getColor(percent) {
    let indexOfColor = Math.floor(percent / (1 / contourHeatColor.length));
    indexOfColor = indexOfColor >= contourHeatColor.length ? contourHeatColor.length - 1 : indexOfColor;
    const color = contourHeatColor[indexOfColor];
    return rgbaStrToHex(color);
}

function getPercent(level, min = -1, max = 1) {
    return (level - min) / (max - min);
}