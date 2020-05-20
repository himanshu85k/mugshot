import { IonContent, IonPage, IonLoading, IonInput, IonFab, IonIcon, IonFabButton } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import * as faceapi from 'face-api.js'

import { addNewToGallery } from '../services/camera.services';

const MODEL_URL = process.env.PUBLIC_URL + '/models';

async function loadModels(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  // await faceapi.loadFaceLandmarkModel(MODEL_URL)
  // await faceapi.loadFaceRecognitionModel(MODEL_URL)
  setLoading(false)
}

async function recognize(photoPath: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  setLoading(true);
  let canvas = canvasRef.current as unknown as HTMLCanvasElement;
  canvas = drawImageOnCanvas(photoPath, canvas);
  let fullFaceDescriptions = await faceapi.detectAllFaces(canvas);
  console.log('detected', fullFaceDescriptions)
  drawDetections(fullFaceDescriptions, canvas);
  setLoading(false);
}

function drawImageOnCanvas(photoPath: string, canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const image = new Image();
  image.onload = function () {
    const viewWidth = (divRef.current as unknown as HTMLDivElement).offsetWidth;
    const scale = viewWidth / image.width;
    canvas.width = viewWidth;
    canvas.height = image.height * scale;
    ctx.drawImage(image, 0, 0, viewWidth, image.height * scale);
  };
  image.src = photoPath;
  return canvas;
}

function drawDetections(detections: any[], canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  detections.forEach((detection) => {
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = "white";
    const box = detection.box;
    context.rect(box.x, box.y, box.width, box.height);
    context.stroke();
  })
}

async function handleCameraClick(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  const photo = await addNewToGallery();
  recognize(photo.webviewPath, setLoading);
}


let canvasRef: React.MutableRefObject<null>;
let divRef: React.MutableRefObject<null>;

const Home: React.FC = () => {

  canvasRef = useRef(null);
  divRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [winnerText, setWinnerText] = useState("Winner pays the bill");

  useEffect(() => {
    loadModels(setLoading)
  }, [])

  return (
    <IonPage>
      <IonContent>
        <div ref={divRef} style={{ maxWidth: 800, margin: "auto", height: "100%" }}>
          <IonLoading isOpen={isLoading} showBackdrop={true} />

          <IonInput value={winnerText} onIonChange={e => setWinnerText(e.detail.value as string)} clearInput></IonInput>

          <canvas ref={canvasRef} />

          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton onClick={() => handleCameraClick(setLoading)}>
              <IonIcon name="camera"></IonIcon>
            </IonFabButton>
          </IonFab>
        </div>


      </IonContent>
    </IonPage >
  );
};

export default Home;