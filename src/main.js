import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import "./style.scss";
import gsap from "gsap";
const canvas = document.querySelector("#experience-canvas");
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});

const showModal = (modal) => {
  modal.style.display = "block";

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, { opacity: 1, duration: 0.5 });
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {};
// loaders
const textureLoader = new THREE.TextureLoader();

// model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  BakedOne: "/textures/Room/BakedOne.webp",
  BakedTwo: "/textures/Room/BakedTwo.webp",
  BakedThree: "/textures/Room/BakedThree.webp",
  BakedFour: "/textures/Room/BakedFour.webp",
  BakedFive: "/textures/Room/BakedFive.webp",
  BakedSix: "/textures/Room/BakedSix.webp",
  BakedSeven: "/textures/Room/BakedSeven.webp",
  BakedEight: "/textures/Room/BakedEight.webp",
  BakedCat: "/textures/Room/BakedCat.webp",
  BakedNine: "/textures/Room/BakedNine.webp",
};

const loadedTextures = {
  textures: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const texture = textureLoader.load(paths);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.textures[key] = texture;
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/Video/TetoVideo.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

// Video Texture Options
const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
videoTexture.center.set(0.5, 0.5);
videoTexture.rotation = Math.PI / 2;
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;
const scaleDownFactor = 3.5;

videoTexture.repeat.set(scaleDownFactor, scaleDownFactor);
videoTexture.offset.set(0.1, (1 - scaleDownFactor) / 2);

const fans = [];

window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(8.537801878898776, 2.3438515795786268, 5.577204976955839);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(0.8328469908987052, 0.5876291823158111, -0.954856734408532);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const fontLoader = new FontLoader();
const zs = [];
const catHeadWorldPos = new THREE.Vector3();

loader.load("/models/PortfolioModelV2.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name == "monitor_scren") {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
          opacity: 0.5,
        });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTextures.textures[key],
            });
            child.material = material;

            if (child.name.includes("Fan")) {
              fans.push(child);
            }
            if (child.name.includes("Raycastable")) {
              raycasterObjects.push(child);
              console.log(child.name);
            }
            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });

  // Add floating Z letters above cat head
  const catMesh = glb.scene.getObjectByName("Cat_BakedCat_Raycastable");
  if (!catMesh) {
    console.warn("Cat_BakedCat mesh not found!");
  } else {
    catMesh.getWorldPosition(catHeadWorldPos);

    fontLoader.load("/fonts/Super_Bubble_Regular.json", (font) => {
      for (let i = 0; i < 3; i++) {
        const geometry = new TextGeometry("Z", {
          font: font,
          size: 80,
          depth: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelOffset: 0,
          bevelSegments: 5,
        });
        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
        });
        const zMesh = new THREE.Mesh(geometry, material);

        zMesh.scale.set(0.00095, 0.00095, 0.00095);

        zMesh.position.set(
          catHeadWorldPos.x + 0.4,
          catHeadWorldPos.y + 0.3 + i * 0.35,
          catHeadWorldPos.z + 0.1
        );

        zMesh.rotation.y = THREE.MathUtils.degToRad(45);

        scene.add(zMesh);
        zs.push({ mesh: zMesh, delay: i * 1.0 });
      }
    });
  }

  scene.add(glb.scene);
});

// Event listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("click", () => {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    if (object.name.includes("MyWork")) {
      showModal(modals.work);
    } else if (object.name.includes("Contact")) {
      showModal(modals.contact);
    } else if (object.name.includes("About")) {
      showModal(modals.about);
    }
  }
});

const render = () => {
  controls.update();

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // animate fans
  fans.forEach((fan) => {
    const axis = new THREE.Vector3(-1, 0, 0.1).normalize();
    fan.rotateOnAxis(axis, 0.1);
  });

  // Raycaster
  raycaster.setFromCamera(pointer, camera);

  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for (let i = 0; i < currentIntersects.length; i++) {}

  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;
    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    document.body.style.cursor = "default";
  }

  // Animate floating Z letters
  const elapsed = performance.now() / 1000;
  const cycleDuration = 5;

  zs.forEach(({ mesh, delay }) => {
    const t = (elapsed - delay + cycleDuration) % cycleDuration;

    if (t < 0) {
      mesh.visible = false;
      return;
    } else {
      mesh.visible = true;
    }

    const startY = catHeadWorldPos.y + 0.3;
    const endY = catHeadWorldPos.y + 1;
    mesh.position.y = THREE.MathUtils.lerp(startY, endY, t / cycleDuration);

    mesh.position.x = catHeadWorldPos.x + 0.4;
    mesh.position.x = THREE.MathUtils.lerp(
      mesh.position.x,
      mesh.position.x + 0.5,
      t / cycleDuration
    );
    mesh.material.opacity = 1 - t / cycleDuration;
  });

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};

render();
