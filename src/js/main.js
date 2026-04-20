import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from "gsap";

const body = document.querySelector('body');

// Chargement des modèles
const models = {
    exterieur: '/models/outside/G2_exterieur_baked.gltf',
    interieur: '/models/inside/G2_SM_piece.gltf',
    avatar1: '/models/inside/G2_DM_avatar_1.gltf',
    avatar2: '/models/inside/G2_DM_avatar_2.gltf',
    avatar3: '/models/inside/G2_DM_avatar_3.gltf',
    avatar4: '/models/inside/G2_DM_avatar_4.gltf',
    cadre: '/models/inside/G2_DM_cadre.gltf',
    cartons1: '/models/inside/G2_DM_cartons_1.gltf',
    cartons2: '/models/inside/G2_DM_cartons_2.gltf',
    cartons3: '/models/inside/G2_DM_cartons_3.gltf',
    cartons4: '/models/inside/G2_DM_cartons_4.gltf',
    cartons5: '/models/inside/G2_DM_cartons_5.gltf',
    cartons6: '/models/inside/G2_DM_cartons_6.gltf',
    cartons7: '/models/inside/G2_DM_cartons_7.gltf',
    lampeFusee: '/models/inside/G2_DM_lampe_fusee.gltf',
    lecteurCd: '/models/inside/G2_DM_lecteur_cd.gltf',
    petitTrain: '/models/inside/G2_DM_petit_train.gltf',
    skate: '/models/inside/G2_DM_skate.gltf',
    armoirCarre: '/models/inside/G2_SM_armoir_carre_combined.gltf',
    armoir: '/models/inside/G2_SM_armoir.gltf',
    bureau: '/models/inside/G2_SM_bureau_combined.gltf',
    chaiseCoffre: '/models/inside/G2_SM_chaise+coffre_combined.gltf',
    chevetEtager: '/models/inside/G2_SM_chevetetager_muralcorbeille_combined.gltf',
    fenetrePlafonier: '/models/inside/G2_SM_fenetreplafonier_combined.gltf',
    lit: '/models/inside/G2_SM_lit.gltf',
    porteTapispanier: '/models/inside/G2_SM_portetapispanier_combined.gltf',
    posterBall: '/models/inside/G2_SM_posterball_combined.gltf',
    boitePinceaux: '/models/inside/G2_DM_pinceau.gltf'
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

        const deltaTime = (timestamp - previousTime) / 1000;
        previousTime = timestamp;

        this.mixer.update(deltaTime);
        this.controls.update();
        this.render();

        window.requestAnimationFrame( ( timestamp ) => {
            this.animate( timestamp );
        } );
    }

    populate() {

        const model = models.exterieur.scene;
        model.rotation.y = THREE.MathUtils.degToRad(270);
        this.scene.add( model );
        this.currentModel = model;

        // console.log(models)

        const ambientLight = new THREE.AmbientLight( 'white', 1 );
        this.scene.add( ambientLight );

        // Je donne accès au mixer dans mon objet viewer
        this.mixer = new THREE.AnimationMixer( this.scene );

        window.requestAnimationFrame( ( timestamp ) => {
            this.animate( timestamp );
        } );

        // Bakcground du canvas
        this.scene.background = new THREE.Color( 0x1e1e1e );

        // Demander un rendu
        this.render();
    }

    switchInterior() {
        this.scene.remove(this.currentModel);

        // Modèles pièce intérieur
        this.interiorModels = [];
        const interiorModelItems = [
            'interieur', 'avatar1', 'avatar2', 'avatar3', 'avatar4', 'cadre', 'cartons1', 'cartons2', 'cartons3', 'cartons4', 'cartons5', 'cartons6', 'cartons7', 'lampeFusee', 'lecteurCd', 'petitTrain', 'skate', 'armoirCarre', 'armoir', 'bureau', 'chaiseCoffre', 'chevetEtager', 'fenetrePlafonier', 'lit', 'porteTapispanier', 'posterBall', 'boitePinceaux'
        ];

        interiorModelItems.forEach(item => {
            const model = models[item].scene;
            model.rotation.y = THREE.MathUtils.degToRad(270);
            this.scene.add(model);
            this.interiorModels.push(model);
        });

        this.camera.position.set(1, 0.5, 1);

        this.controls.enablePan = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minAzimuthAngle = -Infinity;
        this.controls.maxAzimuthAngle = Infinity;

        // Targets des items
        const targetsGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const targetsMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, visible: false });

        const targetLampe = new THREE.Mesh(targetsGeometry, targetsMaterial);
        const targetTrain = new THREE.Mesh(targetsGeometry, targetsMaterial);
        const targetLecteur = new THREE.Mesh(targetsGeometry, targetsMaterial);
        const targetPoster = new THREE.Mesh(targetsGeometry, targetsMaterial);
        const targetSkate = new THREE.Mesh(targetsGeometry, targetsMaterial);
        const targetBoite = new THREE.Mesh(targetsGeometry, targetsMaterial);
        targetLampe.position.set(-1.5, -0.75, 0.45);
        targetTrain.position.set(-1.5, -0.15, 0.45);
        targetLecteur.position.set(-1.45, -0.6, -0.45);
        targetPoster.position.set(1.6, -0.4, -0.55);
        targetSkate.position.set(0.8, -1.4, -1.4);
        targetBoite.position.set(-1.45, -0.6, -1.2);

        this.scene.add(targetLampe, targetTrain, targetLecteur, targetPoster, targetSkate, targetBoite);

        // Targets position des cameras
        const targetsCamMaterial = new THREE.MeshStandardMaterial({ color: 0xFF7E46 });

        const targetCamLampe = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        const targetCamTrain = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        const targetCamLecteur = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        const targetCamPoster = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        const targetCamSkate = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        const targetCamBoite = new THREE.Mesh(targetsGeometry, targetsCamMaterial);
        targetCamLampe.position.set(0, -0.75, 0.45);
        targetCamTrain.position.set(0, -0.15, 0.45);
        targetCamLecteur.position.set(0, -0.6, -0.2);
        targetCamPoster.position.set(0, -0.4, -0.55);
        targetCamSkate.position.set(0, -0.5, -0.5)
        targetCamBoite.position.set(-0.5, 0.5, -1);

        this.scene.add(targetCamLampe, targetCamTrain, targetCamLecteur, targetCamBoite, targetCamPoster, targetCamSkate);

        this.cameraTargets = [targetCamLampe, targetCamTrain, targetCamLecteur, targetCamPoster, targetCamSkate, targetCamBoite];
        this.currentTargetIndex = 0;
        this.lookTargets = [targetLampe.position, targetTrain.position, targetLecteur.position, targetPoster.position, targetSkate.position, targetBoite.position];

        // Mettre à jour le mixer pour la nouvelle scène
        this.mixer = new THREE.AnimationMixer(this.scene);

        // Navigation des cameras
        const navCamera = document.querySelector('.navCamera');
        if (navCamera) {
            navCamera.classList.add('isVisible');
        }

        const arrowLeft = document.querySelector('.navArrow--left');
        const arrowRight = document.querySelector('.navArrow--right');
        if (arrowLeft) {
            arrowLeft.addEventListener('click', () => this.moveCameraLeft());
        }
        if (arrowRight) {
            arrowRight.addEventListener('click', () => this.moveCameraRight());
        }

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
        // this.canvas.style.filter = 'grayscale(100%)';

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

        // Orbit Controls
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

    moveCameraLeft() {
        this.currentTargetIndex = (this.currentTargetIndex - 1 + this.cameraTargets.length) % this.cameraTargets.length;
        const targetPos = this.cameraTargets[this.currentTargetIndex].position;
        const lookPos = this.lookTargets[this.currentTargetIndex];
        gsap.to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1,
            onUpdate: () => this.render()
        });
        gsap.to(this.controls.target, {
            x: lookPos.x,
            y: lookPos.y,
            z: lookPos.z,
            duration: 1
        });
    }

    moveCameraRight() {
        this.currentTargetIndex = (this.currentTargetIndex + 1) % this.cameraTargets.length;
        const targetPos = this.cameraTargets[this.currentTargetIndex].position;
        const lookPos = this.lookTargets[this.currentTargetIndex];
        gsap.to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 1,
            onUpdate: () => this.render()
        });
        gsap.to(this.controls.target, {
            x: lookPos.x,
            y: lookPos.y,
            z: lookPos.z,
            duration: 1
        });
    }
}

const myViewer = new Viewer(threejsOptions);
// myViewer.addGizmo(2);

// Ajouter un event resize et appeler la fonction qui
// gère les changements de tailles
window.addEventListener("resize", () => {
    myViewer.resize();
});

const btnEntry = document.querySelector(".btnEntry");
btnEntry.addEventListener("click", () => {
    myViewer.switchInterior();

    btnEntry.remove();
});