import { useLoader } from '@react-three/fiber';
import { useEffect } from 'react';
import { BufferAttribute, Color } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function FloatingIsland() {
  const gltf = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/floating_island.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  useEffect(() => {
    if(!gltf) return;

    let mesh = gltf.scene.children[0]

    let uvs = mesh.geometry.attributes.uv.array
    mesh.geometry.setAttribute('uv2', new BufferAttribute(uvs, 2))

    mesh.material.lightMap = mesh.material.map
    mesh.material.lightMapIntensity = 400
    mesh.material.color = new Color(0.04, 0.06, 0.1)

  }, [gltf])

  return(
      <primitive object={gltf.scene}/>
  )
}
