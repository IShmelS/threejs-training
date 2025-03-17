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

import { addDevStats } from './tools/addDevStats';

import { initScene } from './core/scene';
import { initControls, initMouseMove } from './core/controls';
import { initMusic } from './core/initMusic';
import { createPillar, animatePillar } from './objects/pillar';
import { createLights } from './lighting/lights';

import { createMainCrystal, animateCrystal } from './objects/mainCrystal';
import { createVortex, animateRetroVortex as animateVortex } from './objects/vortex';
import { createStars, animateStars } from './background/mainBackground';

import './styles/main.scss';

// dev
const devStats = addDevStats(0);

// core
const { scene, camera, renderer } = initScene();
const { audioContext, audioAnalyser } = initMusic();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
createLights(scene);

composer.addPass(renderPass);

//audio
const audioFrequencies = new Uint8Array(audioAnalyser.frequencyBinCount);

// user interaction with scene
const controls = initControls(camera, renderer);
const mouseMove = initMouseMove();

// objects
const mainCrystal = createMainCrystal(scene);
const stars = createStars(scene);
const vortex = createVortex(scene);
const pillars = Array.from({ length: 20 }, (_, i) => {
    const positionZ = 3000 * Math.sin(i * ((2 * Math.PI) / 20));
    const positionX = 3000 * Math.cos(i * ((2 * Math.PI) / 20));
    const rotateY = -Math.atan2(positionZ, positionX);

    return createPillar(scene, positionZ, positionX, rotateY);
});

// objects animations
const crystalAnimation = animateCrystal(mainCrystal);
const starsAnimation = animateStars(stars);
const vortexAnimation = animateVortex(vortex);
const pillarsAnimation = pillars.map((e, i) => animatePillar(e, i));

//post effects
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

// main loop
const animate = () => {
    // render
    requestAnimationFrame(animate);
    composer.render();

    // audio
    void audioAnalyser.getByteFrequencyData(audioFrequencies);

    // interaction

    // animations
    crystalAnimation(audioFrequencies[20]);
    starsAnimation(audioFrequencies[30], audioFrequencies[10]);
    vortexAnimation(audioFrequencies[20]);
    pillarsAnimation.forEach((f) => f(audioFrequencies));

    // dev
    devStats.update();
};
animate();
