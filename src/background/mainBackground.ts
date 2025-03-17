import * as THREE from 'three';

const createStarsPosition = (offset: number, maxRadius: number) => {
    const radius = offset + Math.random() * maxRadius;

    // Случайные углы для сферических координат
    const theta = Math.random() * Math.PI; // Угол от 0 до PI (наклон)
    const phi = Math.random() * 2 * Math.PI; // Угол от 0 до 2PI (вращение)

    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.cos(theta);
    const z = radius * Math.sin(theta) * Math.sin(phi);

    return [x, y, z];
};

export const createStars = (scene: THREE.Scene) => {
    const starVertices = [];
    const distances = [];
    for (let i = 0; i < 6000; i++) {
        const pos1 = createStarsPosition(10000, 50000);
        const pos2 = createStarsPosition(50000, 100000);
        const pos3 = createStarsPosition(100000, 2000000);

        starVertices.push(...pos1, ...pos2, ...pos3);

        distances.push(
            Math.sqrt(pos1[0] * pos1[0] + pos1[1] * pos1[1] + pos1[2] * pos1[2]),
            Math.sqrt(pos2[0] * pos2[0] + pos2[1] * pos2[1] + pos2[2] * pos2[2]),
            Math.sqrt(pos3[0] * pos3[0] + pos3[1] * pos3[1] + pos3[2] * pos3[2]),
        );
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeo.setAttribute('distance', new THREE.Float32BufferAttribute(distances, 1));
    starGeo.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(starVertices.length).fill(0), 1));

    const vertexShader = `
        attribute float distance;
        varying float vDistance;

        void main() {
            vDistance = distance;
            gl_PointSize = 1.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float amplitude;
        varying float vDistance;

        void main() {
            float maxDistance = 2000000.0;
            float factor = clamp(vDistance / maxDistance, 0.0, 1.0);

            vec3 color = vec3(
                (255.0 * factor - 50.0 / 255.0) / 255.0 + (50.0 / 255.0),
                (amplitude - 200.0) / 255.0 + (200.0 / 255.0),
                1.0
            );
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const starMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            amplitude: { value: 0.0 },
        },
        clipping: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    return stars;
};

export const animateStars = (
    stars: THREE.Points<
        THREE.BufferGeometry<THREE.NormalBufferAttributes>,
        THREE.ShaderMaterial,
        THREE.Object3DEventMap
    >,
) => {
    const positions = stars.geometry.attributes.position.array;
    const originalPositions = [...stars.geometry.attributes.position.array];
    const velocities = stars.geometry.attributes.velocity.array;

    const influenceRadius = 200000;
    const starAcceleration = 0.00007;
    const starReturnAcceleration = 0.00005;
    const starMaxSpeed = 50;
    const dumping = 0.99;

    return (amplitude30: number, amplitude20: number) => {
        // color
        stars.material.uniforms.amplitude.value = amplitude30;

        // position
        const time = Date.now();
        const sinByTime = Math.sin(time);
        const cosByTime = Math.cos(time);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            const origX = originalPositions[i];
            const origY = originalPositions[i + 1];
            const origZ = originalPositions[i + 2];

            velocities[i] = Math.max(-starMaxSpeed, Math.min(starMaxSpeed, velocities[i]));
            velocities[i + 1] = Math.max(-starMaxSpeed, Math.min(starMaxSpeed, velocities[i + 1]));
            velocities[i + 2] = Math.max(-starMaxSpeed, Math.min(starMaxSpeed, velocities[i + 2]));

            const distanceToXAxis = Math.sqrt(y * y + z * z);
            const distanceToYAxis = Math.sqrt(x * x + z * z);
            const distanceToZAxis = Math.sqrt(x * x + y * y);
            const orbitRadius = (distanceToZAxis + distanceToXAxis) / 2 + 2500;

            if (
                amplitude20 &&
                distanceToXAxis < influenceRadius &&
                distanceToYAxis < influenceRadius &&
                distanceToZAxis < influenceRadius
            ) {
                const orbitX = orbitRadius * Math.cos(distanceToYAxis * 0.001) * (distanceToXAxis / orbitRadius);
                const orbitY = y;
                const orbitZ = orbitRadius * Math.sin(distanceToYAxis * 0.001) * (distanceToZAxis / orbitRadius);

                // Ускорение к орбите
                velocities[i] += (orbitX - x) * starAcceleration;
                velocities[i + 1] += (orbitY - y) * starAcceleration;
                velocities[i + 2] += (orbitZ - z) * starAcceleration;
            } else {
                const velocityToOriginX = (origX - x) * starReturnAcceleration;
                const velocityToOriginY = (origY - y) * starReturnAcceleration;
                const velocityToOriginZ = (origZ - z) * starReturnAcceleration;

                velocities[i] += (sinByTime / 10) * 0.999 + velocityToOriginX;
                velocities[i + 1] += (cosByTime / 10) * 0.999 + velocityToOriginY;
                velocities[i + 2] += (sinByTime / 10) * 0.999 + velocityToOriginZ;

                velocities[i] = (velocities[i] + velocityToOriginX) * dumping;
                velocities[i + 1] = (velocities[i + 1] + velocityToOriginY) * dumping;
                velocities[i + 2] = (velocities[i + 2] + velocityToOriginZ) * dumping;
            }

            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
        }

        stars.geometry.attributes.position.needsUpdate = true;
    };
};
