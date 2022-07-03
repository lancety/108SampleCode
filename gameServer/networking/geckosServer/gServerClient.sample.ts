// todo - check local world list
import {epCustProfile_difficulty, epCustProfile_story} from "../../../gameBase/gameConfig/game/customWorld/custProfile.type";
import {eCustTerrain_planet} from "../../../gameBase/gameConfig/game/customWorld/custTerrain.type";
import {eServerMode, iGameConfig} from "../../../gameBase/gameConfig/game/gameConfig.type";

export const sampleGameConfigWorldList: iGameConfig[] = [{
    "name": "new world 123",
    "serverMode": eServerMode.hosted,
    "serverProfile": {
        url: "http://localhost",
        port: 443,
    },
    "custProfile": {
        "story": {
            "type": epCustProfile_story.survival,
            "img": "/game/img/ui/worldCreate/story_survival.jpg",
            "description": "We were attacked, a landing craft is ready for you, preparing for hard landing..."
        },
        "difficulty": {
            "type": epCustProfile_difficulty.easy,
            "img": "/game/img/ui/worldCreate/diff_easy.jpg",
            "description": "Just like playing in your backyard"
        },
        "creationOwners": {} as any,
    },
    "custTerrain": {
        "seed": 6666,
        "size": 20,
        "persistence": -0.5,
        "side-of-planet": eCustTerrain_planet.north,
        "temp-offset": 1,
        "temp-average": 0,
        "rainfall": 0,
        "river-number": 5,
        "river-variant": 0
    },
    "custContent": {},
    "timestamp": Date.now(),
}];