import {
    Plugins, CameraResultType, CameraDirection
} from '@capacitor/core';

const { Camera } = Plugins;

let photo: Photo;

export async function addNewToGallery() {
    try {
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            quality: 100,
            direction: CameraDirection.Front
        });
        photo = {
            filepath: "soon...",
            webviewPath: capturedPhoto.webPath as string
        };
        return { ...photo };
    } catch (e) {
        console.log(`Exception occurred in addNewToGallery(): ${e}`);
        return null;
    }
}


interface Photo {
    filepath: string;
    webviewPath: string;
    base64?: string;
}