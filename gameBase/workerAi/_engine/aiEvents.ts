import {jsonCopy} from "../../../script_base/util/json";

export class AiEvents {
    static on(object, eventNames, callback) {
        const names = eventNames.split(' ');
        let name;

        for (let i = 0; i < names.length; i++) {
            name = names[i];
            object.events = object.events || {};
            object.events[name] = object.events[name] || [];
            object.events[name].push(callback);
        }

        return callback;
    }

    static off(object, eventNames, callback) {
        if (!eventNames) {
            object.events = {};
            return;
        }

        // handle Events.off(object, callback)
        if (typeof eventNames === 'function') {
            callback = eventNames;
            eventNames = Object.keys(object.events).join(' ');
        }

        const names = eventNames.split(' ');

        for (let i = 0; i < names.length; i++) {
            const callbacks = object.events[names[i]],
                newCallbacks = [];

            if (callback && callbacks) {
                for (let j = 0; j < callbacks.length; j++) {
                    if (callbacks[j] !== callback)
                        newCallbacks.push(callbacks[j]);
                }
            }

            object.events[names[i]] = newCallbacks;
        }
    }

    static async trigger(object, eventNames, event) {
        let names,
            name,
            callbacks,
            eventClone;

        const events = object.events;

        if (events && Object.keys(events).length > 0) {
            if (!event)
                event = {};

            names = eventNames.split(' ');

            for (let i = 0; i < names.length; i++) {
                name = names[i];
                callbacks = events[name];

                if (callbacks) {
                    eventClone = jsonCopy(event);
                    eventClone.name = name;
                    eventClone.source = object;

                    for (let j = 0; j < callbacks.length; j++) {
                        await callbacks[j].apply(object, [eventClone]);
                    }
                }
            }
        }
    }
}