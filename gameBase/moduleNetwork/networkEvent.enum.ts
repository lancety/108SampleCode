

export enum eNetEvent {
    // common event
    // audio = "a",
    // video = "v",


    characterVerify = "140",
    playing = "150",    // once user taking control and start generating inputs to server

    serverError = "400",
    authError = "401",
    acceptError = "406",

    // send out from client
    worldList = "1001",
    worldCreate= "2001",

    // send out from server
    controllableCreatureIndex = "4001",

    tcpRaw = "9999",
}