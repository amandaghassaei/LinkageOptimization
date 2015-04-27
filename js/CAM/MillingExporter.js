/**
 * Created by aghassaei on 4/27/15.
 */


MillingExporter = Backbone.Model.extend({

    defaults: {
        fillThreeBar: true,
        units: "inches",
        linkWidth:3,
        dowelDiameter: 0.25,
        stockThickness: 0.5,
        pressFitTolerance:0.03,
        hingeTolerance:0.08
    },

    initialize: function(){

    },

    createVectorPathsForLinkage: function(json){

        //find triangles
//        var tri012 = [];
//        var tri45 = [];
//        _.each(json.links, function(link){//{0,1,2} and {3, 4, opp4}
//            if ((link.hinges[0] == 0 || link.hinges[0] == 1 || link.hinges[0] == 2) && (link.hinges[1] == 0 || link.hinges[1] == 1 || link.hinges[1] == 2)){
//                tri012.push(link.length);
//            } else if ((link.hinges[0] == 4 || link.hinges[0] == 5) && (link.hinges[1] == 4 || link.hinges[1] == 5)){
//                tri45.push(link.length);
//            }
//        });

        //solve triangles
        //(for now just grab positions)
        var tri012Geometry = new THREE.Geometry();
        _.each([0,1,2,0], function(num){
            tri012Geometry.vertices.push(new THREE.Vector3(json.hinges[num].position.x, json.hinges[num].position.y, 0));
        });
        var tri012 = new THREE.Line(tri012Geometry);
        globals.three.sceneAdd(tri012);


        globals.three.sceneAdd(this._makeOutlinePath(json.hinges, [0, 1, 2, 0], this.get("linkWidth")/2.0));


    },


    _makeOutlinePath: function(hinges, indices, offset){
        var geometry = new THREE.Geometry();
        var vertices = [];
        for (var i=0;i<indices.length-1;i++){
            var theta = Math.PI/2 + this._getAngle(hinges[indices[i]].position, hinges[indices[i+1]].position);
            var positionOffset = {x:offset*Math.cos(theta), y:offset*Math.sin(theta)};
            vertices.push(new THREE.Vector3(hinges[indices[i]].position.x+positionOffset.x, hinges[indices[i]].position.y+positionOffset.y, 0));
            vertices.push(new THREE.Vector3(hinges[indices[i+1]].position.x+positionOffset.x, hinges[indices[i+1]].position.y+positionOffset.y, 0));

        }
        for (var i=1;i<vertices.length;i+=2){
            geometry.vertices.push(vertices[i-1]);
            geometry.vertices.push(vertices[i]);
            var centerPoint = hinges[indices[Math.floor(i/2)+1]].position;
            var startingTheta = this._getAngle(centerPoint, vertices[i]);
            var nextVertex = vertices[0];
            if (i+1<vertices.length-1) nextVertex = vertices[i+1];
            var endingTheta = this._getAngle(centerPoint, nextVertex);
            var cornerRadius = this._makeArc(vertices[i], startingTheta, endingTheta, centerPoint, offset);
            geometry.vertices = geometry.vertices.concat(cornerRadius);
        }
        geometry.vertices.push(geometry.vertices[0]);//close loop
        return new THREE.Line(geometry);
    },

    _makeArc: function(startingPoint, startingTheta, endingTheta, centerPoint, radius){
        var vertices = [];
        if (endingTheta<startingTheta) endingTheta += Math.PI*2;
        var thetaIncr = (endingTheta-startingTheta)*Math.PI*2/100;
        for (var i=startingTheta+thetaIncr;i<endingTheta;i+=thetaIncr){
            vertices.push(new THREE.Vector3(-radius*Math.cos(i)+centerPoint.x, -radius*Math.sin(i)+centerPoint.y));
        }
        return vertices;
    },

    _getAngle: function(point1, point2){
        return Math.atan2(point1.y-point2.y, point1.x-point2.x);
    },


    drawToScreen: function(paths){

    }
});