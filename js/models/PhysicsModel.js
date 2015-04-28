/**
 * Created by fab on 3/21/15.
 */


function PhysicsModel(){

    var Engine = Matter.Engine;
    var World = Matter.World;
    var Bodies = Matter.Bodies;
    var Body = Matter.Body;
    var Constraint = Matter.Constraint;

    var world = World.create({gravity:{x:0,y:0}});//no gravity
    var engine = Engine.create(document.body, {world:world});

    function worldAdd(object){
        World.add(engine.world, object);
    }

    function worldRemove(object){
        World.remove(engine.world, object);
    }

    function _makeCircularBody(position, radius, friction){
        if (friction === undefined) friction = 0;
        var body = Bodies.circle(position.x, position.y, 1,
            {groupId:1, friction:friction});//things with the same groupId cannot collide
        Matter.Body.scale (body, radius, radius);
        worldAdd(body);
        return body;
    }

    function makeHingeBody(position, radius){
        if (radius === undefined || radius == 0) radius = 1;
        return _makeCircularBody(position, radius, globals.appState.get("friction"));
    }

    function makeTerrain(terrainType){
        if (terrainType == "flat"){
            var body = Bodies.rectangle(0, -5, 5000, 10,
                {groupId:2, friction:1});
            Body.setStatic(body, true);
            return body;
        } else console.warn("not done with this yet");
    }

    function makeDriveCrankBody(position, radius){
        return _makeCircularBody(position, radius);
    }

    function scaleBody(body, scale){
        Matter.Body.scale (body, scale, scale);
    }

    function setStatic(object, isStatic){
        Body.setStatic(object, isStatic);
    }

    function makeConstraint(bodyA, bodyB, length, pointA){//pointA only passed in for driveCrank
        var constraint = Constraint.create({bodyA:bodyA, bodyB:bodyB, length:length, stiffness:1, pointA:pointA});
        worldAdd(constraint);
        return constraint;
    }

    function setGravity(state){
        if (state) engine.world.gravity.y = -10000;//todo mess around with density, also links have no mass
        else engine.world.gravity.y = 0;
    }

    function rotate(object, angle){
        Body.rotate(object, angle - object.angle);
    }

    function update(){
        Engine.update(engine, 0.1);
    }

    return {//return public methods and properties
        engine: engine,
        worldAdd: worldAdd,
        worldRemove: worldRemove,
        makeHingeBody: makeHingeBody,
        makeDriveCrankBody: makeDriveCrankBody,
        makeTerrain: makeTerrain,
        scaleBody: scaleBody,
        setStatic: setStatic,
        makeConstraint: makeConstraint,
        setGravity: setGravity,
        rotate: rotate,
        update:update
    };
}
