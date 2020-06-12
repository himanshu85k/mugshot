import {
  IonContent, IonPage, IonLoading, IonFab, IonIcon, IonFabButton,
  IonText, IonButtons, isPlatform
} from '@ionic/react';
import { cameraOutline, shuffleOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import { addNewToGallery } from '../helpers/cameraHelper';
import * as faceHelper from '../helpers/faceHelper'
import { ResultModal } from './ResultModal';
import { FaceDetection } from 'face-api.js';

import truthDareList from '../truthDareList'

const CAPTURE_IMAGE_STAGE = 'CAPTURE_IMAGE_STAGE';
const SHUFFLE_FACES_STAGE = 'SHUFFLE_FACES_STAGE';

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [hintText, setHintText] = useState('Click a group selfie to start.');
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [chosenOne, setChosenOne] = useState({ image: '', text: '' });
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [stage, setStage] = useState(CAPTURE_IMAGE_STAGE);
  let fabButton;

  useEffect(() => {
    faceHelper.loadModels(setLoading)
  }, []);

  async function handleCameraClick() {
    setLoading(true);
    setFaces([]);
    const photo = await addNewToGallery();
    if (photo) {
      drawCanvasAndFaceDetections(photo);
    } else {
      setLoading(false);
    }
  }

  async function handleFilePick(e: any) {
    setLoading(true);
    drawCanvasAndFaceDetections({ webviewPath: URL.createObjectURL(e.target.files[0]) })
  }

  function handleShuffleClick() {
    setChosenOne({
      image: '',
      text: ''
    });
    faceHelper.chooseOne(
      faces,
      canvasRef.current as unknown as HTMLCanvasElement,
      3000,
      (chosenIndex) => {
        setChosenOne({
          image: faceHelper.getCurrentFaceAsURL(
            canvasRef.current as unknown as HTMLCanvasElement, faces[chosenIndex]
          ),
          text: 'Winner pays the bill'
        });
        setResultModalVisible(true);
      }
    );
  }

  async function drawCanvasAndFaceDetections(photo: { webviewPath: string }) {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const canvasParentDiv = divRef.current as unknown as HTMLDivElement;
    await faceHelper.drawImageOnCanvas(photo.webviewPath, canvasParentDiv, canvas);
    const detectedFaces = await faceHelper.detectFaces(canvas) as FaceDetection[];
    faceHelper.drawDetections(detectedFaces, canvas, -1);
    // TODO: Add ability to tag more faces
    if (detectedFaces.length === 0) {
      setHintText('Can\'t find any faces. Try Again?');
    } else if (detectedFaces.length === 1) {
      setHintText('Seems like you are the only one here. Try Again with a few friends around?');
    } else {
      setHintText('Done! Tap shuffle to start!');
      setFaces(detectedFaces);
      setStage(SHUFFLE_FACES_STAGE);
    }
    setLoading(false);
  }

  if (stage === CAPTURE_IMAGE_STAGE) {
    fabButton = <IonFabButton onClick={handleCameraClick}>
      <IonIcon icon={cameraOutline}></IonIcon>
    </IonFabButton>;
  } else if (stage === SHUFFLE_FACES_STAGE) {
    fabButton = <IonFabButton onClick={handleShuffleClick}>
      <IonIcon icon={shuffleOutline}></IonIcon>
    </IonFabButton>;
  }
  return (
    <IonPage>
      <IonContent>
        <div ref={divRef} className='main-container'>
          <IonLoading isOpen={isLoading} showBackdrop={true} />
          <IonText className='recognition-text'>{hintText}</IonText>
          <IonFab vertical='bottom' horizontal='center' slot='fixed'>
            <IonButtons>
              {fabButton}
              {
                stage === CAPTURE_IMAGE_STAGE && isPlatform('desktop') &&
                <input type='file' accept='image/png, image/jpeg' onChange={handleFilePick} />
              }
            </IonButtons>
          </IonFab>
          <canvas ref={canvasRef} /><br />
        </div>
        <ResultModal isResultModalVisible={isResultModalVisible}
          setResultModalVisible={setResultModalVisible}
          chosenOne={chosenOne} />
      </IonContent>
    </IonPage>
  );
}

export default Home;

// ionic copy android
// npx cap open android

// ionic capacitor sync