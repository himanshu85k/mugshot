import {
  IonContent, IonPage, IonLoading, isPlatform, IonButton, IonInput
} from '@ionic/react';
import { camera, shuffle } from 'ionicons/icons';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import './Home.css';

import { addNewToGallery } from '../helpers/cameraHelper';
import * as faceHelper from '../helpers/faceHelper'
import { ResultModal } from './ResultModal';
import { FaceDetection } from 'face-api.js';
import ActionTextButton from '../components/ActionTextButton';
import WinnerModal from './WinnerModal'
import dareList from '../dareList';


const appTitle = 'TrulyLucky';
const CAPTURE_IMAGE_STAGE = 'CAPTURE_IMAGE_STAGE';
const SHUFFLE_FACES_STAGE = 'SHUFFLE_FACES_STAGE';
const ROUNDS_PER_GAME = 9;

let currentRound = 0;
let facesChosen = new Set<number>();
let faces: FaceDetection[] = [];

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [hintText, setHintText] = useState('Click a group selfie to begin.');
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [chosenOne, setChosenOne] = useState('');
  const [chosenText, setChosenText] = useState('');
  const [stage, setStage] = useState(CAPTURE_IMAGE_STAGE);
  const [numRounds, setNumRounds] = useState(ROUNDS_PER_GAME);
  const [isWinnerModalVisible, setWinnerModalVisible] = useState(false);

  let fabButton;

  useEffect(() => {
    faceHelper.loadModels(setLoading)
  }, []);

  async function handleCameraClick() {
    setLoading(true);
    faces = [];
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
    setChosenOne('');
    setChosenText('');
    currentRound++;
    setHintText(`Round: ${currentRound}`);
    setResultModalVisible(false);
    faceHelper.chooseOne(
      faces,
      canvasRef.current as unknown as HTMLCanvasElement,
      3000,
      (chosenIndex) => {
        setChosenOne(faceHelper.getCurrentFaceAsURL(
          canvasRef.current as unknown as HTMLCanvasElement, faces[chosenIndex]
        ));
        facesChosen.add(chosenIndex);
        console.log('faces ', facesChosen, 'c len', facesChosen.size, 'f len', faces.length);
        if (facesChosen.size === faces.length - 1) {
          console.log('finding winner ');
          for (let i = 0; i < faces.length; i++) {
            if (!facesChosen.has(i)) {
              console.log('winner ', i);

            }
          }
        }
        setChosenText(dareList[Math.floor(Math.random() * dareList.length)]);
        setResultModalVisible(true);
      }
    );
  }

  function handleResetClick() {
    setHintText('Click a group selfie to start');
    setResultModalVisible(false);
    setChosenOne('');
    setChosenText('');
    setStage(CAPTURE_IMAGE_STAGE);
    setWinnerModalVisible(false);
    currentRound = 0;
    faces = [];
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function drawCanvasAndFaceDetections(photo: { webviewPath: string }) {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const canvasParentDiv = divRef.current as unknown as HTMLDivElement;
    await faceHelper.drawImageOnCanvas(photo.webviewPath, canvasParentDiv, canvas);
    const detectedFaces = await faceHelper.detectFaces(canvas) as FaceDetection[];
    faceHelper.drawDetections(detectedFaces, canvas, -1);
    // TODO: Add ability to tag more faces
    if (detectedFaces.length === 0) {
      setHintText('Can\'t find any faces. Try Again.');
    } else if (detectedFaces.length === 1) {
      setHintText('Seems like you are the only one here. Try Again.');
    } else {
      setHintText('Done! Tap shuffle!');
      faces = detectedFaces;
      setStage(SHUFFLE_FACES_STAGE);
    }
    setLoading(false);
  }

  if (stage === CAPTURE_IMAGE_STAGE) {
    fabButton =
      <ActionTextButton icon={camera} text={hintText} onClick={handleCameraClick} />
  } else if (stage === SHUFFLE_FACES_STAGE) {
    fabButton =
      <ActionTextButton icon={shuffle} text={hintText} onClick={handleShuffleClick} />
  }

  return (
    <IonPage>
      <IonContent>
        <div ref={divRef} className='main-container'>
          {
            stage === SHUFFLE_FACES_STAGE &&
            <IonButton size='small' fill='solid' shape='round' className="reset-button"
              onClick={handleResetClick}
            >
              reset
            </IonButton>
          }
          <h1 className="title">{appTitle}</h1>
          <IonLoading isOpen={isLoading} showBackdrop={true} />

          {fabButton}

          {
            stage === CAPTURE_IMAGE_STAGE &&
            <p className="rules-text"> <br />
              A player is randomly chosen upon each shuffle who needs to perform a dare.<br />
              Last person left without getting dare out of atleast &nbsp;
              <IonInput type="number" min="5" max="99" value={numRounds}
                onIonChange={e => setNumRounds(parseInt(e.detail.value!, 10))} />
                &nbsp; rounds WINS!
            </p>
          }
          {
            // for testing purposes only
            stage === CAPTURE_IMAGE_STAGE && isPlatform('desktop') &&
            <input type='file' accept='image/png, image/jpeg' onChange={handleFilePick} />
          }

          <canvas
            style={{ width: '100%', height: '0%' }}
            ref={canvasRef}
          />

        </div>
        <ResultModal
          isResultModalVisible={isResultModalVisible}
          setResultModalVisible={setResultModalVisible}
          chosenOne={chosenOne}
          chosenText={chosenText}
          setChosenText={setChosenText}
          handleShuffleClick={handleShuffleClick}
        />
        <WinnerModal isWinnerModalVisible={isWinnerModalVisible}
          setWinnerModalVisible={setWinnerModalVisible}
          handleResetClick={handleResetClick}
          chosenOne={chosenOne} />
      </IonContent>
    </IonPage>
  );
}

export default Home;

// TODO change splash screen