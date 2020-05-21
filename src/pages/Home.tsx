import { IonContent, IonPage, IonLoading, IonInput, IonFab, IonIcon, IonFabButton, IonText } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import { addNewToGallery } from '../services/camera.service';
import { recognize, loadModels } from '../services/faceRecognitionAndDrawing.service'

async function handleCameraClick(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  canvasRef: React.MutableRefObject<null>,
  divRef: React.MutableRefObject<null>,
  setRecognitionText: React.Dispatch<React.SetStateAction<string>>
) {
  const photo = await addNewToGallery();
  setLoading(true);
  setRecognitionText("");
  const count = await recognize(photo.webviewPath, canvasRef, divRef);
  if (count === 0) {
    setRecognitionText("No faces were found");
  } else if (count === 1) {
    setRecognitionText("Seems like you are the only one here");
  }
  setLoading(false);
}

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [recognitionText, setRecognitionText] = useState("");
  const [winnerText, setWinnerText] = useState("Winner pays the bill");

  useEffect(() => {
    loadModels(setLoading)
  }, [])

  return (
    <IonPage>
      <IonContent>
        <div ref={divRef} className="main-container">
          <IonLoading isOpen={isLoading} showBackdrop={true} />

          <IonInput value={winnerText} className="winner-text"
            onIonChange={e => setWinnerText(e.detail.value as string)} clearInput></IonInput>

          <canvas ref={canvasRef} />
          <br />
          <IonText className="recognition-text">{recognitionText}</IonText>

          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton
              onClick={() => handleCameraClick(setLoading, canvasRef, divRef, setRecognitionText)}>
              <IonIcon name="camera"></IonIcon>
            </IonFabButton>
          </IonFab>
        </div>

      </IonContent>
    </IonPage >
  );
};

export default Home;

// ionic build
// ionic capacitor copy android
// npx cap open android

// ionic capacitor sync