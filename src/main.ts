import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import { initScene } from './core/scene';
import { initControls } from './core/controls';
import { initMusic } from './core/initMusic';
import { createCube } from './objects/cube';
import { createLights } from './lighting/lights';

import { addDevStats } from './tools/addDevStats';
import { createMainCrystal, animateCrystal } from './objects/mainCrystal';
import { createStars, animateStars } from './background/mainBackground';

import './styles/main.scss';
import { createVortex, animateRetroVortex } from './objects/vortex';

const devStats = addDevStats(0);

const { scene, camera, renderer } = initScene();
const { audioContext, audioAnalyser, audio } = initMusic();

const audioFrequencies = new Uint8Array(audioAnalyser.frequencyBinCount);

const controls = initControls(camera, renderer);

const mainCrystal = createMainCrystal(scene);
const stars = createStars(scene);
const vortex = createVortex(scene);

const updateArr: (() => void)[] = [];

function updateBoxGeometry(
    mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>,
    geometry: THREE.BoxGeometry,
) {
    mesh.geometry.dispose();

    mesh.geometry = geometry;
}

for (let i = 0; i < 20; i++) {
    const size = 500;
    const pos = new THREE.BoxGeometry(size, size, size);
    const mesh = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const box = new THREE.Mesh(pos, mesh);

    updateArr.push(async () => {
        const height = audioFrequencies[i * 5] * audio.volume || 0;
        const red = height ? height / 255 : 0;
        const green = height ? (255 - height) / 255 : 0;
        const blue = height ? 0.9 : 0;
        mesh.color.setRGB(red, green, blue);

        if (height) {
            box.visible = true;
        } else {
            box.visible = false;
        }

        updateBoxGeometry(box, new THREE.BoxGeometry(size, height ? height * 10 + 1 : 0, size));
    });

    box.position.z = 3000 * Math.sin(i * ((2 * Math.PI) / 20));
    box.position.x = 3000 * Math.cos(i * ((2 * Math.PI) / 20));
    box.rotateY(-Math.atan2(box.position.z, box.position.x));
    scene.add(box);
}

createLights(scene);

const crystalAnimation = animateCrystal(mainCrystal);
const starsAnimation = animateStars(stars);
const vortexAnimation = animateRetroVortex(vortex);
updateArr.forEach((func) => func());

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    crystalAnimation(audioFrequencies[20]);
    starsAnimation(audioFrequencies[20]);
    vortexAnimation(audioFrequencies[20]);

    void audioAnalyser.getByteFrequencyData(audioFrequencies);
    updateArr.forEach((func) => func());

    if (audioFrequencies[0]) {
        camera.position.x += 2;
        camera.position.y -= 0.2;
        camera.lookAt(0, 0, 0);
    }

    devStats.update();
};
animate();
