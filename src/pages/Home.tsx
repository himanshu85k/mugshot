import { IonContent, IonPage, IonButton } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import * as faceapi from 'face-api.js'

const MODEL_URL = process.env.PUBLIC_URL + '/models';

async function loadModels(setLoading: any) {
  console.log('loading models')
  setLoading(true)
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL)
  setLoading(false)
}

async function recognize() {
  console.log('detecting')
  const image = imageRef.current;
  let fullFaceDescriptions = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
  console.log('detected', fullFaceDescriptions)
  
  const canvas: HTMLCanvasElement = drawImageOnCanvas(image, canvasRef.current);
  drawDetectionsOnCanvas(fullFaceDescriptions, image, canvas); 
}

function drawImageOnCanvas(image: any, canvas: any): HTMLCanvasElement {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  return canvas;
}

function drawDetectionsOnCanvas(fullFaceDescriptions: any, image: any, canvas: HTMLCanvasElement) {
  const dimensions = {
    width: image.width,
    height: image.height
  }
  const resizedDimensions = faceapi.resizeResults(fullFaceDescriptions, dimensions);
  faceapi.draw.drawDetections(canvas, resizedDimensions);
}

let imageRef: any;
let canvasRef: any;

const Home: React.FC = () => {

  imageRef = useRef(null);
  canvasRef = useRef(null);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadModels(setLoading)
  }, [])

  return (
    <IonPage>
      <IonContent>
        {isLoading ?
          'Loading...' : <IonButton onClick={recognize}>Choose One</IonButton>}
        <img src={process.env.PUBLIC_URL + '/sample.jpeg'} alt="" ref={imageRef} />
        <canvas ref={canvasRef}/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
