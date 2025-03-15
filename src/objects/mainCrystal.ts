import * as THREE from 'three';

export const createMainCrystal = (scene: THREE.Scene) => {
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        // Верхняя точка 0
        0, 120, 0,
        // Верхнее основание (5 точек) 1 2 3 4 5
        40, 50, 30, 50, 60, -20, -10, 40, -50, -40, 50, 0, 0, 45, 50,
        // Нижнее основание (5 точек) 6 7 8 9 10
        50, -40, 20, 30, -50, -40, -20, -60, -30, -50, -50, 10, 10, -45, 40,
        // Нижняя точка 11
        0, -130, 0,
    ]);

    const indices = [
        0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 8, 3, 8, 4, 4, 8, 9, 4, 9, 5, 5,
        9, 10, 5, 10, 1, 1, 10, 6, 6, 11, 7, 7, 11, 8, 8, 11, 9, 9, 11, 10, 10, 11, 6,
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
        color: 0x00f7ff,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.7,
        // shininess: 100,
    });

    const crystal = new THREE.Mesh(geometry, material);

    crystal.scale.x = 10;
    crystal.scale.y = 10;
    crystal.scale.z = 10;

    scene.add(crystal);

    return crystal;
};

export const animateCrystal = (crystal: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>) => {
    return (height: number) => {
        crystal.rotateY(0.0015);
        // crystal.material.color
        crystal.material.emissive = new THREE.Color().setRGB(height / 255, (255 - height) / 255, 255);
    };
};
