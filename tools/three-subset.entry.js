// Entry point for the vendored three.js subset in js/vendor/.
// Only the classes js/hero3d.js imports are re-exported, so esbuild can
// tree-shake the rest of the library away. See README.md, "Vendored code".
export {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog,
  HemisphereLight, DirectionalLight, InstancedMesh, MeshStandardMaterial,
  Object3D, PlaneGeometry, ShadowMaterial, Mesh, CatmullRomCurve3, Vector3,
  TubeGeometry, SphereGeometry, PCFShadowMap, SRGBColorSpace
} from 'three';
export { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
