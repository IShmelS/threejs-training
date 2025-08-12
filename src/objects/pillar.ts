import * as THREE from 'three';

export const createPillar = (scene: THREE.Scene, positionZ: number, positionX: number, rotateY: number) => {
    const size = 600;
    const pos = new THREE.BoxGeometry(size, size, size);
    const mesh = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pillar = new THREE.Mesh(pos, mesh);

    pillar.position.z = positionZ;
    pillar.position.x = positionX;
    pillar.rotateY(rotateY);

    scene.add(pillar);
    return pillar;
};

function updateBoxGeometry(
    mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>,
    geometry: THREE.BoxGeometry,
) {
    mesh.geometry.dispose();
    mesh.geometry = geometry;
}

const color1 = new THREE.Color('#BF0ACF');
const color2 = new THREE.Color('#9B59B6');
const color3 = new THREE.Color('#00f7ff');
const color4 = new THREE.Color('#00FFFF');

export const animatePillar = (
    pillar: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>,
    i: number,
) => {
    const size = pillar.geometry.parameters.width;

    return (audioFrequencies: Uint8Array<ArrayBuffer>) => {
        const height = audioFrequencies[i * 5] || 0;
        const t = height / 255;
        const interpolatedColor = new THREE.Color();

        if (t < 0.33) {
            const localT = t / 0.33;
            interpolatedColor.lerpColors(color1, color2, localT);
        } else if (t < 0.66) {
            const localT = (t - 0.33) / 0.33;
            interpolatedColor.lerpColors(color2, color3, localT);
        } else {
            const localT = (t - 0.66) / 0.34;
            interpolatedColor.lerpColors(color3, color4, localT);
        }

        if (height) {
            pillar.visible = true;
        } else {
            pillar.visible = false;
        }

        pillar.material.color.set(interpolatedColor);
        updateBoxGeometry(pillar, new THREE.BoxGeometry(size, height ? height * 15 + 1 : 0, size));
    };
};
