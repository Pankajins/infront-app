import * as THREE from 'three';

export default class Particles {
  constructor(container) {
    this.container = container;
    this.mouseX = 0;
    this.mouseY = 0;

    this.init();
    this.addLights();
    this.addFog();
    this.initParticles();
    this.loop();

    window.addEventListener('resize', () => this.handleResize(), false);
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
    document.addEventListener('touchstart', (e) => this.handleResize(e), false);
    document.addEventListener('touchmove', (e) => this.handleResize(e), false);
  }

  width() {
    return window.innerWidth;
  }

  height() {
    return window.innerHeight;
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width() / this.height(), 1, 3000);
    this.camera.position.set(0, 0, 1000);
    this.camera.lookAt(this.scene.position);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio = window.devicePixelRatio;
    this.renderer.setSize(this.width(), this.height());

    this.container.appendChild(this.renderer.domElement);
  }

  addLights() {
    const light = new THREE.AmbientLight(0xB2EBF2, 0.7);
    this.scene.add(light);
  }

  addFog() {
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0007);
  }

  initParticles() {
    this.geometry = new THREE.Geometry();
    this.numParticles = 3000;
    this.particleVariations = [
      {hsl: [1.00, 1, 0.5], size: 5},
      {hsl: [0.95, 1, 0.5], size: 4},
      {hsl: [0.90, 1, 0.5], size: 3},
      {hsl: [0.85, 1, 0.5], size: 2},
      {hsl: [0.80, 1, 0.5], size: 1}
    ];
    this.materials = [];
    this.createParticleVertices();
    this.addParticles();
  }

  createParticleVertices() {
    for (let i = 0; i < this.numParticles; i++) {
      let vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2000 - 1000;
      vertex.y = Math.random() * 2000 - 1000;
      vertex.z = Math.random() * 2000 - 1000;

      this.geometry.vertices.push(vertex);
    }
  }

  addParticles() {
    for (let i = 0; i < this.particleVariations.length; i++) {
      this.materials[i] = new THREE.PointsMaterial({
        size: this.particleVariations[i].size
      });

      const particles = new THREE.Points(this.geometry, this.materials[i]);

      particles.rotation.x = Math.random() * (Math.PI * 2);
      particles.rotation.y = Math.random() * (Math.PI * 2);
      particles.rotation.z = Math.random() * (Math.PI * 2);

      this.scene.add(particles);
    }
  }

  handleResize() {
    this.renderer.setSize(this.width(), this.height());
    this.camera.aspect = this.width() / this.height();
    this.camera.updateProjectionMatrix();
  }

  handleMouseMove(e) {
    this.mouseX = e.clientX - this.width() / 2;
    this.mouseY = e.clientY - this.height() / 2;
  }

  handleTouch(e) {
    if (e.touches.length === 1) {
      this.mouseX = e.touches[0].pageX - this.width() / 2;
      this.mouseY = e.touches[0].pageY - this.height() / 2;
    }
  }

  loop() {
    this.render();
    requestAnimationFrame(() => {
      this.loop();
    });
  }

  render() {
    const time = Date.now() * 0.00005; // Avoid rotating too fast

    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.scene.children.forEach((child, i) => {
      if (child instanceof THREE.Points) {
        const direction = i < 4 ? 1 : -1;
        child.rotation.y = time * (i + 1) * direction;
      }
    });

    this.materials.forEach((material, i) => {
      const hsl = this.particleVariations[i].hsl;
      const hue = (360 * (hsl[0] + time) % 360) / 360;
      material.color.setHSL(hue, hsl[1], hsl[2]);
    });


    this.renderer.render(this.scene, this.camera);
  }
}
