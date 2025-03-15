import * as THREE from 'three';

export const createLights = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // const pointLight = new THREE.PointLight(0xffffff, 1, 10000);
    // pointLight.position.set(0, 0, 0);
    // scene.add(pointLight);
};
