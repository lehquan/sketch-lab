import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function Rocks() {
  const rock = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/rocks.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  return(
    <primitive object={rock.scene}/>
  )
}
