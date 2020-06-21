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
            <IonFabButton className='fab-button'
                style={
                    props.text ?
                        {} : { transform: 'translate(-50%, 0)' }
                }
            >
                <IonIcon icon={props.icon}></IonIcon>
            </IonFabButton>
        </div>
    );
}

