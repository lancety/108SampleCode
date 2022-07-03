import * as React from "react";

import {Alert} from "../../../script_base/component/popup/alert";

export enum eGeckosResState {
    init,
    loading,
    loaded,
    failed,
    failedAuth,
    empty,
    timeout,
}

export function serverConnectivityAlert(resState: eGeckosResState, callback: (e, extra?) => void) {
    let alert: JSX.Element;

    const alertConfigNeedInteract = {
        message: undefined,
        fnBtn: "close",
        fnCallback: callback
    };

    switch (resState) {
        case eGeckosResState.init:
            break;
        case eGeckosResState.loading:
            alert = <Alert config={{message: "Connecting server..."}}/>;
            break;
        case eGeckosResState.loaded:

            break;
        case eGeckosResState.failed:
            alertConfigNeedInteract.message = "Failed, either server isn't running or sign in status is invalid";
            alert = <Alert config={alertConfigNeedInteract}/>;
            break;
        case eGeckosResState.failedAuth:
            alertConfigNeedInteract.message = "Failed, please check sign in status";
            alert = <Alert config={alertConfigNeedInteract} />
            break;
        case eGeckosResState.empty:
            alertConfigNeedInteract.message = "No saved world on server";
            alert = <Alert config={alertConfigNeedInteract}/>;
            break;
        case eGeckosResState.timeout:
            alertConfigNeedInteract.message = "server process timeout";
            alert = <Alert config={alertConfigNeedInteract}/>;
            break;
    }

    return alert;
}