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
//        if (density === undefined) density = 0.0001;
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

    function makeWalkerBody(center, staticBody1, staticBody2){
        var width = Math.abs(staticBody1.position.x - staticBody2.position.x);
        var height = 2*Math.abs(center.position.y - staticBody1.position.y);
        var body = Bodies.rectangle(center.position.x, center.position.y, width, height,
                {groupId:1});
        var constriants = [];
        constriants.push(makeConstraint(body, center, 0));
        constriants.push(makeConstraint(body, staticBody1, 0, {x:center.position.x-staticBody1.position.x, y:center.position.y-staticBody1.position.y}));
        constriants.push(makeConstraint(body, staticBody1, 0, {x:center.position.x-staticBody2.position.x, y:center.position.y-staticBody2.position.y}));
        return {body:body, constraints: constriants};
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
        makeWalkerBody: makeWalkerBody,
        setGravity: setGravity,
        rotate: rotate,
        update:update
    };
}
