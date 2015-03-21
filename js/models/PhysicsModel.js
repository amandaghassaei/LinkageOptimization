/**
 * Created by fab on 3/21/15.
 */


function PhysicsModel(){

    var Engine = Matter.Engine;
    var World = Matter.World;
    var Bodies = Matter.Bodies;
    var Body = Matter.Body;

    var world = World.create({gravity:{x:0,y:0}});//no gravity
    var engine = Engine.create(document.body, {world:world});

    function worldAdd(object){
        World.add(engine.world, object);
    }

    function worldRemove(object){
        World.remove(engine.world, object);
    }

    function makeHingeBody(position){
        var body = Bodies.circle(position.x, position.y, 1);//x, y, rad
        worldAdd(body);
        return body;
    }

    function setStatic(object, isStatic){
        Body.setStatic(object, isStatic);
    }

    function run(){
        Engine.run(engine);
    }

    return {
        engine: engine,
        worldAdd: worldAdd,
        worldRemove: worldRemove,
        makeHingeBody: makeHingeBody,
        setStatic: setStatic,
        run:run
    };
}
