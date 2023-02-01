import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

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

const num = 32;

const Arr = new Uint8Array(num * 2);

// let controls: any;
// const clock = new THREE.Clock();

const { Scene, WebGLRenderer, PerspectiveCamera, DirectionalLight, AmbientLight } = THREE;

async function init() {
    renderer = new WebGLRenderer();
    scene = new Scene();

    camera = new PerspectiveCamera(90, ASPECT, 0.1, 1000);
    camera.position.set(0, 30, -20);

    renderer.setSize(WIDTH, HEIGHT);
    root.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    /////////

    addFloor();
    await addLight();
    addCube();

    addAudioMusic();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(new THREE.Vector3(0, 30, 0));
    controls.update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function addLight() {
    for (let i = -num; i < num; i++) {
        const rectLight1 = new THREE.RectAreaLight(0x00ff00, 7, 4, 1);
        rectLight1.position.set(i * 4, -0.1, 50);

        scene.add(rectLight1);
        scene.add(new RectAreaLightHelper(rectLight1));

        updateArr.push(() => {
            const height = Arr[Math.abs(i - num)];
            rectLight1.height = height;
            rectLight1.color.setRGB(height / 255, (255 - height) / 255, 0.9);
        });
    }

    // const am = new AmbientLight(0xffffff, 0.2);
    // scene.add(am);
}

function addFloor() {
    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    mshStdFloor.position.set(0, 0, 0);
    scene.add(mshStdFloor);
}

function addCube() {
    const texture = new THREE.TextureLoader().load(rg, (text) => {
        text.magFilter = THREE.NearestFilter;

        const cubeMaterialArray: THREE.MeshStandardMaterial[] = [];

        // order to add materials: x+,x-,y+,y-,z+,z-
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ map: text, color: 0xffffff }));
        cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));

        const pos = new THREE.BoxGeometry(100, 100, 100);
        const cube = new THREE.Mesh(pos, cubeMaterialArray);
        scene.add(cube);
        cube.position.set(0, 50, -200);
    });
}

function animate() {
    requestAnimationFrame(animate);

    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
    updateArr.forEach((func) => func());

    analyser.getByteFrequencyData(Arr);
}

let analyser: AnalyserNode;

function addAudioMusic() {
    const context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    const music = new Audio(mus);
    const music4An = new Audio(mus);

    music4An.addEventListener('loadeddata', () => {
        const src = context.createMediaElementSource(music4An);
        src.connect(analyser);

        window.addEventListener('keyup', (key) => {
            if (key.keyCode === 32) {
                if (!music.paused) {
                    music.pause();
                    music4An.pause();
                } else {
                    music.play();
                    music4An.play();
                }
            }
        });
    });
}

init().then(() => {
    animate();
});
