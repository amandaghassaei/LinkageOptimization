/**
 * Created by aghassaei on 3/20/15.
 */

function PhysiModel(three){

    Physijs.scripts.worker = 'dependencies/physics/physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    var scene = new Physijs.Scene(); // create Physijs scene
    scene.setGravity(new THREE.Vector3( 0, -50, 0 )); // set gravity
    scene.addEventListener('update', function() {
      scene.simulate(); // simulate on every scene update
    });

    var plane = new Physijs.BoxMesh( // Physijs mesh
        new THREE.BoxGeometry(100, 100, 2, 10, 10), // Three.js geometry
        Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0xeeeeee}),
            .4, // friction
            .8 // restitution
        ),
        0 // weight, 0 is for zero gravity
    );
    scene.add(plane);


    return {

    }
}