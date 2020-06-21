import React from 'react';
import { IonModal, IonButton, IonButtons, IonFabButton, IonIcon } from '@ionic/react';
import { shuffleOutline } from 'ionicons/icons';
import './ResultModal.css';

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
                <IonButton className="truth-dare-button" size='large' color='secondary' fill='outline' expand='block' shape='round'
                    onClick={() => handleTruthDareClick('truth', props.setChosenText)}>
                    Truth
                </IonButton>
                <IonButton className="truth-dare-button" size='large' color='tertiary' fill='outline' expand='block' shape='round'
                    onClick={() => handleTruthDareClick('dare', props.setChosenText)}>
                    Dare
                </IonButton>
            </IonButtons>;
    } else {
        footer =
            <div className='flex-column'>
                <p className='chosen-text'>{props.chosenText}</p>
                <IonFabButton onClick={props.handleShuffleClick}>
                    <IonIcon icon={shuffleOutline}></IonIcon>
                </IonFabButton>
            </div>;
    }

    return (
        <IonModal isOpen={props.isResultModalVisible} onDidDismiss={() => props.setResultModalVisible(false)}>
            <div className='flex-column'>
                <div className='flex-row skip-button'>
                    <IonButton size='small' fill='solid' shape='round' onClick={() => props.setResultModalVisible(false)}>
                        skip
                    </IonButton>
                </div>
                <img src={props.chosenOne} alt='' />                
                { footer }            
            </div>
        </IonModal >
    );
}

