import {int} from "../../script_base/util/number";

export const addLatencyAndPackagesLoss = (fnc: () => void, miss = true) => {
    const netQuality: int = 0;  // 1 good , 2 mobile, 3 worse
    const rand = Math.random();

    switch (netQuality) {
        case 0:
            fnc();
            break;
        case 1:
            if (miss && rand < 0.01) return;
            setTimeout(() => fnc(),  50 + Math.random() * 15);
            break;
        case 2:
            if (miss && rand < 0.025) return;
            setTimeout(() => fnc(), 150 + Math.random() * 25);
            break;
        case 3:
            if (miss && rand < 0.05) return;
            setTimeout(()=> fnc(), 250 + Math.random() * 50);
            break;
    }
}