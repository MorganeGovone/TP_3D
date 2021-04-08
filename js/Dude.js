export default class Dude {
    constructor(dudeMesh,skeleton, speed) {
        this.dudeMesh = dudeMesh;
        this.skeleton = skeleton;

        if(speed)
            this.speed = speed;
        else
            this.speed = 1;

        dudeMesh.Dude = this;
    }

    move(scene,skelet) {
                
        //Diriger les dudes vers l'alien

        let posAlien = new BABYLON.Vector3(0,0,600);
        let direction = posAlien.subtract(this.dudeMesh.position);

        let distance = direction.length(); // we take the vector that is not normalized, not the dir vector

        let dir = direction.normalize();
        let alpha = Math.atan2(-dir.x, -dir.z);
        this.dudeMesh.rotation.y = alpha;

        // let make the Dude move towards the tank
        if(distance > 150) {
            //a.restart();   
            this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
            /*Essai pour arreter les dudes.
            2 possibilites qui pourraient marcher : 
                - faire un vecteur nul sur les positions de skeleton
                - scene.stopAnimation(skeletons[0], 0, 100, true, 1.0);
            Mais je n'ai pas reussi */

            /*for(let i=0;i<this.skeleton.bones.length;i++){
                this.skeleton.position = new BABYLON.Vector3(0,0,0);
            }*/
        }   
    }
}