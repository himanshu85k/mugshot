import React from 'react';
import { IonModal, IonButton, IonButtons, IonFabButton, IonIcon } from '@ionic/react';
import { shuffleOutline } from 'ionicons/icons';

import truthDareList from '../truthDareList'

export function ResultModal(props: any) {

    let footer;

    function handleTruthDareClick(choice: 'truth' | 'dare', setChosenText: React.Dispatch<React.SetStateAction<string>>) {
        let list: Array<string>;
        switch (choice) {
            case 'truth': list = truthDareList.truths;
                break;
            case 'dare': list = truthDareList.dares;
                break;
        }
        setChosenText(list[Math.floor(Math.random() * list.length)]);
    }

    if (!props.chosenText) {
        footer =
            <IonButtons>
                <IonButton size='large' color="secondary" fill="solid" expand="block" shape="round"
                    onClick={() => handleTruthDareClick('truth', props.setChosenText)}>
                    Truth
                </IonButton>
                <IonButton size='large' color="secondary" fill="solid" expand="block" shape="round"
                    onClick={() => handleTruthDareClick('dare', props.setChosenText)}>
                    Dare
                </IonButton>
            </IonButtons>;
    } else {
        footer =
            <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', width: '100%' }}>
                <p>{props.chosenText}</p><br />
                <IonFabButton onClick={props.handleShuffleClick}>
                    <IonIcon icon={shuffleOutline}></IonIcon>
                </IonFabButton>
            </div>;
    }

    return (
        <IonModal isOpen={props.isResultModalVisible} onDidDismiss={() => props.setResultModalVisible(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
                    <IonButton size='small' fill='outline' shape="round" onClick={() => props.setResultModalVisible(false)}>
                        Skip
                    </IonButton>
                </div>
                <img src={props.chosenOne} alt="" /><br />
                
                { footer }
            
            </div>
        </IonModal >
    );
}

