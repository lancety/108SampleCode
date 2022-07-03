/**
 * game object replicate role
 */

export enum eObjectRole {
    none,
    authority,  // server side, or client+server browser
    simulated,  // server data interpolate on client
    autonomous, // server data interpolate on client - affected by player & calc locally, need reconciliation
}