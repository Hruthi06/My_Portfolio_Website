import * as THREE from 'three';

(function initCerts3D() {
    const modal = document.getElementById('certs-3d-modal');
    const openBtn = document.getElementById('btn-open-certs-3d');
    const closeBtn = document.getElementById('close-certs-3d');
    const canvas = document.getElementById('certs-3d-canvas');

    if (!modal || !openBtn || !closeBtn || !canvas) return;

    let scene, camera, renderer, ring;
    let isInitialized = false;
    let targetRotation = 0;
    let currentRotation = 0;
    
    // Drag variables
    let isDragging = false;
    let previousMouseX = 0;

    const textureLoader = new THREE.TextureLoader();

    async function initScene() {
        if (isInitialized) return;

        // Fetch data
        const response = await fetch('/api/certificates');
        const certificates = await response.json();

        // Setup Scene
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 12;

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const point = new THREE.PointLight(0xffffff, 2, 50);
        point.position.set(0, 5, 10);
        scene.add(point);

        // Core Group
        ring = new THREE.Group();
        scene.add(ring);

        const radius = 7;
        const count = certificates.length;

        function createCardTexture(cert) {
            const c = document.createElement('canvas');
            const ctx = c.getContext('2d');
            c.width = 1024;
            c.height = 768;

            // White paper background (Real Certificate look)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1024, 768);

            // Artistic border
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 40;
            ctx.strokeRect(0, 0, 1024, 768);
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(60, 60, 904, 648);

            // Header (Issuer logo/text)
            ctx.fillStyle = '#111827';
            ctx.font = 'bold 48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(cert.issuer.toUpperCase(), 512, 140);

            // Main Content
            ctx.fillStyle = '#374151';
            ctx.font = '32px Georgia, serif';
            ctx.fillText('C E R T I F I C A T E   O F   A C H I E V E M E N T', 512, 240);

            ctx.fillStyle = '#111827';
            ctx.font = 'bold 64px "Times New Roman", serif';
            ctx.fillText('Hruthik K R', 512, 380);

            ctx.fillStyle = '#4b5563';
            ctx.font = '36px Georgia, serif';
            ctx.fillText('has successfully completed the course in', 512, 460);

            ctx.fillStyle = '#8b5cf6';
            ctx.font = 'bold 52px Georgia, serif';
            ctx.fillText(cert.title, 512, 550);

            // Footer / Seal
            ctx.fillStyle = '#6b7280';
            ctx.font = '24px Arial, sans-serif';
            ctx.fillText(`Date: ${cert.date} | ID: CERT-${cert.id}`, 512, 650);
            
            // Emoji Badge as a "Seal"
            ctx.font = '80px Segoe UI Emoji';
            ctx.fillText(cert.badge || '🏆', 850, 620);

            const texture = new THREE.CanvasTexture(c);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return texture;
        }

        certificates.forEach((cert, i) => {
            const angle = (i / count) * Math.PI * 2;
            
            // Create Card Container
            const cardGroup = new THREE.Group();
            
            // Card Geometry (Paper Aspect Ratio)
            const geometry = new THREE.PlaneGeometry(5, 3.8);
            
            const material = new THREE.MeshPhongMaterial({
                map: createCardTexture(cert),
                side: THREE.FrontSide, // Front side only for efficiency
                transparent: true,
                opacity: 0.95,
                shininess: 40
            });
            
            const cardMesh = new THREE.Mesh(geometry, material);
            
            // Back of the card (prevent mirroring)
            const backMaterial = new THREE.MeshBasicMaterial({ color: 0x161c31 });
            const cardBack = new THREE.Mesh(geometry, backMaterial);
            cardBack.rotation.y = Math.PI; // Face opposite
            cardGroup.add(cardBack);

            cardGroup.add(cardMesh);

            // Position card on circle
            cardGroup.position.x = Math.sin(angle) * radius;
            cardGroup.position.z = Math.cos(angle) * radius;
            
            // Cards face OUTWARD (correct perspective from outside)
            cardGroup.lookAt(0, 0, 0);
            cardGroup.rotation.y += Math.PI; 

            ring.add(cardGroup);
        });

        ring.rotation.x = 0.1;
        isInitialized = true;
        animate();
    }

    function animate() {
        if (!modal.classList.contains('active')) return;
        requestAnimationFrame(animate);

        // Continuous slow rotation if not dragging
        if (!isDragging) {
            targetRotation += 0.002;
        }

        // Smooth interpolation
        currentRotation += (targetRotation - currentRotation) * 0.08;
        ring.rotation.y = currentRotation;

        // Subtle float
        ring.position.y = Math.sin(Date.now() * 0.001) * 0.2;

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
