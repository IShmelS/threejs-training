import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

export const initScene = () => {
    camera.position.set(-30000, 30000, -30000);
    // camera.position.set(-500, 0, 0);

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    scene.background = new THREE.Color(0, 0, 0);

    return { scene, camera, renderer };
};
