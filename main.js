import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DragControls } from "three/addons/controls/DragControls.js";
import { GUI } from "lil-gui";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { TextureLoader } from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a2a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.powerPreference = "high-performance";
document.body.appendChild(renderer.domElement);

// Controls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;

// Scene objects
const objects = [];
const objectsData = new Map();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
scene.add(gridHelper);

// GUI
const gui = new GUI();
const sceneControls = {
  backgroundColor: 0x2a2a2a,
  generalLightIntensity: 1.0,
  surfaceTexture: 'None',
  surfaceTextureScale: 1,
  sceneTexture: 'None',
  showSurface: true,
  addCat: async () => {
    const cat = await loadModel('/models/cat.obj', 0.03);
    if (cat) {
      cat.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
      cat.rotation.x = -Math.PI / 2;
    }
  },
  addHuman: async () => {
    const human = await loadModel('/models/human.obj', 0.2);
    if (human) human.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
  },
  addMale: async () => {
    const male = await loadModel('/models/male.obj', 0.022);
    if (male) {
      male.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
      male.rotation.y = Math.random() * Math.PI * 2;
    }
  },
  addFemale: async () => {
    const female = await loadModel('/models/female.obj', 0.022);
    if (female) {
      female.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
      female.rotation.y = Math.random() * Math.PI * 2;
    }
  },
  addDuck: async () => {
    const duck = await loadModel('/models/duck.obj', 0.015);
    if (duck) {
      duck.position.set(Math.random() * 4 - 2, 0, Math.random() * 4 - 2);
      duck.rotation.x = -Math.PI / 2;
    }
  },
  addLight: () => {
    // Create a point light
    const light = new THREE.SpotLight(0xffffff, 1);
    light.position.set(0, 5, 0);
    light.castShadow = true;
    light.angle = Math.PI / 4;
    light.penumbra = 0.1;
    light.decay = 1;
    light.distance = 100;
    
    // Create a sphere to represent the light with emissive material
    const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({ 
        emissive: 0xffffff,
        emissiveIntensity: 1,
        color: 0x000000
    });
    const lightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    light.add(lightSphere);

    // Add target for the spotlight
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, -1);
    light.add(targetObject);
    light.target = targetObject;

    scene.add(light);
    objects.push(lightSphere);
    
    objectsData.set(lightSphere.uuid, {
        type: 'light',
        light: light,
        target: targetObject
    });
  },
  reset: () => {
    // Simple page reload
    window.location.reload();
  }
};

gui.addColor(sceneControls, "backgroundColor").onChange((value) => {
  scene.background = new THREE.Color(value);
});

// General folder with just reset
const generalFolder = gui.addFolder('General');
generalFolder.add(sceneControls, 'reset').name('Reset Scene');

// Add Scene Light control to Lights folder
const lightsFolder = gui.addFolder('Lights');
lightsFolder.add(sceneControls, 'generalLightIntensity', 0, 2)
    .name('Scene Light')
    .onChange((value) => {
        ambientLight.intensity = value * 0.5;
        directionalLight.intensity = value;
    });
lightsFolder.add(sceneControls, 'addLight').name('Add Light');

// Then add other folders
const modelsFolder = gui.addFolder('Models');
modelsFolder.add(sceneControls, 'addCat').name('Add Cat');
modelsFolder.add(sceneControls, 'addHuman').name('Add Human');
modelsFolder.add(sceneControls, 'addMale').name('Add Male');
modelsFolder.add(sceneControls, 'addFemale').name('Add Female');
modelsFolder.add(sceneControls, 'addDuck').name('Add Duck');

// Drag controls
const dragControls = new DragControls(objects, camera, renderer.domElement);
dragControls.addEventListener("dragstart", () => orbitControls.enabled = false);
dragControls.addEventListener("dragend", () => orbitControls.enabled = true);

// Object selection
let selectedObject = null;
let selectedObjectGui = null;

// Add available textures mapping
const availableTextures = {
    'None': null,
    'Bricks': '/textures/extra/bricks.jpg',
    'Grass': '/textures/extra/grass.jpg',
    'Water': '/textures/extra/water.jpg',
    'Wood': '/textures/extra/wood.jpg',
    'Cat': '/textures/cat_diffuse.jpg',
    'Duck': '/textures/duck_diffuse.jpg',
    'Female': '/textures/female_diffuse.jpg',
    'Male': '/textures/male_diffuse.jpg'
};

// Add surface textures mapping
const surfaceTextures = {
    'None': null,
    'Bricks': '/textures/extra/bricks.jpg',
    'Grass': '/textures/extra/grass.jpg',
    'Water': '/textures/extra/water.jpg',
    'Wood': '/textures/extra/wood.jpg'
};

// Add scene textures mapping at the top with other texture mappings
const sceneTextures = {
    'None': null,
    'Sky': '/textures/scene/sky-scene.jpg',
    'Space': '/textures/scene/space-scene.jpg'
};

function updateObjectGUI(object) {
  if (selectedObjectGui) selectedObjectGui.destroy();
  if (!object) return;

  selectedObjectGui = gui.addFolder('Selected Object');
  
  const objectControls = {
    // Position controls
    posX: object.position.x,
    posY: object.position.y,
    posZ: object.position.z,
    // Rotation controls (in degrees for better usability)
    rotX: THREE.MathUtils.radToDeg(object.rotation.x),
    rotY: THREE.MathUtils.radToDeg(object.rotation.y),
    rotZ: THREE.MathUtils.radToDeg(object.rotation.z),
    // Scale controls
    scale: object.scale.x,
    // Delete function
    delete: () => {
      const data = objectsData.get(object.uuid);
      
      if (data?.type === 'light') {
        // Handle light deletion
        const light = data.light;
        scene.remove(light);  // Remove the entire light group
        const index = objects.indexOf(object);
        if (index > -1) {
            objects.splice(index, 1);
        }
      } else {
        // For models, we need to remove it from both arrays
        const index = objects.indexOf(object);
        if (index > -1) {
            objects.splice(index, 1);
        }
        // Remove from scene
        if (object.parent) {
            object.parent.remove(object);
        }
      }

      // Clear data and GUI
      objectsData.delete(object.uuid);
      selectedObject = null;
      selectedObjectGui.destroy();
      selectedObjectGui = null;

      // Force scene update
      renderer.render(scene, camera);
    }
  };

  // Add transformation controls folder
  const transformFolder = selectedObjectGui.addFolder('Transform');
  
  // Position controls
  transformFolder.add(objectControls, 'posX', -10, 10, 0.1)
    .name('Position X')
    .onChange(value => {
      object.position.x = value;
    });
  transformFolder.add(objectControls, 'posY', 0, 10, 0.1)
    .name('Position Y')
    .onChange(value => {
      object.position.y = value;
    });
  transformFolder.add(objectControls, 'posZ', -10, 10, 0.1)
    .name('Position Z')
    .onChange(value => {
      object.position.z = value;
    });

  // Rotation controls
  transformFolder.add(objectControls, 'rotX', -180, 180, 1)
    .name('Rotation X')
    .onChange(value => {
        if (objectsData.get(object.uuid)?.type === 'light') {
            const data = objectsData.get(object.uuid);
            const target = data.target;
            const radians = THREE.MathUtils.degToRad(value);
            
            // Update target position based on rotation
            target.position.z = -Math.cos(radians);
            target.position.y = Math.sin(radians);
            
            object.rotation.x = 0;  // Keep sphere unrotated
        } else {
            object.rotation.x = THREE.MathUtils.degToRad(value);
        }
    });
  transformFolder.add(objectControls, 'rotY', -180, 180, 1)
    .name('Rotation Y')
    .onChange(value => {
        if (objectsData.get(object.uuid)?.type === 'light') {
            const data = objectsData.get(object.uuid);
            const target = data.target;
            const radians = THREE.MathUtils.degToRad(value);
            
            // Update target position based on rotation
            const distance = Math.sqrt(target.position.z * target.position.z + target.position.x * target.position.x);
            target.position.x = Math.sin(radians) * distance;
            target.position.z = -Math.cos(radians) * distance;
            
            object.rotation.y = 0;  // Keep sphere unrotated
        } else {
            object.rotation.y = THREE.MathUtils.degToRad(value);
        }
    });
  transformFolder.add(objectControls, 'rotZ', -180, 180, 1)
    .name('Rotation Z')
    .onChange(value => {
        if (objectsData.get(object.uuid)?.type === 'light') {
            const light = objectsData.get(object.uuid).light;
            light.rotation.z = THREE.MathUtils.degToRad(value);
            object.rotation.z = 0;
        } else {
            object.rotation.z = THREE.MathUtils.degToRad(value);
        }
    });

  // Scale control
  transformFolder.add(objectControls, 'scale', 0.1, 2, 0.1)
    .name('Scale')
    .onChange(value => {
      object.scale.set(value, value, value);
    });

  // Add type-specific controls
  if (objectsData.get(object.uuid)?.type === 'light') {
    const light = objectsData.get(object.uuid).light;
    const lightFolder = selectedObjectGui.addFolder('Light Properties');
    
    objectControls.intensity = light.intensity;
    objectControls.distance = light.distance;
    objectControls.decay = light.decay;
    objectControls.color = '#' + light.color.getHexString();
    objectControls.shadowRadius = light.shadow.radius;
    objectControls.shadowBias = light.shadow.bias;
    objectControls.shadowMapSize = light.shadow.mapSize.x;
    objectControls.penumbra = light.shadow.camera.near;
    objectControls.angle = THREE.MathUtils.radToDeg(light.angle || Math.PI/3);

    // Basic light properties
    lightFolder.add(objectControls, 'intensity', 0, 100)
        .name('Intensity')
        .onChange(value => light.intensity = value);
    lightFolder.add(objectControls, 'distance', 0, 100)
        .name('Distance')
        .onChange(value => light.distance = value);
    lightFolder.add(objectControls, 'decay', 0, 2)
        .name('Decay')
        .onChange(value => light.decay = value);
    lightFolder.addColor(objectControls, 'color')
        .name('Color')
        .onChange(value => {
            light.color.set(value);
            // Update sphere color to match light
            object.material.emissive.set(value);
        });

    // Shadow properties
    const shadowFolder = lightFolder.addFolder('Shadow Settings');
    shadowFolder.add(objectControls, 'shadowRadius', 0, 15)
        .name('Blur')
        .onChange(value => light.shadow.radius = value);
    shadowFolder.add(objectControls, 'shadowBias', -0.1, 0.1, 0.001)
        .name('Bias')
        .onChange(value => light.shadow.bias = value);
    shadowFolder.add(objectControls, 'shadowMapSize', 256, 2048, 256)
        .name('Resolution')
        .onChange(value => {
            light.shadow.mapSize.set(value, value);
            light.shadow.map?.dispose();
            light.shadow.map = null;
            light.shadow.camera.updateProjectionMatrix();
        });
    shadowFolder.add(objectControls, 'penumbra', 0.1, 10)
        .name('Near')
        .onChange(value => {
            light.shadow.camera.near = value;
            light.shadow.camera.updateProjectionMatrix();
        });
    shadowFolder.add(objectControls, 'angle', 0, 180)
        .name('Angle')
        .onChange(value => {
            light.angle = THREE.MathUtils.degToRad(value);
            light.shadow.camera.updateProjectionMatrix();
        });
  } else if (objectsData.get(object.uuid)?.type === 'model') {
    const materialFolder = selectedObjectGui.addFolder('Material');
    const textureFolder = selectedObjectGui.addFolder('Textures');
    
    // Traverse through all meshes in the model
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            // Add existing material controls
            objectControls.metalness = child.material.metalness;
            objectControls.roughness = child.material.roughness;
            
            // Set initial texture value based on current texture
            objectControls.texture = 'None';
            if (child.material.map) {
                // Find the texture name from the path
                const texturePath = child.material.map.source.data.src;
                for (const [name, path] of Object.entries(availableTextures)) {
                    if (path && texturePath.includes(path)) {
                        objectControls.texture = name;
                        break;
                    }
                }
            }

            // Add texture selection
            textureFolder.add(objectControls, 'texture', Object.keys(availableTextures))
                .name('Texture')
                .onChange(async (value) => {
                    const texturePath = availableTextures[value];
                    if (texturePath) {
                        const texture = await textureLoader.loadAsync(texturePath);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(1, 1);
                        child.material.map = texture;
                    } else {
                        child.material.map = null;
                    }
                    child.material.needsUpdate = true;
                });

            // Add texture scale control
            objectControls.textureScale = 1;
            textureFolder.add(objectControls, 'textureScale', 0.1, 10)
                .name('Texture Scale')
                .onChange(value => {
                    if (child.material.map) {
                        child.material.map.repeat.set(value, value);
                        child.material.needsUpdate = true;
                    }
                });
            
            // Add material controls
            materialFolder.add(objectControls, 'metalness', 0, 1)
                .onChange(value => child.material.metalness = value);
            materialFolder.add(objectControls, 'roughness', 0, 1)
                .onChange(value => child.material.roughness = value);
        }
    });
  }

  selectedObjectGui.add(objectControls, 'delete');
}

// Click selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
    if (event.target.closest('.lil-gui')) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);

    if (selectedObject) {
        // Reset previous selection highlight
        if (objectsData.get(selectedObject.uuid)?.type === 'light') {
            selectedObject.material.emissiveIntensity = 1;
        } else {
            selectedObject.material.emissive.set(0x000000);
        }
    }

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        // Set new selection highlight
        if (objectsData.get(selectedObject.uuid)?.type === 'light') {
            selectedObject.material.emissiveIntensity = 2; // Brighten the light sphere
        } else {
            selectedObject.material.emissive.set(0x333333);
        }
        updateObjectGUI(selectedObject);
    } else {
        selectedObject = null;
        if (selectedObjectGui) {
            selectedObjectGui.destroy();
            selectedObjectGui = null;
        }
    }
});

// Window resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add after camera setup
const cameraControls = {
    moveSpeed: 0.1,
    keysPressed: {},
};

// Add keyboard event listeners
window.addEventListener('keydown', (event) => {
    cameraControls.keysPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    cameraControls.keysPressed[event.key] = false;
});

// Update the animate function to handle camera movement
function animate() {
    requestAnimationFrame(animate);
    
    // Handle camera movement
    const moveDistance = cameraControls.moveSpeed;
    const cameraDirection = new THREE.Vector3();
    
    // Forward/Backward (like mouse wheel)
    if (cameraControls.keysPressed['ArrowUp'] || cameraControls.keysPressed['w']) {
        camera.position.y += moveDistance;
        camera.position.z -= moveDistance;
    }
    if (cameraControls.keysPressed['ArrowDown'] || cameraControls.keysPressed['s']) {
        camera.position.y -= moveDistance;
        camera.position.z += moveDistance;
    }
    
    // Left/Right (parallel to ground)
    if (cameraControls.keysPressed['ArrowLeft'] || cameraControls.keysPressed['a']) {
        camera.position.x -= moveDistance;
    }
    if (cameraControls.keysPressed['ArrowRight'] || cameraControls.keysPressed['d']) {
        camera.position.x += moveDistance;
    }

    orbitControls.update();
    
    // Update light positions
    objects.forEach(object => {
        const data = objectsData.get(object.uuid);
        if (data?.type === 'light') {
            data.light.position.copy(object.position);
        }
    });
    
    renderer.render(scene, camera);
}

// Add camera controls to GUI
const cameraFolder = gui.addFolder('Camera Controls');
cameraFolder.add(cameraControls, 'moveSpeed', 0.1, 1.0)
    .name('Movement Speed');

animate();

// Add after scene setup
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const textureLoader = new TextureLoader();

// Add this function to count surfaces
function countSurfaces(model) {
    let totalTriangles = 0;
    model.traverse((child) => {
        if (child.isMesh) {
            totalTriangles += child.geometry.attributes.position.count / 3;
        }
    });
    return Math.floor(totalTriangles);
}

// Add this function to analyze surface curvature
function analyzeSurfaces(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            const normals = child.geometry.attributes.normal;
            let hasNonPlanarSurfaces = false;
            
            // Check if adjacent normals are different (indicating curvature)
            for (let i = 0; i < normals.count - 3; i += 3) {
                const n1 = new THREE.Vector3(
                    normals.array[i], 
                    normals.array[i + 1], 
                    normals.array[i + 2]
                );
                const n2 = new THREE.Vector3(
                    normals.array[i + 3], 
                    normals.array[i + 4], 
                    normals.array[i + 5]
                );
                
                if (!n1.equals(n2)) {
                    hasNonPlanarSurfaces = true;
                    break;
                }
            }
            
            console.log(`Model part in ${child.name || 'unnamed'}: ${
                hasNonPlanarSurfaces ? 'Has curved surfaces' : 'Only flat surfaces'
            }`);
        }
    });
}

// Add at the top level after imports
const loaderContainer = document.getElementById('loader-container');
const loadingProgress = document.getElementById('loading-progress');

// Update initializeScene function
async function initializeScene() {
    try {
        // Show loading screen
        loaderContainer.style.display = 'flex';
        loadingProgress.textContent = 'Loading Models...';

        // Load all models simultaneously
        const [cat, male, female, duck] = await Promise.all([
            loadModel('/models/cat.obj', 0.03),
            loadModel('/models/male.obj', 0.022),
            loadModel('/models/female.obj', 0.022),
            loadModel('/models/duck.obj', 0.015)
        ]);

        loadingProgress.textContent = 'Positioning Models...';

        // Position cat
        if (cat) {
            cat.position.set(-2, 0, -2);
            cat.rotation.x = -Math.PI / 2;
        }

        // Position male
        if (male) {
            male.position.set(-2, 0, 2);
            male.rotation.y = Math.PI / 4;
        }

        // Position female
        if (female) {
            female.position.set(2, 0, 2);
            female.rotation.y = -Math.PI / 4;
        }

        // Position duck
        if (duck) {
            duck.position.set(2, 0, -2);
            duck.rotation.x = -Math.PI / 2;
        }

        // Hide loading screen
        loaderContainer.style.display = 'none';
        
    } catch (error) {
        console.error('Error initializing scene:', error);
        loadingProgress.textContent = 'Error loading scene. Please refresh.';
    }
}

// Update loadModel function to show progress
async function loadModel(modelPath, scale = 1) {
    try {
        loadingProgress.textContent = `Loading objects...`;
        const model = await objLoader.loadAsync(modelPath);
        const surfaceCount = countSurfaces(model);
        console.log(`\nModel ${modelPath} has ${surfaceCount} surfaces (triangles)`);
        analyzeSurfaces(model);
        
        model.scale.set(scale, scale, scale);

        // Make each mesh in the model selectable
        model.traverse((child) => {
            if (child.isMesh) {
                objects.push(child);
                objectsData.set(child.uuid, {
                    type: 'model',
                    path: modelPath
                });
            }
        });

        // Apply materials and textures
        if (modelPath.includes('cat')) {
            const catTexture = await textureLoader.loadAsync('/textures/cat_diffuse.jpg');
            const catBumpMap = await textureLoader.loadAsync('/textures/cat_bump.jpg');
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        map: catTexture,
                        bumpMap: catBumpMap,
                        bumpScale: 0.05,
                        metalness: 0.1,
                        roughness: 0.8
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        } else if (modelPath.endsWith('duck.obj')) {
            const duckTexture = await textureLoader.loadAsync('/textures/duck_diffuse.jpg');
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: duckTexture,
                        roughness: 0.5,
                        metalness: 0.0
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        } else if (modelPath.endsWith('female.obj')) {
            const femaleTexture = await textureLoader.loadAsync('/textures/female_diffuse.jpg');
            const femaleNormalMap = await textureLoader.loadAsync('/textures/female_normal.jpg');
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        map: femaleTexture,
                        normalMap: femaleNormalMap,
                        normalScale: new THREE.Vector2(1, 1),
                        roughness: 0.5,
                        metalness: 0.0
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        } else if (modelPath.endsWith('male.obj')) {
            const maleTexture = await textureLoader.loadAsync('/textures/male_diffuse.jpg');
            const maleNormalMap = await textureLoader.loadAsync('/textures/male_normal.jpg');
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        map: maleTexture,
                        normalMap: maleNormalMap,
                        normalScale: new THREE.Vector2(0.5, 0.5),
                        metalness: 0.2,
                        roughness: 0.8
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        } else {
            // For other models, use a basic material
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xcccccc,
                        metalness: 0.2,
                        roughness: 0.8
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }

        scene.add(model);
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

// Call initialization after scene setup
initializeScene();

// Add surface texture controls to General folder
generalFolder.add(sceneControls, 'surfaceTexture', Object.keys(surfaceTextures))
    .name('Surface Texture')
    .onChange(async (value) => {
        const texturePath = surfaceTextures[value];
        if (texturePath) {
            const texture = await textureLoader.loadAsync(texturePath);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);  // Default scale for surface
            ground.material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.2
            });
        } else {
            ground.material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.8,
                metalness: 0.2
            });
        }
        ground.material.needsUpdate = true;
    });

generalFolder.add(sceneControls, 'surfaceTextureScale', 1, 10)
    .name('Surface Scale')
    .onChange((value) => {
        if (ground.material.map) {
            ground.material.map.repeat.set(value, value);
            ground.material.needsUpdate = true;
        }
    });

// Add scene texture control to General folder
generalFolder.add(sceneControls, 'sceneTexture', Object.keys(sceneTextures))
    .name('Scene Texture')
    .onChange(async (value) => {
        const texturePath = sceneTextures[value];
        if (texturePath) {
            const texture = await textureLoader.loadAsync(texturePath);
            scene.background = texture;
        } else {
            scene.background = new THREE.Color(sceneControls.backgroundColor);
        }
    });

// Add surface visibility toggle to General folder
generalFolder.add(sceneControls, 'showSurface')
    .name('Show Surface')
    .onChange((value) => {
        ground.visible = value;
        gridHelper.visible = value;
    });
