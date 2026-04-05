import * as THREE from 'three';

export async function loadIslands(scene) {
    const islands = [];

    const configuration = [
        { name: 'Home Island', type: 'home', pos: { x: 0, y: 0, z: 0 } },
        { name: 'Advanced Skills', type: 'skills', pos: { angle: 0 } },
        { name: 'Projects Island', type: 'projects', pos: { angle: 1 } },
        { name: 'Resume Island', type: 'resume', pos: { angle: 2 } },
        { name: 'Education Island', type: 'education', pos: { angle: 3 } },
        { name: 'Certification Island', type: 'certification', pos: { angle: 4 } },
        { name: 'Contact Island', type: 'home', pos: { angle: 5 } }
    ];

    const radius = 60; 

    configuration.forEach((config) => {
        const island = createIsland(config.type);
        island.name = config.name;

        if (config.pos.x !== undefined) {
            island.position.set(config.pos.x, config.pos.y || 0, config.pos.z);
        } else {
            const angle = (config.pos.angle / 6) * Math.PI * 2;
            island.position.x = Math.cos(angle) * radius;
            island.position.z = Math.sin(angle) * radius;
            island.position.y = Math.random() * 10 - 5;
        }

        island.userData = {
            name: config.name,
            initialY: island.position.y,
            floatOffset: Math.random() * Math.PI * 2
        };

        scene.add(island);
        islands.push(island);
    });

    return islands;
}

// --- HELPER: NOISE ---
function noise(x, y, z) {
    return Math.sin(x * 1.5) * Math.cos(y * 1.1) + Math.sin(z * 0.8) * 0.5 + Math.sin((x+y+z)*2.5) * 0.2;
}

// --- PROCEDURAL TEXTURE HELPERS ---
function createNoiseTexture(color1, color2, scale = 1, isRock = false) {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, size, size);
    
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = (Math.random() * 30 + 10) * scale;
        const h = (Math.random() * 10 + 5) * scale;
        ctx.fillStyle = color2;
        ctx.globalAlpha = isRock ? 0.05 : 0.1;
        ctx.fillRect(x, y, w, h);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

const rockTexture = createNoiseTexture('#606060', '#303030', 2, true);
const woodTexture = createNoiseTexture('#5d4037', '#3e2723', 4);

// --- MATERIALS ---
const matRock = new THREE.MeshStandardMaterial({ 
    map: rockTexture,
    roughness: 1.0,
    metalness: 0.1,
    flatShading: true
});

const matWood = new THREE.MeshStandardMaterial({ 
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.0
});

const matRoof = new THREE.MeshStandardMaterial({ 
    color: 0x1a2327, 
    roughness: 0.3, 
    metalness: 0.2 
});

const matWindow = new THREE.MeshStandardMaterial({
    color: 0xffcc33,
    emissive: 0xffaa00,
    emissiveIntensity: 2.0
});

const matWater = new THREE.MeshStandardMaterial({ 
    color: 0x80deea, 
    transparent: true, 
    opacity: 0.4, 
    emissive: 0x00bcd4,
    emissiveIntensity: 0.6
});

function createIsland(type) {
    const group = new THREE.Group();

    // 1. TERRAIN: Craggy Rock (V-Shape from reference)
    const rockGeo = new THREE.IcosahedronGeometry(12, 10);
    const pos = rockGeo.attributes.position;
    const vec = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
        vec.fromBufferAttribute(pos, i);
        
        let n = noise(vec.x * 0.2, vec.y * 0.2, vec.z * 0.2) * 2;
        n += noise(vec.x * 0.5, vec.y * 0.5, vec.z * 0.5) * 1;
        
        // V-Shape: Taper bottom
        if (vec.y < 0) {
            const taper = 1.0 + (vec.y / 12); // Tapers to 0 at y=-12
            vec.x *= Math.max(0.1, taper);
            vec.z *= Math.max(0.1, taper);
            n *= 2; // More crags at bottom
        } else {
            // Flatten top for grass
            vec.y *= 0.8;
            n *= 0.5;
        }

        vec.addScaledVector(vec.clone().normalize(), n);
        pos.setXYZ(i, vec.x, vec.y, vec.z);
    }
    rockGeo.computeVertexNormals();
    const rock = new THREE.Mesh(rockGeo, matRock);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    // 2. GRASS LAYER
    const grassGeo = new THREE.CircleGeometry(11, 32);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 1.0 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 1.5;
    grass.receiveShadow = true;
    group.add(grass);

    // 3. STRUCTURES
    const structure = createDetailedStructure(type);
    structure.position.y = 1.6;
    group.add(structure);

    return group;
}

function createDetailedStructure(type) {
    const group = new THREE.Group();

    switch (type) {
        case "home": {
            // LARGE CENTRAL TREE
            const tree = createBranchingTree();
            tree.position.set(0, 0, 0);
            group.add(tree);

            // PAGODAS
            const mainPagoda = createAdvancedPagoda(1.5);
            mainPagoda.position.set(0, 0, 6);
            group.add(mainPagoda);

            const sidePagoda = createAdvancedPagoda(1.0);
            sidePagoda.position.set(-8, 0, -2);
            group.add(sidePagoda);

            // BRIDGE
            const bridgeGeo = new THREE.BoxGeometry(8, 0.4, 1.5);
            const bridge = new THREE.Mesh(bridgeGeo, matWood);
            bridge.position.set(-4, 1, 2);
            bridge.rotation.y = Math.PI / 4;
            group.add(bridge);

            // WATERFALLS
            for(let i=0; i<3; i++) {
                const waterGroup = new THREE.Group();
                const waterFall = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 20, 12, 1, true), matWater);
                waterFall.position.set(10, -8, 0);
                waterFall.rotation.y = (i * Math.PI * 2) / 3;
                waterGroup.add(waterFall);
                group.add(waterGroup);
            }

            break;
        }
        
        default: {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshStandardMaterial({color: 0x4fc3f7}));
            cube.position.y = 2;
            group.add(cube);
        }
    }

    return group;
}

function createAdvancedPagoda(scale) {
    const p = new THREE.Group();
    p.scale.set(scale, scale, scale);

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), matWood);
    base.position.y = 1.5;
    p.add(base);

    // Windows
    for(let i=0; i<4; i++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matWindow);
        if(i === 0) win.position.set(0, 1.5, 2.01);
        if(i === 1) win.position.set(0, 1.5, -2.01);
        if(i === 2) { win.position.set(2.01, 1.5, 0); win.rotation.y = Math.PI/2; }
        if(i === 3) { win.position.set(-2.01, 1.5, 0); win.rotation.y = -Math.PI/2; }
        p.add(win);
    }

    // Layered Roofs
    for(let i=0; i<3; i++){
        const roofGeo = new THREE.CylinderGeometry(0.1, 4 - i*0.8, 1.5, 4, 1);
        const roof = new THREE.Mesh(roofGeo, matRoof);
        roof.position.y = 3 + i * 1.5;
        roof.rotation.y = Math.PI/4;
        p.add(roof);
    }

    return p;
}

function createBranchingTree() {
    const tree = new THREE.Group();
    
    // TRUNK
    const trunkData = [
        { r1: 1.5, r2: 1.2, h: 6, y: 3 },
        { r1: 1.2, r2: 0.8, h: 6, y: 9, twist: 1 },
        { r1: 0.8, r2: 0.4, h: 4, y: 14, twist: -1 }
    ];

    trunkData.forEach(d => {
        const geo = new THREE.CylinderGeometry(d.r2, d.r1, d.h, 12);
        const mesh = new THREE.Mesh(geo, matWood);
        mesh.position.y = d.y;
        if(d.twist) mesh.rotation.z = d.twist * 0.2;
        tree.add(mesh);
    });

    // BRANCHES & LEAVES
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 1.0 });
    for(let i=0; i<30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 4 + Math.random() * 6;
        const y = 14 + Math.random() * 8;
        
        const leafClump = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random()*2, 8, 8), leafMat);
        leafClump.position.set(Math.cos(angle)*rad, y, Math.sin(angle)*rad);
        leafClump.scale.y = 0.6;
        tree.add(leafClump);
    }

    return tree;
}

export function animateIslands(islands, time) {
    islands.forEach(island => {
        const offset = island.userData.floatOffset;
        island.position.y = island.userData.initialY + Math.sin(time * 0.001 + offset) * 2;
        island.rotation.y += 0.0005;
    });
}
