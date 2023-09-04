import {useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {Float} from '@react-three/drei';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
export function FloatingRocks() {
  const rock1 = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/floating_rock_1.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })
  const rock2 = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/floating_rock_2.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })
  const rock3 = useLoader(GLTFLoader, process.env.PUBLIC_URL + "/models/floating_rock_3.glb", loader => {
    loader.setDRACOLoader(dracoLoader);
  })

  return(
      <>
        <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0} position={[-20.5, -7, -19]}>
          <primitive object={rock2.scene}/>
        </Float>

        <Float speed={1.5} rotationIntensity={1.6} floatIntensity={0} position={[-5, 10, -33]}>
          <primitive object={rock1.scene}/>
        </Float>

        <Float speed={1.5} rotationIntensity={1.1} floatIntensity={0} position={[20, 3.5, -9]}>
          <primitive object={rock3.scene}/>
        </Float>

      </>
  )
}
