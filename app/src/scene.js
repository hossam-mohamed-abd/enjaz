import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createEnjazScene(container, { reducedMotion = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(9, 7.2, 12.5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.35 : 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.65, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.045;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.42;
  controls.minPolarAngle = Math.PI / 3.25;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.update();

  let resumeTimer;
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener("end", () => {
    if (!reducedMotion) resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 3500);
  });

  const hemi = new THREE.HemisphereLight(0xe9f4ed, 0x062f33, 2.5);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(0xffdfb5, 4.4);
  keyLight.position.set(-3, 9, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -7;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x4ad7cd, 2.1);
  rimLight.position.set(6, 4, -6);
  scene.add(rimLight);

  const root = new THREE.Group();
  root.rotation.y = -0.25;
  scene.add(root);

  const materials = {
    land: new THREE.MeshStandardMaterial({ color: 0x8fa58c, roughness: 0.88, metalness: 0.02 }),
    side: new THREE.MeshStandardMaterial({ color: 0x355e58, roughness: 0.9 }),
    sand: new THREE.MeshStandardMaterial({ color: 0xd7c39e, roughness: 0.82 }),
    pale: new THREE.MeshStandardMaterial({ color: 0xf0e4cb, roughness: 0.78 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb86b3d, roughness: 0.64, metalness: 0.08 }),
    copperLight: new THREE.MeshStandardMaterial({ color: 0xe6bf92, roughness: 0.7, emissive: 0x4a2512, emissiveIntensity: 0.12 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x0b6e69, roughness: 0.72 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x0a4a4c, roughness: 0.82 }),
    tree: new THREE.MeshStandardMaterial({ color: 0x1d5b4e, roughness: 0.9 }),
    treeLight: new THREE.MeshStandardMaterial({ color: 0x487d60, roughness: 0.9 }),
    window: new THREE.MeshStandardMaterial({ color: 0x123c43, roughness: 0.3, metalness: 0.25 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x102b2e, roughness: 0.95 })
  };

  function mesh(geometry, material, parent = root) {
    const item = new THREE.Mesh(geometry, material);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }

  // Floating organic landmass.
  const shape = new THREE.Shape();
  shape.moveTo(-4.25, -1.35);
  shape.bezierCurveTo(-4.65, -0.5, -4.25, 1.25, -3.15, 1.8);
  shape.bezierCurveTo(-2.15, 2.3, -1.35, 1.75, -0.45, 2.0);
  shape.bezierCurveTo(0.7, 2.3, 1.35, 1.55, 2.35, 1.65);
  shape.bezierCurveTo(3.5, 1.75, 4.45, 0.9, 4.35, -0.15);
  shape.bezierCurveTo(4.25, -1.25, 3.25, -1.85, 2.15, -1.75);
  shape.bezierCurveTo(1.1, -1.65, 0.55, -2.25, -0.55, -2.05);
  shape.bezierCurveTo(-1.75, -1.85, -2.2, -2.3, -3.1, -2.0);
  shape.bezierCurveTo(-3.65, -1.85, -4.0, -1.7, -4.25, -1.35);
  const landGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.48,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.14,
    bevelThickness: 0.13,
    curveSegments: 16
  });
  landGeometry.rotateX(Math.PI / 2);
  const land = mesh(landGeometry, [materials.land, materials.side]);
  land.position.y = 0.28;

  // Water and soft shadow below the miniature.
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2baeaa,
    transparent: true,
    opacity: 0.12,
    roughness: 0.18,
    metalness: 0.1,
    depthWrite: false
  });
  const water = mesh(new THREE.CircleGeometry(5.75, 80), waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.scale.set(1.12, 0.84, 1);
  water.position.y = -0.55;
  water.castShadow = false;
  const waterRing = mesh(new THREE.RingGeometry(5.85, 5.88, 96), new THREE.MeshBasicMaterial({ color: 0x2baeaa, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
  waterRing.rotation.x = -Math.PI / 2;
  waterRing.scale.set(1.12, 0.84, 1);
  waterRing.position.y = -0.54;
  waterRing.castShadow = false;
  const shadowPlane = mesh(new THREE.PlaneGeometry(28, 28), new THREE.ShadowMaterial({ color: 0x001416, opacity: 0.22 }), scene);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.62;
  shadowPlane.castShadow = false;

  // Istanbul-inspired domes and minarets.
  function createMinaret(parent, x, z, height = 1.45) {
    const tower = mesh(new THREE.CylinderGeometry(0.055, 0.085, height, 10), materials.pale, parent);
    tower.position.set(x, height / 2, z);
    const balcony = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.055, 12), materials.copperLight, parent);
    balcony.position.set(x, height * 0.7, z);
    const cap = mesh(new THREE.ConeGeometry(0.105, 0.3, 12), materials.copper, parent);
    cap.position.set(x, height + 0.15, z);
  }
  const istanbul = new THREE.Group();
  istanbul.position.set(-2.25, 0.42, 0.45);
  root.add(istanbul);
  const mosqueBase = mesh(new THREE.CylinderGeometry(0.68, 0.73, 0.38, 16), materials.sand, istanbul);
  mosqueBase.position.y = 0.19;
  const dome = mesh(new THREE.SphereGeometry(0.59, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.teal, istanbul);
  dome.position.y = 0.38;
  const domeTop = mesh(new THREE.SphereGeometry(0.065, 12, 8), materials.copperLight, istanbul);
  domeTop.position.y = 1.01;
  createMinaret(istanbul, -0.82, 0.02, 1.5);
  createMinaret(istanbul, 0.82, 0.02, 1.5);
  createMinaret(istanbul, -0.65, -0.55, 1.25);
  for (const [x, z, s] of [[-1.05, 0.72, 0.34], [-0.48, 0.92, 0.26], [0.45, 0.88, 0.32], [0.92, 0.62, 0.25]]) {
    const house = mesh(new THREE.BoxGeometry(s, s * 0.75, s), materials.pale, istanbul);
    house.position.set(x, s * 0.375, z);
    const roof = mesh(new THREE.ConeGeometry(s * 0.72, s * 0.38, 4), materials.copper, istanbul);
    roof.position.set(x, s * 0.92, z);
    roof.rotation.y = Math.PI / 4;
  }

  // Cappadocia-inspired fairy chimneys.
  const cappadocia = new THREE.Group();
  cappadocia.position.set(-0.05, 0.4, 0.25);
  root.add(cappadocia);
  for (const [x, z, h, r] of [[-0.5, 0.1, 0.75, 0.22], [-0.05, -0.18, 1.0, 0.27], [0.38, 0.12, 0.64, 0.2], [0.65, -0.35, 0.48, 0.16]]) {
    const rock = mesh(new THREE.CylinderGeometry(r * 0.62, r, h, 7), materials.sand, cappadocia);
    rock.position.set(x, h / 2, z);
    const cap = mesh(new THREE.ConeGeometry(r * 1.06, h * 0.42, 7), materials.copper, cappadocia);
    cap.position.set(x, h + h * 0.18, z);
  }

  // Mountain and forest chapter.
  const mountainGroup = new THREE.Group();
  mountainGroup.position.set(1.6, 0.28, -0.82);
  root.add(mountainGroup);
  for (const [x, z, h, r, mat] of [
    [-0.45, 0.0, 1.3, 0.72, materials.dark],
    [0.35, -0.35, 1.75, 0.88, materials.teal],
    [1.1, 0.05, 1.15, 0.65, materials.dark],
    [0.75, 0.65, 0.85, 0.52, materials.treeLight]
  ]) {
    const mountain = mesh(new THREE.ConeGeometry(r, h, 6), mat, mountainGroup);
    mountain.position.set(x, h / 2, z);
    mountain.rotation.y = x;
    if (h > 1.5) {
      const snow = mesh(new THREE.ConeGeometry(r * 0.34, h * 0.27, 6), materials.pale, mountainGroup);
      snow.position.set(x, h * 0.865, z);
      snow.rotation.y = x;
    }
  }
  function createTree(x, z, scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, 0.42, z);
    tree.scale.setScalar(scale);
    root.add(tree);
    const trunk = mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.22, 7), materials.copper, tree);
    trunk.position.y = 0.11;
    const lower = mesh(new THREE.ConeGeometry(0.18, 0.48, 8), materials.tree, tree);
    lower.position.y = 0.37;
    const upper = mesh(new THREE.ConeGeometry(0.13, 0.38, 8), materials.treeLight, tree);
    upper.position.y = 0.62;
  }
  [[2.8, 0.45, 1], [3.15, 0.05, 0.8], [2.65, -0.1, 0.75], [2.25, 0.75, 0.9], [1.95, 1.05, 0.7], [3.35, -0.55, 0.75], [1.55, 0.85, 0.65]].forEach((args) => createTree(...args));

  // Hot-air balloons with gentle independent drift.
  const balloons = [];
  function createBalloon(x, y, z, scale, material, phase) {
    const balloon = new THREE.Group();
    balloon.position.set(x, y, z);
    balloon.scale.setScalar(scale);
    root.add(balloon);
    const envelope = mesh(new THREE.SphereGeometry(0.34, 24, 18), material, balloon);
    envelope.scale.y = 1.18;
    const band = mesh(new THREE.TorusGeometry(0.335, 0.014, 6, 32), materials.pale, balloon);
    band.rotation.x = Math.PI / 2;
    const basket = mesh(new THREE.BoxGeometry(0.15, 0.12, 0.15), materials.copper, balloon);
    basket.position.y = -0.62;
    const ropeGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.15, -0.28, 0), new THREE.Vector3(-0.06, -0.56, 0),
      new THREE.Vector3(0.15, -0.28, 0), new THREE.Vector3(0.06, -0.56, 0)
    ]);
    const ropes = new THREE.LineSegments(ropeGeometry, new THREE.LineBasicMaterial({ color: 0xe8dcc8 }));
    balloon.add(ropes);
    balloons.push({ item: balloon, baseY: y, phase });
  }
  createBalloon(-0.2, 3.25, -0.45, 1.05, materials.copper, 0);
  createBalloon(1.05, 2.65, 0.55, 0.72, materials.copperLight, 2.1);
  createBalloon(-1.15, 2.35, -0.85, 0.55, materials.teal, 4.2);

  // The Enjaz route connects every chapter.
  const route = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.45, 0.53, 1.15),
    new THREE.Vector3(-2.15, 0.55, 1.05),
    new THREE.Vector3(-0.8, 0.55, 1.25),
    new THREE.Vector3(0.45, 0.55, 0.75),
    new THREE.Vector3(1.5, 0.55, 0.8),
    new THREE.Vector3(2.85, 0.55, -0.55)
  ]);
  const routeMesh = mesh(new THREE.TubeGeometry(route, 140, 0.026, 7, false), materials.copperLight);
  routeMesh.castShadow = false;
  for (const point of [route.getPointAt(0), route.getPointAt(0.48), route.getPointAt(1)]) {
    const marker = mesh(new THREE.SphereGeometry(0.075, 14, 10), materials.pale);
    marker.position.copy(point);
    marker.position.y += 0.025;
  }

  // A tiny moving VIP van makes the route feel alive.
  const van = new THREE.Group();
  root.add(van);
  const vanBody = mesh(new THREE.BoxGeometry(0.36, 0.2, 0.6), materials.pale, van);
  vanBody.position.y = 0.18;
  const vanCabin = mesh(new THREE.BoxGeometry(0.32, 0.16, 0.36), materials.window, van);
  vanCabin.position.set(0, 0.34, -0.03);
  const vanRoof = mesh(new THREE.BoxGeometry(0.34, 0.035, 0.4), materials.pale, van);
  vanRoof.position.set(0, 0.435, -0.03);
  for (const x of [-0.2, 0.2]) {
    for (const z of [-0.19, 0.19]) {
      const wheel = mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.045, 12), materials.rubber, van);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.095, z);
    }
  }
  van.scale.setScalar(0.78);

  // Sparse ambient points, intentionally subtle.
  const particlePositions = [];
  for (let i = 0; i < 65; i += 1) {
    const angle = i * 2.39996;
    const radius = 4.8 + (i % 7) * 0.24;
    particlePositions.push(Math.cos(angle) * radius, 0.3 + (i % 11) * 0.29, Math.sin(angle) * radius * 0.62);
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0xe6bf92, size: 0.025, transparent: true, opacity: 0.48, sizeAttenuation: true }));
  root.add(particles);

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    if (width < 520) {
      camera.fov = 41;
      camera.position.set(9.5, 8.2, 14.5);
    } else {
      camera.fov = 35;
      camera.position.set(9, 7.2, 12.5);
    }
    camera.updateProjectionMatrix();
    controls.update();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let visible = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.01 });
  visibilityObserver.observe(container);

  const clock = new THREE.Clock();
  let firstFrame = true;
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      balloons.forEach(({ item, baseY, phase }) => {
        item.position.y = baseY + Math.sin(elapsed * 0.65 + phase) * 0.11;
        item.rotation.y = Math.sin(elapsed * 0.22 + phase) * 0.18;
      });
      const progress = (0.06 + elapsed * 0.009) % 1;
      const point = route.getPointAt(progress);
      const tangent = route.getTangentAt(progress);
      van.position.copy(point);
      van.position.y += 0.035;
      van.rotation.y = Math.atan2(tangent.x, tangent.z);
      particles.rotation.y = elapsed * 0.008;
      waterMaterial.opacity = 0.11 + Math.sin(elapsed * 0.45) * 0.015;
    } else {
      const point = route.getPointAt(0.08);
      van.position.copy(point);
      van.position.y += 0.035;
      van.rotation.y = 1.4;
    }
    controls.update();
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      requestAnimationFrame(() => container.classList.add("is-ready"));
    }
  });

  renderer.domElement.addEventListener("webglcontextlost", () => {
    container.classList.remove("is-ready");
    const loading = document.getElementById("scene-loading");
    if (loading) loading.hidden = true;
  });

  return { scene, camera, renderer, controls };
}
