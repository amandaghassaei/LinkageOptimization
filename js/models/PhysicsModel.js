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

    function _makeCircularBody(position, radius){
        var body = Bodies.circle(position.x, position.y, radius,
            {friction:0, frictionAir:0, groupId:1});//things with the same groupId cannot collide
        worldAdd(body);
        return body;
    }

    function makeHingeBody(position){
        return _makeCircularBody(position, 1);//rad of 1 for hinges
        // (radius doesn't really matter since we are not doing collision detection)
    }

    function makeDriveCrankBody(position, radius){
        return _makeCircularBody(position, radius);
    }

    function setStatic(object, isStatic){
        Body.setStatic(object, isStatic);
    }

    function makeConstraint(bodyA, bodyB, length, pointA){//pointA only passed in for driveCrank
        var constraint = Constraint.create({bodyA:bodyA, bodyB:bodyB, length:length, stiffness:1, pointA:pointA});
        worldAdd(constraint);
        return constraint;
    }

    function rotate(object, thetaStep){
        Body.rotate(object, thetaStep);
    }

    function run(){
        Engine.run(engine);
    }

    return {//return public methods and properties
        engine: engine,
        worldAdd: worldAdd,
        worldRemove: worldRemove,
        makeHingeBody: makeHingeBody,
        makeDriveCrankBody: makeDriveCrankBody,
        setStatic: setStatic,
        makeConstraint: makeConstraint,
        rotate: rotate,
        run:run
    };
}
