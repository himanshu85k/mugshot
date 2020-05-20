import { IonContent, IonPage, IonLoading, IonInput, IonFab, IonIcon, IonFabButton } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

import { addNewToGallery } from '../services/camera.service';
import { recognize, loadModels } from '../services/faceRecognitionAndDrawing.service'

async function handleCameraClick(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  canvasRef: React.MutableRefObject<null>,
  divRef: React.MutableRefObject<null>,
) {
  const photo = await addNewToGallery();
  setLoading(true);
  await recognize(photo.webviewPath, canvasRef, divRef);
  setLoading(false);
}

const Home: React.FC = () => {

  const canvasRef = useRef(null);
  const divRef = useRef(null);
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

          <IonInput value={winnerText} style={{fontSize: 28, padding: 10}} onIonChange={e => setWinnerText(e.detail.value as string)} clearInput></IonInput>

          <canvas ref={canvasRef} />

          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton onClick={() => handleCameraClick(setLoading, canvasRef, divRef)}>
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