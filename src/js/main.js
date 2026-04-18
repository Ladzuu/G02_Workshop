import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const body = document.querySelector('body');

// Chemins vers nos modèles
const models = {
    exterieur: '/models/outside/G2_exterieur_baked.gltf'
};

// LOADING
const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
gltfLoader.setDRACOLoader(dracoLoader);

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

        this.mixer.update(deltaTime);
        this.controls.update();
        this.render();

        window.requestAnimationFrame( ( timestamp ) => {
            this.animate2( timestamp );
        } );
    }

    populate() {

        const model = models.exterieur.scene;
        model.rotation.y = THREE.MathUtils.degToRad(270);
        this.scene.add( model );

        const ambientLight = new THREE.AmbientLight( 'white', 1 );
        this.scene.add( ambientLight );

        // Je donne accès au mixer dans mon objet viewer
        this.mixer = new THREE.AnimationMixer( this.scene );

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
        this.camera.position.x = 10;
        this.camera.position.y = 5;
        this.camera.position.z = 10;

        // Orbit Control Settings
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.dampingFactor = 0.05;
        this.controls.minPolarAngle = Math.PI / 2.5;
        this.controls.maxPolarAngle = Math.PI / 2.5;
        this.controls.minDistance = 10
        this.controls.maxDistance = 25
        this.controls.minAzimuthAngle = THREE.MathUtils.degToRad(0);
        this.controls.maxAzimuthAngle = THREE.MathUtils.degToRad(90);
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