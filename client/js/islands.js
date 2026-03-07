import * as THREE from 'three';

export async function loadIslands(scene) {
    const islands = [];

    const configuration = [
        { name: 'Home Island', type: 'home', color: 0x4facfe, pos: { x: 0, y: 0, z: 0 } },
        { name: 'Advanced Skills', type: 'skills', color: 0x00f2fe, pos: { angle: 0 } },
        { name: 'Projects Island', type: 'projects', color: 0x00f2fe, pos: { angle: 1 } },
        { name: 'Resume Island', type: 'resume', color: 0x00f2fe, pos: { angle: 2 } },
        { name: 'Education Island', type: 'education', color: 0x00f2fe, pos: { angle: 3 } },
        { name: 'Certification Island', type: 'certification', color: 0x00f2fe, pos: { angle: 4 } },
        { name: 'Contact Island', type: 'home', color: 0x00f2fe, pos: { angle: 5 } } // Reuse home for contact
    ];

    const radius = 40; // Larger radius for larger islands

    configuration.forEach((config, i) => {
        const island = createIsland(config.type);
        island.name = config.name;

        if (config.pos.x !== undefined) {
            island.position.set(config.pos.x, config.pos.y, config.pos.z);
        } else {
            const angle = (config.pos.angle / 6) * Math.PI * 2;
            island.position.x = Math.cos(angle) * radius;
            island.position.z = Math.sin(angle) * radius;
            island.position.y = Math.random() * 5 - 2.5;
        }

        // Preserve metadata for animation and interaction
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

export function createIsland(structureType = "home") {
    const island = new THREE.Group();

    // Bottom - Rocky/Conical
    const bottomGeo = new THREE.ConeGeometry(10, 12, 6);
    const bottomMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, flatShading: true });
    const bottom = new THREE.Mesh(bottomGeo, bottomMat);
    bottom.rotation.x = Math.PI;
    bottom.position.y = -5;
    island.add(bottom);

    // Hanging Roots / Stones
    for (let i = 0; i < 8; i++) {
        const rootGeo = new THREE.CylinderGeometry(0.2, 0.05, Math.random() * 8 + 4, 4);
        const rootMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
        const root = new THREE.Mesh(rootGeo, rootMat);
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 6;
        root.position.set(Math.cos(angle) * r, -10 - Math.random() * 2, Math.sin(angle) * r);
        root.rotation.z = (Math.random() - 0.5) * 0.5;
        island.add(root);
    }

    /* GRASS TOP */
    const grassGeo = new THREE.CylinderGeometry(10, 10, 2, 8);
    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x4CAF50
    });

    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = 1;
    island.add(grass);

    /* ADD STRUCTURE */
    const structure = createStructure(structureType);
    island.add(structure);

    return island;
}

function createStructure(type) {
    const group = new THREE.Group();

    switch (type) {
        case "home": {
            // Magical Tree Trunk
            const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 12, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = 6;
            group.add(trunk);

            // Tree Foliage (Canopy)
            const canopyGeo = new THREE.SphereGeometry(6, 8, 8);
            const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, transparent: true, opacity: 0.9 });
            const canopy = new THREE.Mesh(canopyGeo, canopyMat);
            canopy.position.y = 12;
            group.add(canopy);

            // Treehouse around trunk
            const hGeo = new THREE.CylinderGeometry(3, 3, 3, 8);
            const hMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
            const h = new THREE.Mesh(hGeo, hMat);
            h.position.y = 5;
            group.add(h);

            // Circular Balcony
            const balconyGeo = new THREE.TorusGeometry(3.5, 0.2, 8, 24);
            const balconyMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const balcony = new THREE.Mesh(balconyGeo, balconyMat);
            balcony.rotation.x = Math.PI / 2;
            balcony.position.y = 4;
            group.add(balcony);

            // Pond (on the grass)
            const pondGeo = new THREE.CircleGeometry(4, 32);
            const pondMat = new THREE.MeshStandardMaterial({ color: 0x00bcd4, transparent: true, opacity: 0.8 });
            const pond = new THREE.Mesh(pondGeo, pondMat);
            pond.rotation.x = -Math.PI / 2;
            pond.position.y = 1.01;
            pond.position.x = 4; // Shift to edge
            group.add(pond);

            // Waterfall
            const waterLines = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const waterGeo = new THREE.CylinderGeometry(0.2, 0.1, 15, 8);
                const waterMat = new THREE.MeshStandardMaterial({ color: 0x80deea, transparent: true, opacity: 0.6 });
                const water = new THREE.Mesh(waterGeo, waterMat);
                water.position.set(7.5 + (Math.random() - 0.5), -6.5, (Math.random() - 0.5) * 2);
                waterLines.add(water);
            }
            group.add(waterLines);
            break;
        }

        case "projects": {
            const labGeo = new THREE.BoxGeometry(6, 4, 6);
            const labMat = new THREE.MeshStandardMaterial({ color: 0x607D8B });
            const lab = new THREE.Mesh(labGeo, labMat);
            lab.position.y = 3;
            group.add(lab);
            break;
        }

        case "skills": {
            const skillGeo = new THREE.CylinderGeometry(1.5, 2.5, 10, 8);
            const skillMat = new THREE.MeshStandardMaterial({ color: 0x00BCD4 });
            const skillTower = new THREE.Mesh(skillGeo, skillMat);
            skillTower.position.y = 6;
            group.add(skillTower);
            break;
        }

        case "education": {
            const houseGeo = new THREE.BoxGeometry(5, 3, 5);
            const houseMat = new THREE.MeshStandardMaterial({ color: 0xffb74d });
            const house = new THREE.Mesh(houseGeo, houseMat);
            house.position.y = 2.5;
            group.add(house);
            break;
        }

        case "certification": {
            const templeGeo = new THREE.CylinderGeometry(3, 4, 6, 6);
            const templeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
            const temple = new THREE.Mesh(templeGeo, templeMat);
            temple.position.y = 4;
            group.add(temple);
            break;
        }

        case "resume": {
            const buildGeo = new THREE.BoxGeometry(3, 10, 3);
            const buildMat = new THREE.MeshStandardMaterial({ color: 0x9c27b0 });
            const building = new THREE.Mesh(buildGeo, buildMat);
            building.position.y = 6;
            group.add(building);
            break;
        }
    }

    return group;
}

export function animateIslands(islands, time) {
    islands.forEach(island => {
        const offset = island.userData.floatOffset;
        island.position.y = island.userData.initialY + Math.sin(time * 0.001 + offset) * 1.5;
        island.rotation.y += 0.002;
    });
}
