game object class difference

ObjectBase - handle object c/s role, can be replicated attributes, attribute typed / encode / decode
# Actor
## anything display or invisible as a game object, support position, rotation, physics. attribute replication
## all the space sensors, binded sensors

# Body
## anything display as a typical physics body in game, support damage and related animation. has health
## tree, building, furniture, door

# Pawn
## anything can be interacted/controlled by BehaviorTree or Player control
## An auto defence tower

# Character
## normally spine object that can behave as individual entity, controlled by behaviorTree or Player control
## all the npc, animal, player
