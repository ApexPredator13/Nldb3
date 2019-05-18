import { GameplayEventType } from "./gameplay-event-type";

type callbackFunction = (id: string, eventType: GameplayEventType, resourceNumber: 1 | 2 | 3, show: string) => any;
type callbackFunctionRegistration = { dropdownId: string, eventType: GameplayEventType, resourceNumber: 1 | 2 | 3, hideAllExcept: string };

const dropdownIdIsRegistered = (id: string, data: Map<callbackFunctionRegistration, callbackFunction>): boolean => {
    for (const key of data.keys()) {
        if (key.dropdownId === id) {
            return true;
        } else {
            continue;
        }
    }
    return false;
}

const getCallbackFunction = (id: string, data: Map<callbackFunctionRegistration, callbackFunction>): { registration: callbackFunctionRegistration, function: callbackFunction } | undefined => {
    for (const key of data.keys()) {
        if (key.dropdownId === id) {
            const result = data.get(key);
            if (result) {
                return { registration: key, function: result };
            }
        }
    }
    return undefined;
}

export {
    callbackFunction,
    callbackFunctionRegistration,
    dropdownIdIsRegistered,
    getCallbackFunction
}