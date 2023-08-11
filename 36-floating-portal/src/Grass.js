import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEffect} from 'react';
import {Color, DoubleSide} from 'three';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function Grass() {
  const grass = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/grass.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  useEffect(() => {
    if(!grass) return

    grass.scene.children[0].material.alphaToCoverage = true
    grass.scene.children[0].material.transparent = true
    grass.scene.children[0].material.map = grass.scene.children[0].material.emissiveMap
    grass.scene.children[0].material.emissive = new Color(0.5, 0.5, 0.5)
    grass.scene.children[0].material.side = DoubleSide

  }, [grass])

  return(
      <primitive object={grass.scene}/>
  )
}
