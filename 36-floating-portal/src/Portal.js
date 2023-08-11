import {useFrame, useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEffect} from 'react';
import {
  AlwaysStencilFunc,
  DoubleSide, EquirectangularReflectionMapping,
  LinearSRGBColorSpace, ReplaceStencilOp,
  Scene,
  TextureLoader,
  WebGLRenderTarget,
} from 'three';
import {FillQuad} from './FillQuad';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const scene = new Scene()
scene.background = new TextureLoader()
.load(process.env.PUBLIC_URL + "/textures/galaxy.jpg", texture => {
  texture.colorSpace = LinearSRGBColorSpace
  texture.mapping = EquirectangularReflectionMapping
})

const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight)

window.addEventListener('resize', () => {
  target.setSize(window.innerWidth, window.innerHeight)
})

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function Portal() {
  const model = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/portal.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })
  const mask = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/portal_mask.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  useEffect(() => {
    if(!model) return

    let mesh = model.scene.children[0]
    mesh.material.envMapIntensity = 3.5

    let maskMesh = mask.scene.children[0]
    maskMesh.material.side = DoubleSide
    maskMesh.material.transparent = false
    maskMesh.material.stencilWrite = true
    maskMesh.material.stencilRef = 1
    maskMesh.material.stencilFunc = AlwaysStencilFunc
    maskMesh.material.stencilZPass = ReplaceStencilOp

  }, [model, mask])

  useFrame((state) => {
    state.gl.setRenderTarget(target)
    state.gl.render(scene, state.camera)
    state.gl.setRenderTarget(null)
  })

  return(
      <>
        <primitive object={model.scene}/>
        <primitive object={mask.scene}/>
        <FillQuad map={target.texture} maskId={1}/>
      </>
  )
}
