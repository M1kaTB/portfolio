import * as THREE from "three";
import { OrbitControls } from "./utils/OrbitControls";
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
// Loading Manager
const loadingManager = new THREE.LoadingManager(() => {
  // When everything is loaded
  document.querySelector(".loading-text").textContent = "Loaded!";
  const enterBtn = document.getElementById("enter-button");
  enterBtn.style.display = "block";
});

const modals = {
  work: document.querySelector(".modal.work"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};
const bgOverlay = document.querySelector(".bgOverlay");

let touchHappened = false;

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener(
    "touchend",
    (e) => {
      touchHappened = true;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );

  button.addEventListener(
    "click",
    (e) => {
      if (touchHappened) return;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModal(modal);
    },
    { passive: false }
  );
});
let isModalOpen = false;
const sound = new Audio("/music/Pop.mp3");

const playPopSound = () => {
  sound.currentTime = 0;
  sound.play();
};

const showModal = (modal) => {
  modal.style.display = "flex";
  bgOverlay.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if (currentHoverObject) {
    playHoverAnimation(currentHoverObject, false, true);
    currentHoverObject = null;
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  // Start scale small and transparent
  playPopSound();
  gsap.set(modal, { scale: 0, opacity: 0, transformOrigin: "center" });

  // Animate pop-in with overshoot
  gsap.set(modal, {
    opacity: 0,
    scale: 0,
  });

  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "back.out(2)",
  });
  // Overlay animation
  gsap.set(bgOverlay, {
    backdropFilter: "blur(0px)",
    backgroundColor: "rgba(0,0,0,0)",
  });
  gsap.to(bgOverlay, {
    backdropFilter: "blur(5px)",
    backgroundColor: "rgba(0,0,0,0.4)",
    duration: 0.5,
    ease: "power2.out",
  });
};
const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;
  playPopSound();
  gsap.to(modal, {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: "back.in(2)",
    onComplete: () => {
      modal.style.display = "none";
    },
  });
  // Overlay fade out
  gsap.to(bgOverlay, {
    backdropFilter: "blur(0px)",
    backgroundColor: "rgba(0,0,0,0)",
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      bgOverlay.style.display = "none";
    },
  });
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const raycasterObjects = [];
let currentIntersects = [];
let currentHoverObject = null;

const socialLinks = {};
// loaders
const textureLoader = new THREE.TextureLoader(loadingManager);

// model loader
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(loadingManager);
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
videoElement.oncanplaythrough = () => {
  loadingManager.itemEnd("video");
};
loadingManager.itemStart("video");
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
  touchHappened = false;
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    handleRaycastInteraction();
  },
  { passive: false }
);

function handleRaycastInteraction() {
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
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#D9CAD1");
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  200
);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
// OrbitControls setup
controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.rotateSpeed = 0.4;
controls.zoomSpeed = 0.6;
controls.panSpeed = 0.5;

controls.minDistance = 2.5;
controls.maxDistance = 30;

controls.minPolarAngle = Math.PI / 6;
controls.maxPolarAngle = Math.PI / 2.1;

controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.update();

if (window.innerWidth < 768) {
  camera.position.set(
    29.567116827654726,
    14.018476147584705,
    31.37040363900147
  );
  controls.target.set(
    -0.08206262548844094,
    3.3119233527087255,
    -0.7433922282864018
  );
} else {
  camera.position.set(8.537801878898776, 2.3438515795786268, 5.577204976955839);

  controls.target.set(
    0.4624746759408973,
    1.9719940043010387,
    -0.8300979125494505
  );
}

controls.target.set(0.8328469908987052, 0.5876291823158111, -0.954856734408532);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const fontLoader = new FontLoader();
const zs = [];
const catHeadWorldPos = new THREE.Vector3();

let mainPlank, plank1, plank2, plank3, plant1, plant2, plant3, cup, phone;
let books = [];

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
              child.userData.initialScale = new THREE.Vector3().copy(
                child.scale
              );
              child.userData.initialRotation = new THREE.Euler().copy(
                child.rotation
              );
              child.userData.initialPosition = new THREE.Vector3().copy(
                child.position
              );
            }
            if (child.name.includes("HandingSigns")) {
              mainPlank = child;
              child.scale.set(0, 0, 0);
            } else if (
              child.name.includes("MyWork_BakedOne_Raycastable_Pointer")
            ) {
              plank1 = child;
              child.scale.set(0, 0, 0);
            } else if (
              child.name.includes("About_BakedOne_Raycastable_Pointer")
            ) {
              plank2 = child;
              child.scale.set(0, 0, 0);
            } else if (
              child.name.includes("Contact_BakedOne_Raycastable_Pointer")
            ) {
              plank3 = child;
              child.scale.set(0, 0, 0);
            } else if (child.name.includes("pot_BakedSix")) {
              plant1 = child;
              child.scale.set(0, 0, 0);
            } else if (child.name.includes("pot001_BakedSix_Raycastable")) {
              plant2 = child;
              console.log("A");
              child.scale.set(0, 0, 0);
            } else if (child.name.includes("PlantJar_BakedSix_Raycastable")) {
              plant3 = child;
              child.scale.set(0, 0, 0);
            } else if (child.name.includes("cup001_BakedFive_Raycastable")) {
              cup = child;
              child.scale.set(0, 0, 0);
            } else if (
              child.name.includes("phone_BakedFive_Raycastable_Pointer")
            ) {
              phone = child;
              child.scale.set(0, 0, 0);
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
      loadingManager.itemEnd("font");
    });
    loadingManager.itemStart("font");
  }

  scene.add(glb.scene);
});

function playIntroAnimation() {
  const t1 = gsap.timeline({
    duration: 0.8,
    ease: "back.out(0.8)",
  });

  t1.to(mainPlank.scale, { x: 1, y: 1, z: 1 }, 0)
    .to(plank1.scale, { x: 1, y: 1, z: 1 }, 0)
    .to(plank2.scale, { x: 1, y: 1, z: 1 }, 0)
    .to(plank3.scale, { x: 1, y: 1, z: 1 }, 0);

  const t2 = gsap.timeline({
    duration: 0.8,
    ease: "back.out(0.8)",
  });

  t2.to(plant1.scale, { x: 1, y: 1, z: 1 })
    .to(plant2.scale, { x: 1, y: 1, z: 1 }, "-=0.5")
    .to(plant3.scale, { x: 1, y: 1, z: 1 }, "-=0.6")
    .to(cup.scale, { x: 1, y: 1, z: 1 }, "-=0.6")
    .to(phone.scale, { x: 1, y: 1, z: 1 }, "-=0.6");
  // .to(plank1, {
  //   z: 1,
  //   y: 1,
  //   x: 1,
  // });
}

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

window.addEventListener("click", handleRaycastInteraction);

function playHoverAnimation(object, isHovering, withRotation = false) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.2,
      z: object.userData.initialScale.z * 1.2,
      y: object.userData.initialScale.y * 1.2,
      duration: 0.5,
      ease: "bounce.out(1.8)",
    });
    if (withRotation) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x + Math.PI / 8,
        duration: 0.5,
        ease: "bounce.out(1.8)",
      });
    }
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      z: object.userData.initialScale.z,
      y: object.userData.initialScale.y,
      duration: 0.3,
      ease: "bounce.out(1.8)",
    });
    if (withRotation) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "bounce.out(1.8)",
      });
    }
  }
}

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
  if (!isModalOpen) {
    raycaster.setFromCamera(pointer, camera);

    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    for (let i = 0; i < currentIntersects.length; i++) {}

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;
      if (
        currentIntersectObject.name.includes("Raycastable") &&
        !currentIntersectObject.name.includes("Text") &&
        !currentIntersectObject.name.includes("PlantLeafs")
      ) {
        if (currentIntersectObject !== currentHoverObject) {
          if (currentHoverObject) {
            if (
              currentHoverObject.name.includes("Work") ||
              currentHoverObject.name.includes("Contact") ||
              currentHoverObject.name.includes("About")
            ) {
              playHoverAnimation(currentHoverObject, false, true);
            } else {
              playHoverAnimation(currentHoverObject, false, false);
            }
          }
          if (
            currentIntersectObject.name.includes("Work") ||
            currentIntersectObject.name.includes("About") ||
            currentIntersectObject.name.includes("Contact")
          ) {
            playHoverAnimation(currentIntersectObject, true, true);
          } else {
            playHoverAnimation(currentIntersectObject, true, false);
          }
          currentHoverObject = currentIntersectObject;
        }
      }
      if (currentIntersectObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoverObject) {
        if (
          currentHoverObject.name.includes("Work") ||
          currentHoverObject.name.includes("Contact") ||
          currentHoverObject.name.includes("About")
        ) {
          playHoverAnimation(currentHoverObject, false, true);
        } else {
          playHoverAnimation(currentHoverObject, false, false);
        }
        currentHoverObject = null;
      }
      document.body.style.cursor = "default";
    }
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

const bgMusic = new Audio("/music/music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

const musicToggleBtn = document.getElementById("music-toggle");
const musicIcon = document.getElementById("music-icon");
const musicMuted = "/icons/Mute.svg";
const musicOn = "/icons/Unmute.svg";
let isMusicPlaying = false;

musicToggleBtn.addEventListener("click", () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    musicIcon.src = musicMuted;
  } else {
    bgMusic.play();
    musicIcon.src = musicOn;
  }
  isMusicPlaying = !isMusicPlaying;
});

musicToggleBtn.addEventListener("touchend", () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    musicIcon.src = musicMuted;
  } else {
    bgMusic.play();
    musicIcon.src = musicOn;
  }
  isMusicPlaying = !isMusicPlaying;
});

const enterBtn = document.getElementById("enter-button");
enterBtn.addEventListener("click", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const text = document.querySelector(".loading-text");

  text.textContent = "Welcome";

  gsap.to(loadingScreen, {
    duration: 1.2,
    rotationX: 90,
    y: "-120%",
    ease: "power4.in",
    transformOrigin: "center",
    onComplete: () => {
      loadingScreen.style.display = "none";
      playIntroAnimation();
    },
  });

  bgMusic.play().catch((err) => {
    console.warn("Autoplay prevented. User interaction needed.", err);
  });
  isMusicPlaying = true;
  musicIcon.src = musicOn;
});

enterBtn.addEventListener("touchend", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const text = document.querySelector(".loading-text");

  text.textContent = "Welcome";

  gsap.to(loadingScreen, {
    duration: 1.2,
    rotationX: 90,
    y: "-120%",
    ease: "power4.in",
    transformOrigin: "center",
    onComplete: () => {
      loadingScreen.style.display = "none";
      playIntroAnimation();
    },
  });

  bgMusic.play().catch((err) => {
    console.warn("Autoplay prevented. User interaction needed.", err);
  });
  isMusicPlaying = true;
  musicIcon.src = musicOn;
});

render();
