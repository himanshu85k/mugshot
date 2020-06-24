import React from 'react';
import { IonFabButton, IonIcon, IonText } from '@ionic/react';
import './ActionTextButton.css';

export default function ActionTextButton(props: any) {
    return (
        <div className='action-button' onClick={props.onClick}>
            {
                props.text ?
                    <IonText className='hint-text'>{props.text}</IonText> : ''
            }
            <IonFabButton className='fab-button'>
                <IonIcon icon={props.icon}></IonIcon>
            </IonFabButton>
        </div>
    );
}

