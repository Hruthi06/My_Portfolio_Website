import * as THREE from 'three';

export function initScene() {
    const scene = new THREE.Scene();
    
    // Radiant Sky Color
    scene.background = new THREE.Color(0xaaccff); 

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // High Exposure Tone Mapping (Balanced)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; 

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff9c4, 2.8); 
    sunLight.position.set(50, 80, 40);
    sunLight.castShadow = true;
    
    // Shadow map properties to fix artifacts
    sunLight.shadow.mapSize.width = 4096; // Higher res for sharper shadows
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 400;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    
    // CRITICAL: Bias to fix shadow acne (Z-fighting)
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.05; 

    scene.add(sunLight);

    // Fill Light for the dark side
    const fillLight = new THREE.PointLight(0x87ceeb, 1.0);
    fillLight.position.set(-50, 20, -50);
    scene.add(fillLight);

    // Fog for horizon blend (Vibrant Blue)
    scene.fog = new THREE.FogExp2(0xddeeff, 0.003);

    return { scene, renderer };
}
