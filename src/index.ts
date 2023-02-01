import * as THREE from 'three';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import './main.scss';
import mus from './RW-for-3js.mp3';
import rg from './textures/rg.webp';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const root = document.getElementById('root');
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

function init() {
    renderer = new WebGLRenderer();
    scene = new Scene();
    // scene.background = new THREE.Color(0x111111);
    // scene.fog = new THREE.Fog(0x111111, 150, 200);

    camera = new PerspectiveCamera(90, ASPECT, 0.1, 1000);
    camera.position.set(0, 30, -20);

    addFloor();

    addLight();

    addCube();

    renderer.setSize(WIDTH, HEIGHT);
    root.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    /////////
    addAudioMusic();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(new THREE.Vector3(0, 30, 0));
    controls.update();

    // controls = new FirstPersonControls(camera, renderer.domElement);

    // controls.movementSpeed = 0;
    // controls.lookSpeed = 0.125;
    // controls.lookVertical = true;
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
    //rectLight1.height = 1;
    //light.position.set(0, 1, -1);
}

function addFloor() {
    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    mshStdFloor.position.set(0, 0, 0);
    scene.add(mshStdFloor);

    // const geoFloor = new THREE.BoxGeometry(100, 10, 100);
    // const matStdFloor = new THREE.MeshStandardMaterial({
    //     color: 0x808080,
    //     roughness: 0.1,
    //     metalness: 0,
    // });
    // const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    // mshStdFloor.position.set(0, 10, 0);
    // scene.add(mshStdFloor);
}

function addCube() {
    const texture = new THREE.TextureLoader().load(rg);
    texture.magFilter = THREE.NearestFilter;

    console.log(texture);
    var cubeMaterialArray = [];

    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff }));
    cubeMaterialArray.push(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 }));

    const pos = new THREE.BoxGeometry(100, 100, 100);
    // const math = new THREE.MeshStandardMaterial({
    //     map: texture,
    //     side: THREE.FrontSide,
    //     color: 0xffffff,
    //     roughness: 0,
    //     metalness: 0.2,
    // });
    // const math = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.2 });
    const cube = new THREE.Mesh(pos, cubeMaterialArray);
    scene.add(cube);
    cube.position.set(0, 50, -200);
}

function animate() {
    requestAnimationFrame(animate);

    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
    // controls.update(clock.getDelta());
    updateArr.forEach((func) => func());

    analyser.getByteFrequencyData(Arr);
}

init();
animate();

let analyser: AnalyserNode;
function addMicroAudio() {
    const context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
        })
        .then((stream) => {
            const src = context.createMediaStreamSource(stream);
            src.connect(analyser);
        });
}

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

    window.addEventListener('mousedown', (key) => {
        console.log(Arr);
    });

    // navigator.mediaDevices
    //     .getUserMedia({
    //         audio: true,
    //     })
    //     .then((stream) => {
    //         const src = context.createMediaStreamSource(stream);
    //         src.connect(analyser);
    //     });
}
