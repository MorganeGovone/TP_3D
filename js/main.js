import Dude from "./Dude.js";

let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    let tank = scene.getMeshByName("heroTank");
    let vaisseau = scene.getMeshByName("heroVaisseau");
    let lumVaisseau = scene.getMeshByName("herolumiere");
    let alien = scene.getMeshByName("alienMaster");
    let BrainStem = scene.getMeshByName("bStem");
    lumVaisseau.parent = vaisseau;

    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?

        //tank.move();
        vaisseau.move();
        lumVaisseau.moveL();

        lumVaisseau.rotation.y += 0.05;

        let heroDude = scene.getMeshByName("heroDude");
        if(heroDude)
            heroDude.Dude.move(scene);

        if(scene.dudes) {
            for(var i = 0 ; i < scene.dudes.length ; i++) {
                scene.dudes[i].Dude.move(scene);
            }
        }    

        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);

    //let tank = createTank(scene,ground);
    let vaisseau = createVaisseau(scene);
    let lumVaisseau = createLumVaisseau(scene);

    // second parameter is the target to follow
    let followCamera = createFollowCamera(scene, vaisseau);
    scene.activeCamera = followCamera;
    
    createLights(scene);
    createHeroDude(scene);
    createAlien(scene);
    createBrainStem(scene);

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:3000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/Skybox/skybox3", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

   return scene;
}

function createGround(scene) {
    //scene is optional and defaults to the current scene
    var ground = BABYLON.MeshBuilder.CreateDisc("ground", {radius: 1000}, scene);
    ground.rotation.x = Math.PI / 2
    ground.position.y= -10;
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("images/sol.jpg");
    ground.material = groundMaterial;
    // to be taken into account by collision detection
    ground.checkCollisions = true;
    //groundMaterial.wireframe=true;
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(0, -3, 4), scene);
    light0.specular = new BABYLON.Color3(0,0,0);
    light0.intensity = 1;
    let light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(0, -1, 0), scene);
    light1.intensity = 0.1;
    light1.emissiveColor = new BABYLON.Color3(0,0,0);
    var lightA = new BABYLON.SpotLight("spotLight1", new BABYLON.Vector3(1, 500, 150), new BABYLON.Vector3(0, -1, 1), Math.PI / 2, 50, scene);
    lightA.intensity = 1;
}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 100; // how far from the object to follow
	camera.heightOffset = 5; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovementT = 5;
function createTank(scene,ground) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height:1, depth:6, width:6}, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.position.y = 0.6;
    tank.speed = 2;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);

    tank.move = () => {
                //tank.position.z += -1; // speed should be in unit/s, and depends on
                                 // deltaTime !

        // if we want to move while taking into account collision detections
        // collision uses by default "ellipsoids"

        let yMovementT = 0;
       
        if (tank.position.y > 2) {
            zMovementT = 0;
            yMovementT = 0;

        } else {
        //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

            if(inputStates.up) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
            }    
            if(inputStates.down) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed));

            }    
            if(inputStates.left) {
                //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
                tank.rotation.y -= 0.02;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
            }    
            if(inputStates.right) {
                //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
                tank.rotation.y += 0.02;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
            }
        }

    }

    return tank;
}

let zMovementV = 5;
function createVaisseau(scene) {
    let vaisseau = new BABYLON.MeshBuilder.CreateCylinder("heroVaisseau", {diameterTop: 4,height:6,diameterBottom:20,tessellation:6});
    let vaisseauMaterial = new BABYLON.StandardMaterial("vaisseauMaterial", scene);
    vaisseauMaterial.diffuseTexture = new BABYLON.Texture("images/ovni.jpg", scene);
    vaisseauMaterial.diffuseColor = new BABYLON.Color3(265,265,265);
    vaisseau.material = vaisseauMaterial;

    // By default the box/tank is in 0, 0, 0, let's change that...
    vaisseau.position.y = 40;
    vaisseau.speed = 2;
    vaisseau.frontVector = new BABYLON.Vector3(0, 0, 1);

    vaisseau.move = () => {
                //tank.position.z += -1; // speed should be in unit/s, and depends on
                                 // deltaTime !

        // if we want to move while taking into account collision detections
        // collision uses by default "ellipsoids"

        let yMovementV = 0;

       
        if (vaisseau.position.y > 42) {
            zMovementV = 0;
            yMovementV = 0;
        } else {
        //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

            if(inputStates.up) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
                vaisseau.moveWithCollisions(vaisseau.frontVector.multiplyByFloats(vaisseau.speed, vaisseau.speed, vaisseau.speed));
            }    
            if(inputStates.down) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
                vaisseau.moveWithCollisions(vaisseau.frontVector.multiplyByFloats(-vaisseau.speed, -vaisseau.speed, -vaisseau.speed));
            }    
            if(inputStates.left) {
                //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
                vaisseau.rotation.y -= 0.02;
                vaisseau.frontVector = new BABYLON.Vector3(Math.sin(vaisseau.rotation.y), 0, Math.cos(vaisseau.rotation.y));
            }    
            if(inputStates.right) {
                //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
                vaisseau.rotation.y += 0.02;
                vaisseau.frontVector = new BABYLON.Vector3(Math.sin(vaisseau.rotation.y), 0, Math.cos(vaisseau.rotation.y));
            }
        }

    }
    return vaisseau;
}

let zMovementL = 5;
function createLumVaisseau(scene) {
    let lumiere = new BABYLON.MeshBuilder.CreateCylinder("herolumiere", {diameterTop:3.5,height:86,diameterBottom:40});
    let lumiereMaterial = new BABYLON.StandardMaterial("lumiereMaterial", scene);
    lumiereMaterial.diffuseTexture = new BABYLON.Texture("images/lumovni.jpg", scene);
    lumiereMaterial.alpha = 0.6;
    lumiereMaterial.diffuseColor = new BABYLON.Color3(265,265,265);
    lumiereMaterial.emissiveColor = new BABYLON.Color3(265,265,265);
    lumiere.material = lumiereMaterial;

    lumiere.position.y = -40;
    lumiere.speed =0;
    lumiere.frontVector = new BABYLON.Vector3(0, 0, 1);
    

    lumiere.moveL = () => {

        let yMovementL = 0;

       
        if (lumiere.position.y > 0) {
            zMovementL = 0;
            yMovementL = 0;
        } else {

            if(inputStates.up) {
                lumiere.moveWithCollisions(lumiere.frontVector.multiplyByFloats(lumiere.speed, lumiere.speed, lumiere.speed));
            }    
            if(inputStates.down) {
                lumiere.moveWithCollisions(lumiere.frontVector.multiplyByFloats(-lumiere.speed, -lumiere.speed, -lumiere.speed));
            }    
            if(inputStates.left) {
                lumiere.rotation.y -= 0.02;
                lumiere.frontVector = new BABYLON.Vector3(Math.sin(lumiere.rotation.y), 0, Math.cos(lumiere.rotation.y));
            }    
            if(inputStates.right) {
                lumiere.rotation.y += 0.02;
                lumiere.frontVector = new BABYLON.Vector3(Math.sin(lumiere.rotation.y), 0, Math.cos(lumiere.rotation.y));
            }
        }

    }
    return lumiere;
}

function createAlien(scene){
    
    BABYLON.SceneLoader.ImportMesh("", "models/Alien/", "Alien.gltf", scene, function (meshes) {  
        let alien = meshes[0];
        alien.position.y = 120;
        alien.position.z = 600;
        alien.scaling = new BABYLON.Vector3(200, 200, 200); 
        alien.name = "alienMaster";
    });
}

function createBrainStem(scene){
    const assetsManager = new BABYLON.AssetsManager(scene);
    const modelTask = assetsManager.addMeshTask('model', null, "models/BrainStem/", "BrainStem.gltf");
    modelTask.onSuccess = (task) => {
      task.loadedMeshes.forEach((mesh) => {
        mesh.scaling = new BABYLON.Vector3(30, 30, 30);
        mesh.name = "bStem"
        mesh.isVisible = false;
        var d = 100;
    for (var i = 0; i < 360; i += 90) {
            var r = BABYLON.Tools.ToRadians(i);
            if (mesh.geometry) {
                const instance = mesh.createInstance('manta' + i);
                instance.position.x = Math.cos(r) * d;
                instance.position.y = -10;
                instance.position.z = 625 + Math.sin(r) * d;

                // instance.rotation.z = -Math.PI/4;
                instance.rotation.y = -r;
                instance.isVisible = true;
            }
        }
      });
    };
    assetsManager.load();
}

function createHeroDude(scene) {
   // load the Dude 3D animated model
    // name, folder, skeleton name 
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene,  (newMeshes, particleSystems, skeletons) => {
        let heroDude = newMeshes[0];
        heroDude.position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        // make it smaller 
        heroDude.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
        //heroDude.speed = 0.1;

        // give it a name so that we can query the scene to get it by name
        heroDude.name = "heroDude";

        // there might be more than one skeleton in an imported animated model. Try console.log(skeletons.length)
        // here we've got only 1. 
        // animation parameters are skeleton, starting frame, ending frame,  a boolean that indicate if we're gonna 
        // loop the animation, speed, 
        let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

        let hero = new Dude(heroDude, 0.1);

        // make clones
        scene.dudes = [];
        for(let i = 0; i <10; i++) {
            scene.dudes[i] = doClone(heroDude, skeletons, i);
            scene.beginAnimation(scene.dudes[i].skeleton, 0, 120, true, 1);

            // Create instance with move method etc.
            var temp = new Dude(scene.dudes[i], 0.3);
            // remember that the instances are attached to the meshes
            // and the meshes have a property "Dude" that IS the instance
            // see render loop then....
        }
         

    });
}


function doClone(originalMesh, skeletons, id) {
    let myClone;
    let xrand = Math.floor(Math.random()*500 - 250);
    let zrand = Math.floor(Math.random()*500 - 250);

    myClone = originalMesh.clone("clone_" + id);
    myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

    if(!skeletons) return myClone;

    // The mesh has at least one skeleton
    if(!originalMesh.getChildren()) {
        myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
        return myClone;
    } else {
        if(skeletons.length === 1) {
            // the skeleton controls/animates all children, like in the Dude model
            let clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
            myClone.skeleton = clonedSkeleton;
            let nbChildren = myClone.getChildren().length;

            for(let i = 0; i < nbChildren;  i++) {
                myClone.getChildren()[i].skeleton = clonedSkeleton
            }
            return myClone;
        } else if(skeletons.length === originalMesh.getChildren().length) {
            // each child has its own skeleton
            for(let i = 0; i < myClone.getChildren().length;  i++) {
                myClone.getChildren()[i].skeleton() = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
            }
            return myClone;
        }
    }

    return myClone;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        }  else if (event.key === " ") {
           inputStates.space = true;
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        }  else if (event.key === " ") {
           inputStates.space = false;
        }
    }, false);
}

