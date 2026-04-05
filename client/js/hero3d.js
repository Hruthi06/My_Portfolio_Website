/**
 * hero3d.js – Futuristic 3D floating tech island for the hero section.
 * Built with Three.js. Features: floating platform, code screens,
 * server rack, spinning rings, ambient glow, and smooth animation.
 */

import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
if (!canvas) throw new Error('hero-canvas not found');

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.offsetWidth || 500, canvas.offsetHeight || 500);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ---- Scene ----
const scene = new THREE.Scene();

// ---- Camera ----
const W = canvas.offsetWidth || 500;
const H = canvas.offsetHeight || 500;
const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
camera.position.set(0, 8, 22);
camera.lookAt(0, 0, 0);

// ---- Lights ----
const ambient = new THREE.AmbientLight(0x0a0a2e, 2);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
mainLight.position.set(10, 20, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(1024, 1024);
mainLight.shadow.camera.near = 0.1;
mainLight.shadow.camera.far = 80;
mainLight.shadow.camera.left = -20;
mainLight.shadow.camera.right = 20;
mainLight.shadow.camera.top = 20;
mainLight.shadow.camera.bottom = -20;
mainLight.shadow.bias = -0.001;
scene.add(mainLight);

// Purple fill
const purpleLight = new THREE.PointLight(0x8b5cf6, 6, 30);
purpleLight.position.set(-6, 6, 5);
scene.add(purpleLight);

// Blue fill
const blueLight = new THREE.PointLight(0x3b82f6, 5, 30);
blueLight.position.set(8, 2, 8);
scene.add(blueLight);

// Cyan accent
const cyanLight = new THREE.PointLight(0x06b6d4, 4, 20);
cyanLight.position.set(0, 10, -5);
scene.add(cyanLight);

// ---- Materials ----
const matIsland = new THREE.MeshStandardMaterial({
    color: 0x1a1a3e,
    roughness: 0.7,
    metalness: 0.15,
});
const matDark = new THREE.MeshStandardMaterial({
    color: 0x0f0f2e,
    roughness: 0.8,
    metalness: 0.1,
});
const matGlowPurple = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x8b5cf6,
    emissiveIntensity: 1.0,
    roughness: 0.4,
    metalness: 0.6,
});
const matGlowBlue = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.9,
    roughness: 0.4,
    metalness: 0.6,
});
const matGlowCyan = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.2,
    roughness: 0.3,
    metalness: 0.7,
});
const matScreen = new THREE.MeshStandardMaterial({
    color: 0x0d1117,
    emissive: 0x1a3a6e,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.5,
});
const matMetal = new THREE.MeshStandardMaterial({
    color: 0x1e2240,
    roughness: 0.3,
    metalness: 0.8,
});
const matGreenGlow = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 1.5,
    roughness: 0.3,
    metalness: 0.5,
});
const matOrangeGlow = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xf97316,
    emissiveIntensity: 1.0,
    roughness: 0.4,
    metalness: 0.5,
});
const matRing = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.9,
    wireframe: false,
    transparent: true,
    opacity: 0.7,
});

// ---- Helper: create canvas texture for screen content ----
function makeScreenTexture(lines, bgColor = '#0d1117', lineColor = '#58a6ff', accentColor = '#3fb950') {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    // Grid lines background
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }
    // Code lines
    ctx.font = '11px monospace';
    const lineH = 18;
    lines.forEach((line, i) => {
        const y = 20 + i * lineH;
        if (line.startsWith('//')) {
            ctx.fillStyle = '#6e7681';
        } else if (line.startsWith('@') || line.includes('class') || line.includes('return')) {
            ctx.fillStyle = '#c792ea';
        } else if (line.includes('"') || line.includes("'")) {
            ctx.fillStyle = accentColor;
        } else {
            ctx.fillStyle = lineColor;
        }
        ctx.fillText(line, 10, y);
    });
    // Blinking cursor
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(10, 20 + lines.length * lineH, 8, 2);
    return new THREE.CanvasTexture(c);
}

const screenTex1 = makeScreenTexture([
    '// Spring Boot API',
    '@RestController',
    'class UserController {',
    '  @GetMapping("/users")',
    '  List<User> getAll() {',
    '    return service',
    '      .findAll();',
    '  }',
    '}',
]);
const screenTex2 = makeScreenTexture([
    '// JWT Auth',
    '@PostMapping("/login")',
    'String login(@Body',
    '  LoginRequest req) {',
    '  String token =',
    '    jwtService',
    '    .generate(req);',
    '  return token;',
    '}',
], '#0d1117', '#82aaff', '#c3e88d');

// ---- ISLAND BASE ----
const islandGroup = new THREE.Group();
scene.add(islandGroup);

// Main platform — rounded hexagonal prism approximated with cylinder
const basePlatGeo = new THREE.CylinderGeometry(8, 9, 1.2, 6);
const basePlatMesh = new THREE.Mesh(basePlatGeo, matIsland);
basePlatMesh.position.y = -0.6;
basePlatMesh.castShadow = true;
basePlatMesh.receiveShadow = true;
islandGroup.add(basePlatMesh);

// Bottom tapered rock
const rockGeo = new THREE.CylinderGeometry(5, 2, 3, 6);
const rockMesh = new THREE.Mesh(rockGeo, matDark);
rockMesh.position.y = -2.7;
rockMesh.castShadow = true;
islandGroup.add(rockMesh);

// Bottom tip
const tipGeo = new THREE.ConeGeometry(2, 2, 6);
const tipMesh = new THREE.Mesh(tipGeo, matDark);
tipMesh.position.y = -4.7;
tipMesh.castShadow = true;
islandGroup.add(tipMesh);

// Platform edge glowing ring
const edgeRingGeo = new THREE.TorusGeometry(8, 0.1, 8, 48);
const edgeRing = new THREE.Mesh(edgeRingGeo, matGlowPurple);
edgeRing.rotation.x = Math.PI / 2;
edgeRing.position.y = 0;
islandGroup.add(edgeRing);

// ---- SERVER RACK ----
const serverGroup = new THREE.Group();
serverGroup.position.set(-4.5, 0, -2);
islandGroup.add(serverGroup);

const rackBodyGeo = new THREE.BoxGeometry(2.2, 3.5, 1.5);
const rackBody = new THREE.Mesh(rackBodyGeo, matMetal);
rackBody.position.y = 1.75;
rackBody.castShadow = true;
serverGroup.add(rackBody);

// Server unit slots
for (let i = 0; i < 5; i++) {
    const slotGeo = new THREE.BoxGeometry(1.8, 0.4, 0.15);
    const slot = new THREE.Mesh(slotGeo, matDark);
    slot.position.set(0, 0.5 + i * 0.6, 0.68);
    serverGroup.add(slot);
    // LED on each slot
    const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        i % 2 === 0 ? matGlowBlue : matGreenGlow
    );
    led.position.set(0.7, 0.5 + i * 0.6, 0.75);
    serverGroup.add(led);
}

// Antenna
const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6);
const ant = new THREE.Mesh(antGeo, matMetal);
ant.position.set(0.6, 3.75, 0);
serverGroup.add(ant);
const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), matGlowCyan);
antTip.position.set(0.6, 4.55, 0);
serverGroup.add(antTip);

// ---- MONITOR / CODESCREENS ----
// Screen stand 1
const screen1Group = new THREE.Group();
screen1Group.position.set(2, 0, -1);
islandGroup.add(screen1Group);

const stand1Geo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8);
const stand1 = new THREE.Mesh(stand1Geo, matMetal);
stand1.position.y = 0.6;
screen1Group.add(stand1);

const desk1Geo = new THREE.BoxGeometry(1.2, 0.08, 0.6);
const desk1 = new THREE.Mesh(desk1Geo, matMetal);
desk1.position.y = 0.04;
screen1Group.add(desk1);

const monitor1Geo = new THREE.BoxGeometry(2.8, 1.8, 0.12);
const monitor1 = new THREE.Mesh(monitor1Geo, matMetal);
monitor1.position.set(0, 2.2, 0);
monitor1.rotation.x = -0.15;
screen1Group.add(monitor1);

const screen1FrameGeo = new THREE.BoxGeometry(2.6, 1.62, 0.05);
const screen1Frame = new THREE.Mesh(screen1FrameGeo, new THREE.MeshStandardMaterial({
    map: screenTex1,
    emissive: 0x1a3a6e,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.3,
}));
screen1Frame.position.set(0, 2.2, 0.085);
screen1Frame.rotation.x = -0.15;
screen1Group.add(screen1Frame);

// Screen 2 (angled/smaller)
const screen2Group = new THREE.Group();
screen2Group.position.set(4.5, 0, 1.5);
screen2Group.rotation.y = -0.7;
islandGroup.add(screen2Group);

const stand2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), matMetal);
stand2.position.y = 0.45;
screen2Group.add(stand2);

const monitor2Geo = new THREE.BoxGeometry(2.2, 1.4, 0.1);
const monitor2 = new THREE.Mesh(monitor2Geo, matMetal);
monitor2.position.set(0, 1.7, 0);
monitor2.rotation.x = -0.1;
screen2Group.add(monitor2);

const screen2Frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.22, 0.04), new THREE.MeshStandardMaterial({
    map: screenTex2,
    emissive: 0x1a4422,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.3,
}));
screen2Frame.position.set(0, 1.7, 0.07);
screen2Frame.rotation.x = -0.1;
screen2Group.add(screen2Frame);

// ---- FLOATING RINGS ----
const rings = [];
const ringData = [
    { r: 11, tube: 0.08, rot: [0, 0, 0.4], mat: matRing.clone() },
    { r: 13, tube: 0.06, rot: [0.5, 0, 0.1], mat: matRing.clone() },
    { r: 9.5, tube: 0.05, rot: [-0.3, 0, -0.2], mat: matRing.clone() },
];
ringData.forEach((rd, i) => {
    const rm = matRing.clone();
    rm.opacity = 0.35 + i * 0.1;
    const rGeo = new THREE.TorusGeometry(rd.r, rd.tube, 8, 64);
    const rMesh = new THREE.Mesh(rGeo, rm);
    rMesh.rotation.set(...rd.rot);
    scene.add(rMesh);
    rings.push(rMesh);
});

// ---- FLOATING CODE PARTICLES ----
const particleCount = 80;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
}
const partGeo = new THREE.BufferGeometry();
partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const partMat = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
});
const particles = new THREE.Points(partGeo, partMat);
scene.add(particles);

// ---- SMALL FLOATING CUBES (tech debris) ----
const debrisList = [];
const debrisColors = [0x8b5cf6, 0x3b82f6, 0x06b6d4, 0x22c55e];
for (let i = 0; i < 12; i++) {
    const sz = 0.1 + Math.random() * 0.25;
    const dGeo = new THREE.BoxGeometry(sz, sz, sz);
    const dMat = new THREE.MeshStandardMaterial({
        color: debrisColors[i % debrisColors.length],
        emissive: debrisColors[i % debrisColors.length],
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.7,
    });
    const d = new THREE.Mesh(dGeo, dMat);
    const angle = (i / 12) * Math.PI * 2;
    const radius = 9 + Math.random() * 4;
    d.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius
    );
    d.userData = {
        radius,
        angle,
        speed: 0.004 + Math.random() * 0.006,
        yOffset: d.position.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatPhase: Math.random() * Math.PI * 2,
    };
    scene.add(d);
    debrisList.push(d);
}

// ---- GLOW SPHERE (under island) ----
const glowGeo = new THREE.SphereGeometry(4, 16, 16);
const glowMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.08,
});
const glowSphere = new THREE.Mesh(glowGeo, glowMat);
glowSphere.position.y = -3;
islandGroup.add(glowSphere);

// ---- RESIZE ----
function onResize() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w && h) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
}
window.addEventListener('resize', onResize);
onResize();

// ---- MOUSE PARALLAX ----
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ---- ANIMATE ----
let t = 0;
function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    // Smooth mouse follow
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Island gentle float + mouse tilt
    islandGroup.position.y = Math.sin(t * 0.6) * 0.4;
    islandGroup.rotation.y += 0.003;
    islandGroup.rotation.x = mouse.y * 0.06;
    islandGroup.rotation.z = -mouse.x * 0.04;

    // Rings spin
    rings.forEach((r, i) => {
        r.rotation.y += (0.003 + i * 0.001) * (i % 2 === 0 ? 1 : -1);
        r.rotation.x += 0.001 * (i % 2 === 0 ? -1 : 1);
    });

    // Debris orbit
    debrisList.forEach(d => {
        d.userData.angle += d.userData.speed;
        d.position.x = Math.cos(d.userData.angle) * d.userData.radius;
        d.position.z = Math.sin(d.userData.angle) * d.userData.radius;
        d.position.y = d.userData.yOffset + Math.sin(t * d.userData.floatSpeed + d.userData.floatPhase) * 0.8;
        d.rotation.x += 0.02;
        d.rotation.y += 0.015;
    });

    // Particles slow drift
    particles.rotation.y += 0.001;

    // Purple light pulse
    purpleLight.intensity = 5 + Math.sin(t * 1.2) * 1.5;
    cyanLight.intensity = 3.5 + Math.cos(t * 0.8) * 1;

    // Camera gentle drift
    camera.position.x = Math.sin(t * 0.15) * 1.5 + mouse.x * 0.8;
    camera.position.y = Math.cos(t * 0.1) * 0.5 + 8 + mouse.y * 0.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();
