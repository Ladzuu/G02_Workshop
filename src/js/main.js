import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const body = document.querySelector('body');

// Chemins vers nos modèles
const models = {
    ball: '/models/G0_DM_ball.gltf',
    cube: '/models/G0_DM_cube.gltf',
    exterieur: '/models/G0_SM_exterieur.gltf'
};

// LOADING
const gltfLoader = new GLTFLoader();

// Remplace les chemins de l'objet 'models'
// par les scenes threejs chargées par gltfLoader
// Le chargement bloque le reste du script
for( const key in models ){
  models[ key ] = await gltfLoader.loadAsync( models[ key ] );
}


// Enlève le loader
body.classList.remove( 'loading' );

// SETTINGS
const settings = {
    wrapper: document.querySelector(".js-canvas-wrapper"),
    canvas: document.querySelector(".js-canvas-3d"),
    raf: window.requestAnimationFrame,
    sizes: {},
};

const threejsOptions = {
    canvas: settings.canvas,
};

//// VIEWER CLASS
let previousTime = 0;

class Viewer {
    constructor(options) {
        this.canvas = options.canvas;

        this.setRenderer(options);
    }


    animate( timestamp ) {
    // const deltaTime = (timestamp - previousTime) * 0.001;
    // previousTime = timestamp;
    //     this.mixer.update( deltaTime );
    //     this.mixer2.update( deltaTime );
    //     this.render();
    //     window.requestAnimationFrame(( timestamp) => {
    //         this.animate(timestamp);
    //     })
    }

    animate2( timestamp ) {

        const deltaTime = (timestamp - previousTime) / 1000;
        previousTime = timestamp;

        console.log(timestamp);
        this.mixer.update(deltaTime);
        this.render();

        window.requestAnimationFrame( ( timestamp ) => {
            this.animate2( timestamp );
        } );
    }

    populate() {

        this.scene.add( ...models.exterieur.scene.children );
        this.scene.add( ...models.ball.scene.children );

        // Rajoute chaque animation stockée dans les modèles
        // pour les mettre dans notre objet "this.scene"
        for( const key in models ){
            for( const animation of models[ key ].animations ){
                this.scene.animations.push( animation );
            }
        }

        const ambientLight = new THREE.AmbientLight( 'white', 1 );
        this.scene.add( ambientLight );

        for( const mesh of this.scene.children ){
            if( mesh.isMesh ){
                console.log(mesh);
                const meshMap = mesh.material.map;
                let emissive = false;

                if( mesh.name === "G0_fenetres" ){
                    emissive = true;
                }
                
                let newMaterial = null;

                if( emissive ){
                    newMaterial = new THREE.MeshLambertMaterial({
                        map: meshMap,
                        emissive: 'yellow',
                        emissiveIntensity: .35,
                        emissiveMap: meshMap
                    });
                } else {
                    newMaterial = new THREE.MeshLambertMaterial({
                        map: meshMap,
                    });
                }

                // const newMaterial = new THREE.MeshLambertMaterial({
                //     map: meshMap,
                //     emissive: emissive ? 'gold' : null,
                //     emissiveIntensity: emissive ? .3 : null,
                //     emissiveMap: emissive ? meshMap : null

                //     // emivisseMap: emissive
                // });

                mesh.material = newMaterial;

            }
        }

        console.log( this.scene.animations);

        const ball = this.scene.getObjectByName( 'G0_DM_ball' );
        const mixer = new THREE.AnimationMixer( ball );
        const clip = THREE.AnimationClip.findByName( this.scene.animations, 'roulade' );
        const action = mixer.clipAction( clip );
        action.play();

        // Je donne accès au mixer dans mon objet viewer
        this.mixer = mixer;

        window.requestAnimationFrame( ( timestamp ) => {
            this.animate2( timestamp );
        } );

        // Demander un rendu
        this.render();
    }

    removeGizmo() {
        this.scene.remove(this.gizmo);
        this.gizmo.dispose();
        this.gizmo = null;
        this.render();
    }

    addGizmo(size = 1) {
        this.gizmo = new THREE.AxesHelper(size);
        this.scene.add(this.gizmo);
        this.render();
    }

    render(scene = this.scene, camera = this.camera) {
        this.renderer.render(scene, camera);
    }

    setRenderer(options = {}) {
        this.renderer = new THREE.WebGLRenderer(options);

        // Crée notre caméra
        // PerspectiveCamera( fov, aspect-ratio, near, far )
        this.camera = new THREE.PerspectiveCamera(
            45,
            // On le calcule avec la taille du wrapper
            settings.sizes.w / settings.sizes.h,
            1,
            100
        );

        // Recule notre camera pour qu'on puisse voir le centre de la scene
        this.camera.position.z = 10;

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.addEventListener( 'change', () => {
          this.render();
        } );

        // Crée notre scene et y rajoute notre camera
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        // Change une première fois la taille de notre canvas
        this.resize();

        // Appele la fonction d'ajout d'éléments
        this.populate();
    }

    resize() {
        // Mettre à jour nos settings
        settings.sizes.w = settings.wrapper.clientWidth;
        settings.sizes.h = settings.wrapper.clientHeight;

        // Limite la densité de pixel à 2, pour éviter
        // des problèmes de performances sur des écrans
        // à plus haute densité de pixel.
        settings.sizes.dpr = Math.min(window.devicePixelRatio, 2);

        settings.canvas.style.aspetRatio = `${settings.sizes.w}/${settings.sizes.h}`;

        // Mettre à jour la camera
        this.camera.aspect = settings.sizes.w / settings.sizes.h;
        this.camera.updateProjectionMatrix();

        // Mettre à jour le moteur de rendu
        this.renderer.setSize(settings.sizes.w, settings.sizes.h);
        this.renderer.setPixelRatio(settings.sizes.dpr);

        this.render();
    }
}

const myViewer = new Viewer(threejsOptions);
// myViewer.addGizmo(2);

// Ajouter un event resize et appeler la fonction qui
// gère les changements de tailles
window.addEventListener("resize", () => {
    myViewer.resize();
});