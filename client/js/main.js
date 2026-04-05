import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { initScene } from './scene.js';
import { initCamera } from './camera.js';
import { initControls } from './controls.js';
import { loadIslands, animateIslands } from './islands.js';
import { setupRaycaster } from './raycaster.js';

async function main() {
    const { scene, renderer } = initScene();
    const camera = initCamera();
    const controls = initControls(camera, renderer.domElement);
    const { raycaster, mouse } = setupRaycaster(camera, scene);

    let islands = await loadIslands(scene);

    // --- Post-Processing (Bloom) ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8, // Increased Strength
        0.4, // Radius
        0.6  // Lowered Threshold for more glow
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Interaction logic
    window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            while (clickedObject.parent && !clickedObject.name) {
                clickedObject = clickedObject.parent;
            }

            if (clickedObject.name) {
                alert(`You clicked on: ${clickedObject.name}`);
            }
        }
    });

    function animate(time) {
        requestAnimationFrame(animate);
        controls.update();
        animateIslands(islands, time);
        composer.render();
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

main();
