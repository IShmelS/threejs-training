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
    for (let i = 0; i < 20000; i++) {
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
        uniform float height;
        varying float vDistance;
        void main() {
            float maxDistance = 2000000.0;
            float factor = clamp(vDistance / maxDistance, 0.0, 1.0);

            vec3 color = vec3(
                (255.0 * factor - 50.0 / 255.0) / 255.0 + (50.0 / 255.0),
                (height - 200.0) / 255.0 + (200.0 / 255.0),
                1
            );
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const starMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            height: { value: 0.0 },
        },
        clipping: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    return stars;
};

export const animateStars = (stars: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>) => {
    return (height: number) => {
        stars.material.uniforms.height.value = height;
    };
};
