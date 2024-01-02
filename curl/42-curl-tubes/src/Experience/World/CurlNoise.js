import {
  CatmullRomCurve3,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import Experience from "../Experience";
import curlVertexShader from "../../shaders/curl.vert";
import curlFragmentShader from "../../shaders/curl.frag";
import bgFragmentShader from "../../shaders/bg.frag";

const SimplexNoise = require("simplex-noise"),
  simplex = new SimplexNoise(Math.random);

export default class CurlNoise {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.scene = this.experience.scene;
    this.scene1 = this.experience.sceneBg;
    this.camera = this.experience.camera.instance;
    this.raycaster = new Raycaster();
    this.mouse = new Vector2(0, 0);
    this.eMouse = new Vector2();
    this.elasticMouse = new Vector2(0, 0);
    this.elasticMouseVel = new Vector2(0, 0);
    this.temp = new Vector2(0, 0);

    this.params = {
      count: 1000,
    };
    this.uniforms = {
      uTime: { value: 0.0 },
      uLight: { value: new Vector3(0, 0, 0) },
    };

    this.addTube();
    this.raycast();

    this.canvas.addEventListener("mousemove", this.onPointerMove);
  }
  onPointerMove = (event) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.eMouse.x = event.clientX;
    this.eMouse.y = event.clientY;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.raycastPlane]);

    if (intersects.length > 0) {
      let p = intersects[0].point;
      this.eMouse.x = p.x;
      this.eMouse.y = p.y;
    }
  };
  raycast = () => {
    const materialBg = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: curlVertexShader,
      fragmentShader: bgFragmentShader,
      side: DoubleSide,
    });
    this.raycastPlane = new Mesh(new PlaneGeometry(10, 10), materialBg);
    this.scene1.add(this.raycastPlane);

    this.light = new Mesh(
      new SphereGeometry(0.02, 20, 20),
      new MeshBasicMaterial({ color: 0xa8e6cf }),
    );
    this.scene.add(this.light);
  };
  getCurve = (start) => {
    let scale = 1;
    let points = [];

    points.push(start);
    let currentPoint = start.clone();

    for (let i = 0; i < this.params.count; i++) {
      let v = this.computeCurl(
        currentPoint.x / scale,
        currentPoint.y / scale,
        currentPoint.z / scale,
      );
      currentPoint.addScaledVector(v, 0.001);
      points.push(currentPoint.clone());
    }
    return points;
  };
  addTube = () => {
    const materialTubes = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: curlVertexShader,
      fragmentShader: curlFragmentShader,
      side: DoubleSide,
    });

    for (let i = 0; i < this.params.count / 2; i++) {
      let path = new CatmullRomCurve3(
        this.getCurve(
          new Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
          ),
        ),
      );
      let geometry = new TubeGeometry(path, 600, 0.002, 8, false);
      let curve = new Mesh(geometry, materialTubes);
      this.scene.add(curve);
    }
  };
  computeCurl = (x, y, z) => {
    const eps = 1e-4;

    let curl = new Vector3();

    // Find rate of change in YZ plane
    let n1 = simplex.noise3D(x, y + eps, z);
    let n2 = simplex.noise3D(x, y - eps, z);
    // Average to find approximate derivative
    let a = (n1 - n2) / (2 * eps);
    n1 = simplex.noise3D(x, y, z + eps);
    n2 = simplex.noise3D(x, y, z - eps);
    // Average to find approximate derivative
    let b = (n1 - n2) / (2 * eps);
    curl.x = a - b;

    // Find rate of change in XZ plane
    n1 = simplex.noise3D(x, y, z + eps);
    n2 = simplex.noise3D(x, y, z - eps);
    a = (n1 - n2) / (2 * eps);
    n1 = simplex.noise3D(x + eps, y, z);
    n2 = simplex.noise3D(x + eps, y, z);
    b = (n1 - n2) / (2 * eps);
    curl.y = a - b;

    // Find rate of change in XY plane
    n1 = simplex.noise3D(x + eps, y, z);
    n2 = simplex.noise3D(x - eps, y, z);
    a = (n1 - n2) / (2 * eps);
    n1 = simplex.noise3D(x, y + eps, z);
    n2 = simplex.noise3D(x, y - eps, z);
    b = (n1 - n2) / (2 * eps);
    curl.z = a - b;

    return curl;
  };
  update = () => {
    this.temp.copy(this.eMouse).sub(this.elasticMouse).multiplyScalar(0.15);
    this.elasticMouseVel.add(this.temp);
    this.elasticMouseVel.multiplyScalar(0.8);
    this.elasticMouse.add(this.elasticMouseVel);

    this.light.position.x = this.elasticMouse.x;
    this.light.position.y = this.elasticMouse.y;

    this.uniforms.uTime.value += 0.05;
    this.uniforms.uLight.value = this.light.position;
  };
}
