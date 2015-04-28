/**
 * Created by aghassaei on 4/27/15.
 */


MillingExporter = Backbone.Model.extend({

    defaults: {
        fillThreeBar: true,
        units: "inches",
        linkWidth:0.5,
        dowelDiameter: 0.25,
        stockThickness: 0.47,
        pressFitTolerance:0.001,
        hingeTolerance:0.01,
        curveResolution: 100.0,
        scalingFactor:0.1
    },

    initialize: function(){

        this.material = new THREE.LineBasicMaterial({color:0x000000});
        this.redMaterial = new THREE.LineBasicMaterial({color:0xff0000});

    },

    createVectorPathsForLinkage: function(json){

//        globals.population.clearAll();
        globals.appState.set("isRunning", false);
        $("#threeContainer").hide();
        $("#svgContainer").show();


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

        //scale
        var scale = this.get("scalingFactor");
        _.each(json.hinges, function(hinge){
            hinge.position.x *= scale;
            hinge.position.y *= scale;
        });
        _.each(json.links, function(link){
            link.length *= scale;
        });

        var drawOffset = -6;
        var self = this;
        drawOffset += this._makeTriangle(json.hinges, [0,1,2], this.get("fillThreeBar"), drawOffset);
        var hinges = json.hinges;
        hinges.push({position:{x:2*hinges[3].position.x-hinges[4].position.x, y:hinges[4].position.y}});
        drawOffset += this._makeTriangle(hinges, [3,4,5], this.get("fillThreeBar"), drawOffset);
        _.each(json.links.reverse(), function(link){
            if (link.hinges[0] == 3 || link.hinges[1] == 3){
                drawOffset += self._makeLink(link.length, drawOffset, false);
            }
            if (link.hinges[0] == 4 || link.hinges[1] == 4){
                drawOffset += self._makeLink(link.length, drawOffset, true);
            }
        });
        drawOffset += this._makeCap(this.get("linkWidth")/2.0, this.get("dowelDiameter")/2 + this.get("pressFitTolerance"), drawOffset);
        drawOffset += this._makeSpacer(this.get("linkWidth")/2.0, this.get("dowelDiameter")/2 + this.get("hingeTolerance"), drawOffset);

        globals.svg.render();

        var xml = new XMLSerializer();
        var svg = xml.serializeToString(globals.svg.domElement);
        globals.saveFile(svg, "cuttingPaths", ".svg");

    },

    _makeSpacer: function(outerRad, innerRad, drawOffset){
        globals.svg.sceneAdd(this._makeCirce({x:0,y:0}, outerRad, drawOffset));
        globals.svg.sceneAdd(this._makeCirce({x:0,y:0}, innerRad, drawOffset));
        return outerRad*2+0.5;
    },

    _makeCap: function(outerRad, innerRad, drawOffset){
        globals.svg.sceneAdd(this._makeCirce({x:0,y:0}, outerRad, drawOffset));
        globals.svg.sceneAdd(this._makeCirce({x:0,y:0}, innerRad, drawOffset, this.redMaterial));
        return outerRad*2+0.5;
    },

    _makeLink: function(length, drawOffset, isPressFit){
        var hinges = [{position:{x:0,y:0}}, {position:{x:0,y:length}}];
        globals.svg.sceneAdd(this._makeOutlinePath(hinges, [0,1,0], this.get("linkWidth")/2.0, drawOffset));
        globals.svg.sceneAdd(this._makeCirce(hinges[0].position, this.get("dowelDiameter")/2.0 + this.get("hingeTolerance"), drawOffset));
        if (isPressFit) globals.svg.sceneAdd(this._makeCirce(hinges[1].position,
            this.get("dowelDiameter")/2.0 + this.get("pressFitTolerance"), drawOffset, this.redMaterial));
        else globals.svg.sceneAdd(this._makeCirce(hinges[1].position,
            this.get("dowelDiameter")/2.0 + this.get("hingeTolerance"), drawOffset));
        return this.get("linkWidth")+0.5;
    },

    _makeTriangle: function(hinges, indices, isSolid, drawOffset){
        var self = this;
        _.each(indices, function(num){
            globals.svg.sceneAdd(self._makeCirce(hinges[num].position, self.get("dowelDiameter")/2.0 + self.get("hingeTolerance"), drawOffset));
        });
        indices.push(indices[0]);
        var outline = this._makeOutlinePath(hinges, indices, this.get("linkWidth")/2.0, drawOffset);
        globals.svg.sceneAdd(outline);
        outline.geometry.computeBoundingBox();
        return Math.abs(outline.geometry.boundingBox.max.x-outline.geometry.boundingBox.min.x);
    },

    _makeOutlinePath: function(hinges, indices, offset, drawOffset){
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
            var cornerRadius = this._makeArc(startingTheta, endingTheta, centerPoint, offset);
            geometry.vertices = geometry.vertices.concat(cornerRadius);
        }
        geometry.vertices.push(geometry.vertices[0]);//close loop
        var line = new THREE.Line(geometry, this.material);
        line.position.set(drawOffset, 0, 0);
        return line;
    },

    _makeArc: function(startingTheta, endingTheta, centerPoint, radius){
        var vertices = [];
        if (endingTheta<startingTheta) endingTheta += Math.PI*2;
        var thetaIncr = Math.pow(Math.PI*2, 2)/((endingTheta-startingTheta)*this.get("curveResolution"));
        for (var i=startingTheta+thetaIncr;i<endingTheta;i+=thetaIncr){
            vertices.push(new THREE.Vector3(-radius*Math.cos(i)+centerPoint.x, -radius*Math.sin(i)+centerPoint.y));
        }
        return vertices;
    },

    _makeCirce: function(centerPoint, radius, drawOffset, material){
        var geometry = new THREE.Geometry();
        geometry.vertices = this._makeArc(0, Math.PI*2, centerPoint, radius);
        geometry.vertices.push(geometry.vertices[0]);
        var line;
        if (material === undefined) line  = new THREE.Line(geometry, this.material);
        else line = new THREE.Line(geometry, material);
        line.position.set(drawOffset, 0, 0);
        return line;
    },

    _getAngle: function(point1, point2){
        return Math.atan2(point1.y-point2.y, point1.x-point2.x);
    },


    drawToScreen: function(paths){

    }
});