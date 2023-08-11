import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEffect} from 'react';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function Trees() {
  const tree = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/trees.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  useEffect(() => {
    if(!tree) return;

    let mesh = tree.scene.children[0]
    mesh.material.envMapIntensity = 2.5

  }, [tree])

  return(
      <primitive object={tree.scene}/>
  )
}
