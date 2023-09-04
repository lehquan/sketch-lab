import {Environment, OrbitControls, PerspectiveCamera} from '@react-three/drei';
import {Suspense, useEffect} from 'react';
import Scene from './Scene.jsx';
import {useThree} from '@react-three/fiber';
import Meteor from './Meteor.jsx';
import {NodeToyTick} from '@nodetoy/react-nodetoy';
import Beams from './Beams.jsx';

function App() {
  const state = useThree()

  useEffect(() => {
    state.gl.toneMappingExposure = 5
  }, [state.gl])

  return (
    <>
      <Environment background={'only'} files={"assets/textures/envmap_blur.hdr"} ground={{ height: 100, radius: 300 }}/>
      <Environment background={false} files={"assets/textures/envmap.hdr"}/>

      <PerspectiveCamera makeDefault fov={33} position={[-0.07, 16.41, -24.1]}/>
      <OrbitControls target={[0.02, 0.806, 0.427]} maxPolarAngle={Math.PI * 0.45}/>

      <NodeToyTick/>

      <Suspense fallback={null}>
        <Scene/>
        <Meteor/>
        <Beams/>
      </Suspense>
    </>
  )
}

export default App