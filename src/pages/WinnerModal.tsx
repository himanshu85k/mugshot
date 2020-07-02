import React from 'react';
import { IonModal, IonButton } from '@ionic/react';

export default function WinnerModal(props: any) {

    function closeModal() {
        props.setWinnerModalVisible(false);
    }
    return (
        <IonModal isOpen={props.isWinnerModalVisible} onDidDismiss={closeModal}>
            <div className='flex-column'>
                <img src={props.chosenOne} alt='' />
                <p className='chosen-text'>Winner here! Rejoice!</p>
                <IonButton className="button" size='large' color='secondary'
                    fill='outline' expand='block' shape='round' onClick={props.handleResetClick}>
                    Re-Match
                </IonButton>
            </div>
        </IonModal >
    );
}
