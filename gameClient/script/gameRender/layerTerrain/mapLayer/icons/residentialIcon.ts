import {vector2} from "../../../../../../script_base/@type/graph";
import {float} from "../../../../../../script_base/util/number";
import {assetTexture} from "../../../../gameAsset/assetTexture";
import {enAssetTexture} from "../../../../gameAsset/assetTexture.enum";
import {Sprite} from "pixi.js";

export function makeResidentialAreaIcon(
    textureName: string, pos: vector2, radius: float,
) {
    const texture = assetTexture[enAssetTexture.iconResidential][textureName];
    const sprite = new Sprite(texture);
    sprite.x = pos[0];
    sprite.y = pos[1];
    sprite.anchor.set(0.5, 0.5);
    sprite.width = radius;
    sprite.height = radius;
    sprite.interactive = true;
    sprite.buttonMode = true;
    return sprite;
}