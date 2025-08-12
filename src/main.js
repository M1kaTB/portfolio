import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import "./style.scss";
import { VideoTexture } from "three";

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

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
// videoTexture.repeat.set(3, 1.5); // match 16:9 ratio (0.5625 = 9/16)
// videoTexture.offset.set(0, (1 - 0.5625) / 2); // center vertically
videoTexture.center.set(0.5, 0.5); // pivot point in the middle
videoTexture.rotation = Math.PI / 2;
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;
const scaleDownFactor = 3.5;

videoTexture.repeat.set(scaleDownFactor, scaleDownFactor);

videoTexture.offset.set(0.1, (1 - scaleDownFactor) / 2);

loader.load("/models/PortfolioModel-v1.glb", (glb) => {
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
            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });
  scene.add(glb.scene);
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
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(0.8328469908987052, 0.5876291823158111, -0.954856734408532);

// event listeners
window.addEventListener("resize", () => {
  (sizes.width = window.innerWidth), (sizes.height = window.innerHeight);

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //  update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () => {
  controls.update();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  // console.log(camera.position);
  // console.log("---------");
  // console.log(controls.target);

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
};

render();
