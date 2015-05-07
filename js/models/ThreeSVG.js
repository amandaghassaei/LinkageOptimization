/**
 * Created by aghassaei on 4/27/15.
 */


function ThreeSVG(){

//    var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000);
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 10000);
    var scene = new THREE.Scene();
    var renderer = new THREE.SVGRenderer();

    initialize();

    function initialize(){

        scene.fog = new THREE.FogExp2(0xffffff, 0.000);

        // lights
        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        scene.add(light);
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-1, -1, -1);
        scene.add(light);
        light = new THREE.AmbientLight(0xffffff);
        scene.add(light);

        // renderer
        renderer.setClearColor(scene.fog.color, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.position.set(-4, 0, 22);

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function sceneAdd(object){
        scene.add(object);
    }

    function sceneRemove(object){
        scene.remove(object);
    }

    function _getParentObject(object){
        var parent = object;
        if (object.parent && object.parent.type != "Scene") {
            parent = object.parent;
        }
        return parent;
    }

    function render(){
        if (!($("#svgContainer").is(":visible"))) return;
        renderer.render(scene, camera);
    }

    return {//return public properties/methods
        render: render,
        sceneRemove: sceneRemove,
        sceneAdd: sceneAdd,
        domElement: renderer.domElement,
        camera: camera,
    }
}