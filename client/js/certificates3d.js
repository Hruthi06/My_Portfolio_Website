import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function initCerts3D() {
    const modal = document.getElementById('certs-3d-modal');
    const openBtn = document.getElementById('btn-open-certs-3d');
    const closeBtn = document.getElementById('close-certs-3d');
    const canvas = document.getElementById('certs-3d-canvas');

    if (!modal || !openBtn || !closeBtn || !canvas) return;

    let scene, camera, renderer, ring, controls;
    let particlesMesh, bgGeoGroup;
    let isInitialized = false;
    let autoRotateSpeed = 0.003;

    const textureLoader = new THREE.TextureLoader();

    async function initScene() {
        if (isInitialized) return;

        // Fetch data
        const response = await fetch('/api/certificates');
        const certificates = await response.json();

        // Setup Scene
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 14);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // OrbitControls (360 View)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.enablePan = false; // Keep focus on center
        controls.minDistance = 8;
        controls.maxDistance = 25;

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambient);
        const point = new THREE.PointLight(0xffffff, 2, 50);
        point.position.set(0, 10, 15);
        scene.add(point);

        // Core Group
        ring = new THREE.Group();
        scene.add(ring);

        // --- Background Starfield ---
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i=0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 60; // Spread across 60 units
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x8b5cf6, // Theme purple
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // --- Floating Geometry ---
        bgGeoGroup = new THREE.Group();
        scene.add(bgGeoGroup);
        const geoMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xec4899, wireframe: true, transparent: true, opacity: 0.1 
        });
        for(let i=0; i<15; i++) {
            const mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(Math.random() * 2 + 0.5, 0),
                geoMaterial
            );
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40 - 15 // push backwards
            );
            mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
            bgGeoGroup.add(mesh);
        }

        const radius = 9;
        const count = certificates.length;

        // Helper to create text texture for the back
        function createBackTexture(cert) {
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            c.width = 1024;
            c.height = 768;

            // Premium Dark Background
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, 1024, 768);

            // subtle gradient border
            const grad = ctx.createLinearGradient(0, 0, 1024, 768);
            grad.addColorStop(0, '#8b5cf6');
            grad.addColorStop(1, '#ec4899');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 30;
            ctx.strokeRect(15, 15, 994, 738);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 50px Poppins, sans-serif';
            ctx.textAlign = 'center';
            wrapText(ctx, cert.title, 512, 180, 800, 60);

            // Divider
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(300, 320, 424, 4);

            // Description
            ctx.fillStyle = '#9ca3af';
            ctx.font = '32px Poppins, sans-serif';
            wrapText(ctx, cert.description, 512, 420, 850, 45);

            // Badge/Icon in center
            ctx.font = '100px Arial';
            ctx.fillText(cert.badge || '📜', 512, 650);

            return new THREE.CanvasTexture(c);
        }

        // Simple text wrapping helper
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

        const cardPromises = certificates.map((cert, i) => {
            return new Promise((resolve) => {
                textureLoader.load(cert.imageUrl, (texture) => {
                    const angle = (i / count) * Math.PI * 2;
                    const cardGroup = new THREE.Group();
                    const geometry = new THREE.PlaneGeometry(5.6, 4);
                    
                    // Front side (Image)
                    const material = new THREE.MeshPhongMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 0,
                        side: THREE.FrontSide
                    });
                    const cardMesh = new THREE.Mesh(geometry, material);
                    
                    // Back side (Description)
                    const backMaterial = new THREE.MeshPhongMaterial({ 
                        map: createBackTexture(cert),
                        side: THREE.BackSide
                    });
                    const cardBack = new THREE.Mesh(geometry, backMaterial);
                    
                    cardGroup.add(cardMesh);
                    cardGroup.add(cardBack);

                    cardGroup.position.x = Math.sin(angle) * radius;
                    cardGroup.position.z = Math.cos(angle) * radius;
                    cardGroup.lookAt(0, 0, 0);
                    cardGroup.rotation.y += Math.PI; 

                    ring.add(cardGroup);
                    
                    // Fade in
                    let opacity = 0;
                    const fadeIn = () => {
                        opacity += 0.05;
                        material.opacity = opacity;
                        if (opacity < 1) requestAnimationFrame(fadeIn);
                    };
                    fadeIn();

                    resolve();
                });
            });
        });

        await Promise.all(cardPromises);

        isInitialized = true;
        animate();
    }

    function animate() {
        if (!modal.classList.contains('active')) return;
        requestAnimationFrame(animate);

        controls.update();

        // Slow auto-rotation when user isn't interacting
        if (!controls.active) {
            ring.rotation.y += autoRotateSpeed;
        }

        // Float effect
        const time = Date.now() * 0.001;
        ring.position.y = Math.sin(time) * 0.2;

        // Animate Background
        particlesMesh.rotation.y -= 0.0005;
        bgGeoGroup.rotation.x += 0.001;
        bgGeoGroup.rotation.y += 0.001;
        bgGeoGroup.children.forEach(c => {
            c.rotation.x += 0.002;
            c.rotation.y += 0.002;
        });

        renderer.render(scene, camera);
    }

    // Interaction Logic
    function onMouseDown(e) {
        isDragging = true;
        previousMouseX = e.clientX || e.touches[0].clientX;
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        const currentX = e.clientX || e.touches[0].clientX;
        const deltaX = currentX - previousMouseX;
        
        targetRotation += deltaX * 0.005;
        previousMouseX = currentX;
    }

    function onMouseUp() {
        isDragging = false;
    }

    // Event Listeners
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        initScene();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    // Touch support
    canvas.addEventListener('touchstart', onMouseDown);
    window.addEventListener('touchmove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);

    window.addEventListener('resize', () => {
        if (!isInitialized) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
