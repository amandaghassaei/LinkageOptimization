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
        _.each([0,1,2], function(num){

        });




    },

    drawToScreen: function(paths){

    }
});