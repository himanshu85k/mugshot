import {
  IonContent, IonPage, IonLoading, isPlatform, IonButton, IonInput
} from '@ionic/react';
import { camera, shuffle } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import { addNewToGallery } from '../helpers/cameraHelper';
import * as faceHelper from '../helpers/faceHelper'
import { ResultModal } from './ResultModal';
import { FaceDetection } from 'face-api.js';
import ActionTextButton from '../components/ActionTextButton';
import WinnerModal from './WinnerModal'
import dareList from '../dareList';


const appTitle = 'MugShot';
const CAPTURE_IMAGE_STAGE = 'CAPTURE_IMAGE_STAGE';
const SHUFFLE_FACES_STAGE = 'SHUFFLE_FACES_STAGE';
const ROUNDS_PER_GAME = 9;
const MIN_ROUNDS = 5;
const MAX_ROUNDS = 99;

let currentRound = 0;
let facesChosen = new Set<number>();
let faces: FaceDetection[] = [];

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const numRoundsRef = useRef(null);
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
        if (currentRound >= numRounds && facesChosen.size === faces.length - 1) {
          console.log('finding winner ');
          for (let i = 0; i < faces.length; i++) {
            if (!facesChosen.has(i)) {
              console.log('winner ', i);
              setChosenOne(faceHelper.getCurrentFaceAsURL(
                canvasRef.current as unknown as HTMLCanvasElement, faces[i]
              ));
              setWinnerModalVisible(true);
              return;
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

  async function focusToNumRounds() {
    const el = await (numRoundsRef as any).current.getInputElement();
    el.focus();
  }

  function handleInput(event: any) {
    console.log('DEBUG: event ', event);
    const input = event.target.value || '0';
    const value = parseInt(input, 10);
    console.log('DEBUG: input ', value);
    if (value < MIN_ROUNDS) {
      setNumRounds(MIN_ROUNDS);
    } else if (value > MAX_ROUNDS) {
      setNumRounds(MAX_ROUNDS);
    } else {
      setNumRounds(value);
    }
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
            <div className="flex-column">
              <p className="rules-text"> <br />
              A player is randomly chosen upon each shuffle. He/She would have to perform a dare.<br />
              The player to get least number of dares out of at least &nbsp;
              <IonInput className="rounds-input" ref={numRoundsRef} type="number" value={numRounds}
                  onIonBlur={handleInput} />
                &nbsp; rounds WINS!
              </p> <br /><br />
              <IonButton className="flex-row change-num-rounds" size='small' fill='solid' shape='round' onClick={focusToNumRounds}>
                Change number of rounds
              </IonButton>
            </div>

          }
          {
            // for testing purposes only
            // stage === CAPTURE_IMAGE_STAGE && isPlatform('desktop') &&
            // <input type='file' accept='image/png, image/jpeg' onChange={handleFilePick} />
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