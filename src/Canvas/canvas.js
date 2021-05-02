import React, { Suspense, useRef } from "react";
import { Canvas, useLoader, useFrame, extend, useThree } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import glasses from './glasses.obj'
import { Euler } from "three";
import { motion } from "framer-motion";
extend({ OrbitControls });

function Loading() {
  return (
    <mesh visible position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <sphereGeometry attach="geometry" args={[1, 16, 16]} />
      <meshStandardMaterial
        attach="material"
        color="white"
        transparent
        opacity={0.6}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

const CameraControls = () => {

  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controls = useRef();
  useFrame(state => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
    />
  );
};


function Glasses({ degree }) {
  const group = useRef();
  const glassesObj = useLoader(OBJLoader, glasses);
  return (
    <group ref={group}>
      <mesh visible geometry={glassesObj.children[0].geometry} rotation={new Euler(4.75 - degree[0], -degree[2], -degree[1], 'XYZ')}>
        <meshStandardMaterial
          attach="material"
          color="white"
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
export default function CanvasModel(props) {
  const { headAngle, faceHeight, faceWidth, rightEyebrowUpper = [0, 0], videoWidth, videoHeight } = props;
  const errorCorrection = 200;
  return (
    <div style={{ position: 'absolute', width: videoWidth, height: videoHeight }} >
      <motion.div
        style={{ width: faceWidth + errorCorrection, height: faceHeight + errorCorrection, overflow: 'visible' }}
        transition={{
          y: { duration: 1 },
          x: { duration: 1 }
        }}
        animate={{ 
          x: [rightEyebrowUpper[0] - 75, rightEyebrowUpper[0] -  75], 
          y: [rightEyebrowUpper[1] -  75, rightEyebrowUpper[1] -  75], 
          z: [rightEyebrowUpper[2], rightEyebrowUpper[2]] }}>
        {/* <div style={{ zIndex: 100, position: 'absolute', transform: `translate(${rightEyebrowUpper[0]}, ${rightEyebrowUpper[1]}` }}> */}
        <Canvas camera={{zoom: .4}} style={{
          height: faceHeight + errorCorrection, width: faceWidth + errorCorrection, zIndex: 100, overflow: 'visible'
        }}>
          {/* <CameraControls /> */}
          <directionalLight intensity={1} />
          <Suspense fallback={<Loading />}>
            <Glasses degree={headAngle || [4.75, 0]} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}
