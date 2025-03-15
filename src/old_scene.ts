import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import mus from './RW-for-3js.mp3';
import rg from './textures/rg.webp';

import './main.scss';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const root = document.getElementById('root') as HTMLElement;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ASPECT = WIDTH / HEIGHT;

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;

const updateArr: (() => void)[] = [];

const context = new AudioContext();
let analyser: AnalyserNode;

const num = 64;
const freqArray = new Uint8Array(num * 2);

const {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    DirectionalLight,
    AmbientLight,
    BufferGeometry,
    Float32BufferAttribute,
} = THREE;

init();

function init() {
    renderer = new WebGLRenderer({ antialias: true, failIfMajorPerformanceCaveat: true, logarithmicDepthBuffer: true });
    scene = new Scene();

    camera = new PerspectiveCamera(90, ASPECT, 0.1, 50000);
    camera.position.set(800, 800, -2000);

    renderer.setSize(WIDTH, HEIGHT);
    root.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
    addAudioMusic();

    /////////

    // addFloor();
    addLight();
    addCube();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(new THREE.Vector3(0, 0, 0));
    controls.update();

    // animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function addLight() {
    // for (let i = -num; i < num; i++) {
    //     const rectLight1 = new THREE.RectAreaLight(0xffffff, 15, 3, 10);
    //     rectLight1.position.set(i * 4, -0.2, 50);

    //     scene.add(rectLight1);
    //     scene.add(new RectAreaLightHelper(rectLight1));

    //     updateArr.push(() => {
    //         const height = freqArray[Math.abs(i - num)] || 0;
    //         rectLight1.height = height;
    //         rectLight1.color.setRGB(height / 255, (255 - height) / 255, 0.9);
    //     });
    // }

    const am = new AmbientLight(0xffffff, 1);
    scene.add(am);

    // const dl = new DirectionalLight(0xffffff, 1);
    // dl.position.set(1000, 1000, 1000);
    // scene.add(dl);
}

function addFloor() {
    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0.5 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    mshStdFloor.position.set(0, 0, 0);
    scene.add(mshStdFloor);
}

function updateBoxGeometry(
    mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>,
    geometry: THREE.BoxGeometry,
) {
    mesh.geometry.dispose();

    mesh.geometry = geometry;
}

function addMirror(xOffset: number, yOffset: number, zOffset: number, angleX: number, angleY: number, angleZ: number) {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const verticalMirror = new Reflector(geometry, {
        //clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x61616a,
    });
    verticalMirror.position.x = xOffset;
    verticalMirror.position.y = yOffset;
    verticalMirror.position.z = zOffset;
    verticalMirror.rotateX(angleX);
    verticalMirror.rotateY(angleY);
    verticalMirror.rotateZ(angleZ);
    scene.add(verticalMirror);
}

function addCube() {
    // const texture = new THREE.TextureLoader().load(rg);
    // texture.magFilter = THREE.NearestFilter;

    const cubeMaterialArray: THREE.MeshStandardMaterial[] = [];

    // order to add materials: x+,x-,y+,y-,z+,z-
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff }));
    // cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));

    addMirror(0, 0, 1000, 0, Math.PI, 0);
    addMirror(0, 0, -1000, 0, 0, 0);

    addMirror(1000, 0, 0, 0, -Math.PI / 2, 0);
    addMirror(-1000, 0, 0, 0, Math.PI / 2, 0);

    const pos1 = new THREE.BoxGeometry(2002, 2002, 2002);
    const mesh1 = new THREE.MeshStandardMaterial({
        color: 0x1c1035,
        side: THREE.BackSide,
        metalness: 0,
        roughness: 0,
        transparent: true,
        opacity: 0.8,
    });
    const cube1 = new THREE.Mesh(pos1, mesh1);
    scene.add(cube1);

    for (let i = -num + 1; i < num; i++) {
        const size = 6;
        const pos = new THREE.BoxGeometry(size, size, size);
        const mesh = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const cube = new THREE.Mesh(pos, mesh);
        scene.add(cube);
        // cube.position.set(0, 50, -200);
        cube.position.set(i * (size * 1.52), 0, 0);

        updateArr.push(() => {
            const height = freqArray[Math.abs(i - num)] || 0;
            const red = height ? height / 255 : 0;
            const green = height ? (255 - height) / 255 : 0;
            const blue = height ? 0.9 : 0;
            mesh.color.setRGB(red, green, blue);

            // rectLight1.height = height;
            // rectLight1.color.setRGB(height / 255, (255 - height) / 255, 0.9);
            updateBoxGeometry(cube, new THREE.BoxGeometry(size, height * 2 + 0.5, size));
        });
    }
}

function addAudioMusic() {
    analyser = context.createAnalyser();
    analyser.channelCount = 12;

    const music = new Audio(mus);
    const music4An = new Audio(mus);

    music4An.addEventListener('canplaythrough', () => {
        context.resume();
        const src = context.createMediaElementSource(music4An);
        src.connect(analyser);

        animate();
    });

    window.addEventListener('keyup', (key) => {
        context.resume();
        if (key.keyCode === 32) {
            if (!music4An.paused) {
                music.pause();
                music4An.pause();
            } else {
                music.play();
                music4An.play();
            }
        }
    });
}

function animate() {
    setTimeout(() => {
        render();

        requestAnimationFrame(animate);

        stats.update();
    }, 60 / 1000);
}

function render() {
    renderer.render(scene, camera);
    void analyser.getByteFrequencyData(freqArray);
    updateArr.forEach((func) => func());
}
