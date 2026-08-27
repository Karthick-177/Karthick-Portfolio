(function(){
  const container = document.getElementById('hero-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const key = new THREE.PointLight(0x4fd8c4, 14, 30);
  key.position.set(4, 3, 6);
  scene.add(key);
  const fill = new THREE.PointLight(0x7c8cff, 10, 30);
  fill.position.set(-5, -3, 4);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0x223344, 1.1));

  // Node group: scattered shard fragments (icosahedrons / boxes) representing data/model fragments
  const group = new THREE.Group();
  scene.add(group);

  const nodeCount = 14;
  const nodes = [];
  const geomPool = [
    () => new THREE.IcosahedronGeometry(0.32, 0),
    () => new THREE.BoxGeometry(0.42, 0.42, 0.42),
    () => new THREE.OctahedronGeometry(0.34, 0),
    () => new THREE.TetrahedronGeometry(0.38, 0),
  ];

  for (let i = 0; i < nodeCount; i++){
    const geo = geomPool[i % geomPool.length]();
    const mat = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? 0x4fd8c4 : 0x1a2230,
      metalness: 0.35,
      roughness: 0.35,
      emissive: i % 3 === 0 ? 0x1a5c52 : 0x000000,
      emissiveIntensity: 0.4,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const spread = 4.2;
    mesh.position.set(
      (Math.random() - 0.5) * spread * 1.8,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * 3
    );
    mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    mesh.userData.speed = 0.15 + Math.random() * 0.3;
    mesh.userData.axis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.basePos = mesh.position.clone();
    group.add(mesh);
    nodes.push(mesh);
  }

  // Thin connecting lines between nearby nodes
  const lineMat = new THREE.LineBasicMaterial({ color: 0x2c3a4d, transparent: true, opacity: 0.5 });
  const lineGroup = new THREE.Group();
  scene.add(lineGroup);
  function rebuildLines(){
    lineGroup.clear();
    for (let i = 0; i < nodes.length; i++){
      for (let j = i+1; j < nodes.length; j++){
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < 2.6){
          const geo = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position]);
          lineGroup.add(new THREE.Line(geo, lineMat));
        }
      }
    }
  }
  rebuildLines();

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let frame = 0;
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    nodes.forEach(n => {
      n.rotation.x += n.userData.speed * 0.004;
      n.rotation.y += n.userData.speed * 0.006;
      n.position.y = n.userData.basePos.y + Math.sin(t * 0.6 + n.userData.floatOffset) * 0.18;
      n.position.x = n.userData.basePos.x + Math.cos(t * 0.4 + n.userData.floatOffset) * 0.12;
    });

    group.rotation.y += (mouseX * 0.15 - group.rotation.y) * 0.03;
    group.rotation.x += (-mouseY * 0.1 - group.rotation.x) * 0.03;

    frame++;
    if (frame % 12 === 0) rebuildLines();

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
