import {
  IonContent, IonPage, IonLoading, IonFab, IonIcon, IonFabButton,
  IonText, IonButton
} from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import { addNewToGallery } from '../services/camera.service';
import { detectFaces, loadModels, getCurrentFaceAsURL, chooseOne, drawImageOnCanvas } from '../services/faceRecognitionAndDrawing.service'
import { ResultModal } from './ResultModal';
import { FaceDetection } from 'face-api.js';

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [hintText, setHintText] = useState("Click a group selfie to start.");
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [winnerImage, setWinnerImage] = useState("");
  const [winnerText, setWinnerText] = useState("");
  const [faces, setFaces] = useState<FaceDetection[]>([]);

  useEffect(() => {
    loadModels(setLoading)
  }, []);

  function handleCameraClick() {
    // setLoading(true);
    performLoadings();
    // const photo = await addNewToGallery();
    // const canvas =  canvasRef.current as unknown as HTMLCanvasElement;
    // const canvasParentDiv = divRef.current as unknown as HTMLDivElement;
    // await drawImageOnCanvas(photo.webviewPath, canvasParentDiv, canvas);
    // console.log('image drawn on canvas');
    // const detectedFaces = await detectFaces(canvas);
    // console.log('faces detected, ', detectedFaces);


    // if (!detectedFaces || detectedFaces.length === 0) {
    //   setHintText("Can't find anyone. Try Again?");
    // } else if (detectedFaces.length === 1) {
    //   setHintText("Seems like you are the only one here. Try Again?");
    //   setWinnerImage(getCurrentFaceAsURL(canvas, detectedFaces[0]));
    //   setWinnerText("Pays the bill");
    //   setResultModalVisible(true);
    // } else {
    //   setFaces(detectedFaces);
    //   console.log('choosing face');
    //   const currentFace = await chooseOne(detectedFaces, canvas, 6000);
    //   console.log('chosen ', currentFace);
    //   setWinnerImage(getCurrentFaceAsURL(canvas, detectedFaces[currentFace]));
    //   setWinnerText("Pays the bill");
    //   setResultModalVisible(true);
    // }
    // setLoading(false);
  }

  async function performLoadings() {
    const photo = await addNewToGallery();
    const canvas =  canvasRef.current as unknown as HTMLCanvasElement;
    const canvasParentDiv = divRef.current as unknown as HTMLDivElement;
    await drawImageOnCanvas(photo.webviewPath, canvasParentDiv, canvas);
    console.log('image drawn on canvas');
    const detectedFaces = await detectFaces(canvas);
    console.log('faces detected, ', detectedFaces);


    if (!detectedFaces || detectedFaces.length === 0) {
      setHintText("Can't find anyone. Try Again?");
    } else if (detectedFaces.length === 1) {
      setHintText("Seems like you are the only one here. Try Again?");
      setWinnerImage(getCurrentFaceAsURL(canvas, detectedFaces[0]));
      setWinnerText("Pays the bill");
      setResultModalVisible(true);
    } else {
      setFaces(detectedFaces);
      console.log('choosing face');
      const currentFace = await chooseOne(detectedFaces, canvas, 6000);
      console.log('chosen ', currentFace);
      setWinnerImage(getCurrentFaceAsURL(canvas, detectedFaces[currentFace]));
      setWinnerText("Pays the bill");
      setResultModalVisible(true);
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div ref={divRef} className="main-container">
          <IonLoading isOpen={isLoading} showBackdrop={true} />
          {
            faces && faces.length <= 1 && <div>
              <IonText className="recognition-text">{hintText}</IonText>
              <IonFab vertical="bottom" horizontal="center" slot="fixed">
                <IonFabButton onClick={handleCameraClick}>
                  <IonIcon name="camera"></IonIcon>
                </IonFabButton>
              </IonFab>
            </div>
          }
          <canvas ref={canvasRef} /><br />
          <IonButton onClick={() => setResultModalVisible(true)}>Show Modal</IonButton>
        </div>
        <ResultModal isResultModalVisible={isResultModalVisible}
          setResultModalVisible={setResultModalVisible}
          winnerImage={winnerImage} winnerText={winnerText} />
      </IonContent>
    </IonPage >
  );
};

export default Home;

// ionic build
// ionic capacitor copy android
// npx cap open android

// ionic capacitor sync