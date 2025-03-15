import * as THREE from 'three';

export const createVortex = (scene: THREE.Scene, height: number = 4000000, maxRadius: number = 200000) => {
    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const segments = 32;
    const heightSteps = 200;
    const stepHeight = height / heightSteps;

    const getRadius = (y: number) => {
        const midHeight = height / 2;
        const distanceFromMid = Math.abs(y - midHeight);
        return maxRadius * (1 - Math.abs(distanceFromMid / midHeight) * 0.5);
    };

    const distances = [];
    for (let i = 0; i <= heightSteps; i++) {
        const y = -height + i * stepHeight;
        const radius = getRadius(y);
        const twist = y * 0.5;

        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2 + twist;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            vertices.push(x, y, z);
            distances.push(y + height / 2);
        }
    }

    const indices = [];
    for (let i = 0; i < heightSteps; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = i * (segments + 1) + (j + 1);
            const c = (i + 1) * (segments + 1) + (j + 1);
            const d = (i + 1) * (segments + 1) + j;

            indices.push(a, b, c);
            indices.push(a, c, d);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('distance', new THREE.Float32BufferAttribute(distances, 1));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const vertexShader = `
        attribute float distance;
        varying float vDistance;

        void main() {
            vDistance = distance;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float height;
        varying float vDistance;

        void main() {
            float maxDistance = 2000000.0;

            float factor = abs(vDistance / maxDistance);

            vec3 color = vec3(
                (255.0 * factor - 50.0 / 255.0) / 255.0 + (50.0 / 255.0),
                (height - 100.0) / 255.0 + (100.0 / 255.0),
                1
            );
            gl_FragColor = vec4(color, -factor + 0.5);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            height: { value: 0.0 },
        },
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        // depthTest: true,
    });

    const vortex = new THREE.Mesh(geometry, material);
    scene.add(vortex);

    vortex.position.y = 2000000;

    return vortex;
};

export const animateRetroVortex = (vortex: THREE.Mesh) => {
    return (height: number) => {
        (vortex.material as THREE.ShaderMaterial).uniforms.height.value = height;
    };
};
