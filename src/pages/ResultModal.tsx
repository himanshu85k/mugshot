import React, { useEffect } from 'react';
import { IonModal, IonButton, IonFabButton, IonIcon } from '@ionic/react';
import { shuffleOutline } from 'ionicons/icons';


export function ResultModal(props: any) {

useEffect(() => {
},[]);

    function closeModal() {
        props.setResultModalVisible(false);
    }

    return (
        <IonModal isOpen={props.isResultModalVisible} onDidDismiss={closeModal}>
            <div className='flex-column'>
                <div className='flex-row skip-button'>
                    <IonButton size='small' fill='solid' shape='round' onClick={closeModal}>
                        skip
                    </IonButton>
                </div>
                <img src={props.chosenOne} alt='' />
                <div className='flex-column'>
                    <p className='chosen-text'>{props.chosenText}</p>
                    <IonFabButton onClick={props.handleShuffleClick}>
                        <IonIcon icon={shuffleOutline}></IonIcon>
                    </IonFabButton>
                </div>
            </div>
        </IonModal >
    );
}

