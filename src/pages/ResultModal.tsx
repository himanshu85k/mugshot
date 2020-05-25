import React from 'react';
import { IonModal, IonButton } from '@ionic/react';

export function ResultModal(props: any) {

    return (
        <IonModal isOpen={props.isResultModalVisible} onDidDismiss={() => props.setResultModalVisible(false)}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection:"row", justifyContent: "flex-end", width: "100%" }}>
                    <IonButton size="small" fill="outline" onClick={() => props.setResultModalVisible(false)}>Close</IonButton>
                </div>
                <img src={props.winnerImage} alt="winner" />
                <p>{props.winnerText}</p>
            </div>
        </IonModal >

    )
}

