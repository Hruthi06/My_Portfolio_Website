import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, screenMesh;
let isInitialized = false;

function initProjects3D() {
    const modal = document.getElementById('projects-3d-modal');
    const closeBtn = document.getElementById('close-projects-3d');
    const canvas = document.getElementById('projects-3d-canvas');

    if (!modal || !closeBtn || !canvas) return;

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Expose global function to be called from portfolio.js
    window.openProject3D = function(title, desc, tags) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (!isInitialized) {
            setupScene(canvas);
            isInitialized = true;
        }
        
        updateHologram({ title, desc, tags });
    };
}

function setupScene(canvas) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x06b6d4, 2, 50); // Cyan glow
    point.position.set(0, 5, 5);
    scene.add(point);

    // Creates a curved screen (part of a cylinder)
    const geometry = new THREE.CylinderGeometry(5, 5, 6, 64, 1, true, -Math.PI / 4.5, Math.PI / 2.25);
    const material = new THREE.MeshPhongMaterial({
        color: 0x0a0a0f,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        emissive: 0x06b6d4, // glowing edges
        emissiveIntensity: 0.2,
        wireframe: false
    });

    screenMesh = new THREE.Mesh(geometry, material);
    scene.add(screenMesh);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function updateHologram(data) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = 1024;
    c.height = 1024;

    // Dark sleek background
    ctx.fillStyle = '#060B19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Glowing border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 15;
    ctx.strokeRect(10, 10, 1004, 1004);
    
    // Grid pattern for "hologram" feel
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.lineWidth = 2;
    for(let i=0; i<1024; i+=40) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,1024); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(1024,i); ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 65px Poppins, monospace';
    wrapText(ctx, data.title || 'Project', 512, 250, 800, 75);

    // Divider
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(300, 380, 424, 6);

    // Description
    ctx.font = '32px Poppins, sans-serif';
    ctx.fillStyle = '#94a3b8';
    wrapText(ctx, data.desc || 'Details coming soon...', 512, 500, 800, 45);

    // Tags
    ctx.font = 'bold 28px JetBrains Mono, monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText((data.tags || []).join('  |  '), 512, 850);

    const texture = new THREE.CanvasTexture(c);
    screenMesh.material.map = texture;
    screenMesh.material.needsUpdate = true;
    
    screenMesh.rotation.y = 0; // reset
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (screenMesh && !controls.active) {
        screenMesh.rotation.y += 0.002;
    }
    if (screenMesh) {
        screenMesh.position.y = Math.sin(Date.now() * 0.0015) * 0.2;
    }

    renderer.render(scene, camera);
}

document.addEventListener('DOMContentLoaded', initProjects3D);
