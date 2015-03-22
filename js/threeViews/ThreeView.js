/**
 * Created by aghassaei on 1/16/15.
 */

ThreeView = Backbone.View.extend({

    events: {
        "mousemove":                            "_mouseMoved",
        "mouseup":                              "_mouseUp",
        "mousedown":                            "_mouseDown",
        "mouseout":                             "_mouseOut"
    },

    mouseIsDown: false,//store state of mouse click inside this el

    el: "#threeContainer",

    controls: null,

    initialize: function(){

        _.bindAll(this, "_mouseMoved", "_render");

        this.listenTo(globals.appState, "change:is3D", this._changeDimension);

        this.controls = new THREE.OrbitControls(this.model.camera, this.$el.get(0));
        this.controls.addEventListener('change', this.model.render);

        this.$el.append(this.model.domElement);//append only once

        this._changeDimension();//set up for initial dimension
        this._render();
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////CONTROLS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _render: function(){//start render loop
        globals.linkage.render();
        this.model.render();
        requestAnimationFrame(this._render);
    },

    _changeDimension: function(){
        var state = globals.appState.get("is3D");
        this.controls.noRotate = !state;
        if (!state) {
            this.model.camera.position.set(0,0,100);
            this.controls.update();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////MOUSE EVENTS/////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    _mouseOut: function(){
    },

    _mouseUp: function(){
        this.mouseIsDown = false;
    },

    _mouseDown: function(){
        this.mouseIsDown = true;
    },

    _mouseMoved: function(e){
    }

});