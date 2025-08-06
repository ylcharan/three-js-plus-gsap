import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { SplitText } from "gsap/SplitText.js";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const headerSplit = new SplitText(".header-1 h1", {
    type: "chars",
    charClass: "char",
  });
  const titleSplit = new SplitText(".tooltip .title h2", {
    types: "lines",
    linesClass: "line",
  });

  const descriptionSplit = new SplitText(".tooltip .description p", {
    type: "lines",
    linesClass: "line",
  });

  headerSplit.chars.forEach(
    (char) => (char.innerHTML = `<span>${char.innerHTML}</span>`)
  );

  [...titleSplit.lines, ...descriptionSplit.lines].forEach(
    (line) => (line.innerHTML = `<span>${line.innerHTML}</span>`)
  );

  const animOptions = { durations: 1, ease: "power2.out", stagger: 0.025 };
  const tooltipSelectors = [
    {
      trigger: 0.65,
      elements: [
        ".tooltip:nth-child(1) .icons ion-icon",
        ".tooltip:nth-child(1) .title .line > span",
        ".tooltip:nth-child(1) .description .line > span",
      ],
    },
    {
      trigger: 0.8,
      elements: [
        ".tooltip:nth-child(2) .icons ion-icon",
        ".tooltip:nth-child(2) .title .line > span",
        ".tooltip:nth-child(2) .description .line > span",
      ],
    },
  ];

  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom",
    onEnter: () => {
      gsap.to(".header-1 h1 .char > span", {
        y: "0%",
        duration: 1,
        ease: "power2.out",
        stagger: 0.025,
      });
    },
    onLeaveBack: () => {
      gsap.to(".header-1 h1 .char > span", {
        y: "100%",
        duration: 1,
        ease: "power2.out",
        stagger: 0.025,
      });
    },
  });

  let model,
    currentRotation = 0,
    modelSize;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.LinearEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.querySelector(".model-container").appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(1, 2, 3);
  mainLight.castShadow = true;
  mainLight.shadow.bias = -0.001;
  mainLight.shadow.mapSize.set(1024, 1024);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-2, 0, -2);
  scene.add(fillLight);

  function setupModel() {
    if (!model || !modelSize) return;

    const isMobile = window.innerWidth < 1000;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    model.position.set(
      isMobile ? center.x + modelSize.x * 1 : center.x - modelSize.x * 0.4,
      center.y + modelSize.y * 0.085,
      center.z
    );

    model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(-25);
    camera.position.set(
      0,
      0,
      Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance
    );

    camera.lookAt(0, 0, 0);
  }
  const loader = new GLTFLoader();
  loader.load("models/scene.glb", (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        Object.assign(child.material, {
          metalness: 0.05,
          roughness: 0.9,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    modelSize = size;

    scene.add(model);
    setupModel();
  });

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    setupModel();
  });
});
