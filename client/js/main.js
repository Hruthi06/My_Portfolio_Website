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
                // Future: Navigate or show data based on island
            }
        }
    });

    function animate(time) {
        requestAnimationFrame(animate);
        controls.update();
        animateIslands(islands, time);
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

main();
