import * as posenet from '@tensorflow-models/posenet';

// Drawing Mesh
export const drawMesh = (ctx, keypoints) => {
  ctx.moveTo(keypoints[0][0], keypoints[0][0])
  ctx.beginPath();
  let i;
  for (i = 1; i < keypoints.length - 2; i++) {
    const x = keypoints[i][0];
    const y = keypoints[i][1];
    // ctx.arc(x, y, 1 /* radius */, 0, 3 * Math.PI);
    var xc = (keypoints[i][0] + keypoints[i + 1][0]) / 2;
    var yc = (keypoints[i][1] + keypoints[i + 1][1]) / 2;
    ctx.quadraticCurveTo(keypoints[i][0], keypoints[i][1], xc, yc);
  }
  ctx.quadraticCurveTo(keypoints[i][0], keypoints[i][1], keypoints[i + 1][0], keypoints[i + 1][1]);
  ctx.fillStyle = "red";
  ctx.fill()
};

let drawAllPoints = (keypoints, ctx) => {
  for (let i = 0; i < keypoints.length; i++) {
    const x = keypoints[i][0];
    const y = keypoints[i][1];

    ctx.beginPath();
    // ctx.arc(x, y, 1 /* radius */, 0, 3 * Math.PI);
    ctx.fillStyle = "aqua";
    ctx.fillText(i, x, y);
  }
}

export const drawLips = (predictions, ctx) => {
  predictions.forEach((prediction) => {
    const lipsLowerInner = prediction.annotations.lipsLowerInner;
    const lipsUpperInner = prediction.annotations.lipsUpperInner;
    const lipsLowerOuter = prediction.annotations.lipsLowerOuter;
    const lipsUpperOuter = prediction.annotations.lipsUpperOuter;
    drawMesh(ctx, [...lipsLowerInner, ...lipsLowerOuter]);
    drawMesh(ctx, [...lipsUpperInner, ...lipsUpperOuter]);
    // drawAllPoints(prediction.scaledMesh, ctx)
  })
}

const color = 'aqua';
const lineWidth = 2;

export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function toTuple({ y, x }) {
  return [y, x];
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints =
    posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
      toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
      scale, ctx);
  });
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}



const pythagoras = (sides) => {
  let norm = 0;
  for (const v of sides) {
    norm += v * v;
  }
  return Math.sqrt(norm);
}
export const getHeadAnglesCos = (keypoints) => {
  const faceVerticalCentralPoint = [0, (keypoints[10][1] + keypoints[152][1]) * 0.5, (keypoints[10][2] + keypoints[152][2]) * 0.5];
  const verticalAdjacent = keypoints[10][2] - faceVerticalCentralPoint[2];
  const verticalOpposite = keypoints[10][1] - faceVerticalCentralPoint[1];
  const verticalHypotenuse = pythagoras([verticalAdjacent, verticalOpposite]);
  const verticalCos = verticalAdjacent / verticalHypotenuse;

  const faceHorizontalCentralPoint = [(keypoints[226][0] + keypoints[446][0]) * 0.5, 0, (keypoints[226][2] + keypoints[446][2]) * 0.5];
  const horizontalAdjacent = keypoints[226][2] - faceHorizontalCentralPoint[2];
  const horizontalOpposite = keypoints[226][0] - faceHorizontalCentralPoint[0];
  const horizontalHypotenuse = pythagoras([horizontalAdjacent, horizontalOpposite,]);
  const horizontalCos = horizontalAdjacent / horizontalHypotenuse;

  const faceDepthCentralPoint = [(keypoints[226][0] + keypoints[446][0]) * 0.5, (keypoints[226][1] + keypoints[446][1]) * 0.5, 0];
  const depthAdjacent = keypoints[226][1] - faceDepthCentralPoint[1];
  const depthOpposite = keypoints[226][0] - faceDepthCentralPoint[0];
  const depthHypotenuse = pythagoras([depthAdjacent, depthOpposite,]);
  const depthCos = depthAdjacent / depthHypotenuse;

  return [verticalCos, horizontalCos, depthCos];
}