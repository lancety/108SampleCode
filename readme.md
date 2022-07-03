# Summary
This repository includes sample code of galaxy108 web game engine.

# Coverage
## networking module
 - gameBase/modelNetwork
   - abstract client , server and server client channel api
 - gameClient/networking/geckosClient
   - client side extension for geckos.io network framework
 - gameServer/networking/geckosServer
   - server side extension for geckos.io network framework
 - gameClient/networking/browserClient & browserCerser
   - client and server combination for browser mode


## object module
 - gameBase/moduleObject
   - defines object instance used by game AI engine and physics Engine
   - defined object atttributes


## AI engine
 - workerAi/_class/_actors
   - AI actor management API
 - workerAi/_class/actorClass
   - AI actor class definitions
 - workerAi/_component
   - Actor feature components
   - physicsComponent: adding physics attributes
   - spineComponent: adding spine resource attributes
   - tickComponent
     - behaviorTreeComponent: run behavior tree engine
     - ActorActionComponent: process actor action
 - workerAi/_engine
   - AI Engine, AI Runner & AI Events

## Client Side
 - gameClient/gameRender/batchRender
   - Custom Pixi.js batch render, allowing shader vertex fragment with custom uniforms and attributes
 - gameClient/gameRender/componentView
 - gameClient/gameRender/layerTerrain
   - game have multi layers, such as undergroundLayer / terrainLayer / skyLayer.  
   - each layer has a manager
   - each layer have multi level of views
   - 'mayLayer' includes all render-able views when player generating game map


## Server Side
 - gameServer/networking
   - as explained above in network section