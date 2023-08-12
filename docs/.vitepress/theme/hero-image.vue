<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { onMounted, ref } from "vue";

const container = ref<null | HTMLDivElement>(null);

onMounted(() => {
  const renderer = new THREE.WebGLRenderer();

  const width =
    window.innerWidth - container.value!.getBoundingClientRect().left;
  renderer.setSize(
    window.innerWidth - container.value!.getBoundingClientRect().left,
    (window.innerHeight / window.innerWidth) * width,
  );
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1000,
  );

  camera.position.set(0, 200, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e20);

  container.value!.appendChild(renderer.domElement);

  const loader = new GLTFLoader();

  let model;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.enableRotate = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;

  loader.load("/model.glb", function (gltf) {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.rotation.x = Math.PI * 5 / 4;
    model.rotation.z = Math.PI;
    controls.reset();
    controls.maxDistance =
      new THREE.Box3()
        .setFromObject(gltf.scene)
        .getSize(new THREE.Vector3())
        .length();
    scene.add(model);
  });

  controls.update();

  var lightA1 = new THREE.AmbientLight(0xff00ff, 0.7);
  scene.add(lightA1);

  function animate() {
    controls.update();

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
</script>

<template>
  <div ref="container"></div>
</template>
