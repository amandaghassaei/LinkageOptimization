/**
 * Created by aghassaei on 1/12/15.
 */

function myWorker(){

    var Engine = Matter.Engine;
    var World = Matter.World;
    var Bodies = Matter.Bodies;
    var Body = Matter.Body;
    var Constraint = Matter.Constraint;

    var world = World.create({gravity:{x:0,y:0}});//no gravity
    var engine = Engine.create(document.body, {world:world});

    var driveCranks = [];
    var allBodies = {};

    var threadNum;//store an id for this thread


//    engine: engine,
//    worldAdd: worldAdd,
//    worldRemove: worldRemove,
//    makeHingeBody: makeHingeBody,
//    makeDriveCrankBody: makeDriveCrankBody,
//    setStatic: setStatic,
//    makeConstraint: makeConstraint,
//    rotate: rotate,
//    update:update

    function _worldAdd(object){
        World.add(engine.world, object);
    }

    function _getBody(id){
        return allBodies[id];
    }

    function _makeCircularBody(position, radius){
        var body = Bodies.circle(position.x, position.y, radius,
            {friction:0, frictionAir:0, groupId:1});//things with the same groupId cannot collide
        _worldAdd(body);
        return body;
    }

    function _return(data){
        postMessage({data:data, threadNum:threadNum});
    }

    self.onmessage = function(e) {
        var data = e.data;

        if (data.url) {
            var url = data.url;
            var index = url.indexOf('main.html');//url of landing page
            if (index != -1) {
              url = url.substring(0, index);
            }
            //load all scripts
            importScripts(url + 'dependencies/physics/matter-0.8.0.min.js');
        } else if (data.worldAdd){

        } else if (data.worldRemove){

        } else if (data.makeHingeBody){
            var constraint = Constraint.create({bodyA:_getBody(bodyAId), bodyB:bodyBId, length:length, stiffness:1, pointA:pointA});
            var hinge = data.makeHingeBody;

//            if (hinge.static)

        } else if (data.setStatic){
            Body.setStatic(_getBody(data.setStatic.id), data.setStatic.isStatic);
        } else if (data.makeDriveCrankBody){//{position, radius}
            var crankBody =  _makeCircularBody(data.makeDriveCrankBody.position, data.makeDriveCrankBody.radius);
            driveCranks.push(crankBody);
            postMessage(crankBody.id);
        } else if (data.makeLink){//{bodyAId, bodyBId, length}
            var link = data.makeLink;
            var constraint = Constraint.create({
                bodyA:_getBody(link.bodyAId),
                bodyB:_getBody(link.bodyBId),
                length:link.length,
                stiffness:1});
            _worldAdd(constraint);
            postMessage(constraint.id);
        return constraint;
        } else if (data.update){
            for (var i=0;i<driveCranks.length;i++){
                Body.rotate(driveCranks[i], 0.02);//0.02 thetaStep
            }
            Engine.update(engine, 0.1);//0.1 delta ms
        } else console.log("no message " + JSON.stringify(data));
    };
}
