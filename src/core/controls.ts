import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const initControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    return controls;
};
