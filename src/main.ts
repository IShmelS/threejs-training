import * as THREE from 'three';
import {
    EffectComposer,
    RenderPass,
    BloomEffect,
    ChromaticAberrationEffect,
    EffectPass,
    FXAAEffect,
    BlendFunction,
} from 'postprocessing';

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
const { audioContext, audioAnalyser } = initMusic();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

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
        const height = audioFrequencies[i * 5] || 0;
        const t = height / 255;

        const color1 = new THREE.Color('#BF0ACF');
        const color2 = new THREE.Color('#9B59B6');
        const color3 = new THREE.Color('#00f7ff');
        const color4 = new THREE.Color('#00FFFF');

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

        mesh.color.set(interpolatedColor);

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

const bloomEffect = new BloomEffect({
    intensity: 0.9,
    luminanceThreshold: 0.5,
});

const chromaticAberrationEffect = new ChromaticAberrationEffect({
    offset: new THREE.Vector2(0.005, 0.005),
    radialModulation: true,
    modulationOffset: 0.6,
});

const fxaaEffect = new FXAAEffect({ blendFunction: BlendFunction.NORMAL });

const effectPass = new EffectPass(camera, fxaaEffect, bloomEffect, chromaticAberrationEffect);
composer.addPass(effectPass);

const animate = () => {
    requestAnimationFrame(animate);
    composer.render();

    crystalAnimation(audioFrequencies[20]);
    starsAnimation(audioFrequencies[30]);
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
