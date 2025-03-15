import * as THREE from 'three';

export const createCube = (scene: THREE.Scene) => {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    return cube;
};
