

import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import { drawLips, drawKeypoints, drawSkeleton, getHeadAnglesCos } from "./utilities";
import * as posenet from '@tensorflow-models/posenet';
import CanvasModel from "./Canvas/canvas";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const runFacemesh = async () => {
    const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
    // const net2 = await posenet.load({
    //   architecture: 'MobileNetV1',
    //   outputStride: 16,
    //   inputResolution: { width: 640, height: 480 },
    //   multiplier: 0.75
    // })
    setInterval(() => {
      detect(net);
    }, 1);
  };
  const [state, setstate] = useState([])
  const detect = async (net) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const face = await net.estimateFaces({ input: video });
      // const { score, keypoints } = await net2.estimateSinglePose(video)
      if (face.length > 0) {
        const faceWidth = Math.abs(face[0].annotations.rightCheek[0][0] - face[0].annotations.leftCheek[0][0]);
        const faceHeight = face[0].annotations.noseTip[0][1] - face[0].annotations.midwayBetweenEyes[0][1];
        setstate({
          headAngle: getHeadAnglesCos(face[0].scaledMesh),
          faceWidth, faceHeight,
          videoHeight, videoWidth,
          rightEyebrowUpper: face[0].annotations.rightEyebrowUpper[0]
        })
      }
      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => {
        drawLips(face, ctx)
        // if (score >= 0.1) {
        //   drawKeypoints(keypoints, 0.5, ctx);
        //   drawSkeleton(keypoints, 0.5, ctx);
        // }
      });
    }
  };

  useEffect(() => { runFacemesh() }, []);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <CanvasModel
          headAngle={state.headAngle}
          faceWidth={state.faceWidth}
          faceHeight={state.faceHeight}
          rightEyebrowUpper={state.rightEyebrowUpper}
          videoHeight={state.videoHeight}
          videoWidth={state.videoWidth}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
