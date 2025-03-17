import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const initControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    return controls;
};

export const initMouseMove = () => {
    const mouseVector = new THREE.Vector2();
    const mouseRayCaster = new THREE.Raycaster();
    let isMouseClick = false;

    window.addEventListener('mousemove', (e) => {
        mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', (e) => {
        isMouseClick = !isMouseClick;
    });

    return () => ({ mouseVector, mouseRayCaster, isMouseClick });
};
