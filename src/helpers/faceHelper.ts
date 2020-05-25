import * as faceapi from 'face-api.js'
import { FaceDetection } from 'face-api.js';

let lastRender: number;
let boxChangeTime: number;
let animationEndTime: number;
let current = 0;

const BOX_COLOR_CHANGE_DURATION = 200;
const BOX_HIGHLIGHT_COLOR = '#FFFF00';
const BOX_NORMAL_COLOR = '#FFFFFF';
const MODEL_URL = process.env.PUBLIC_URL + '/models';

export async function loadModels(setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    try {
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
        // await faceapi.loadFaceLandmarkModel(MODEL_URL)
        // await faceapi.loadFaceRecognitionModel(MODEL_URL)
    } catch (e) {
        console.log(`Exception occurred in loadModels(): ${e}`);
    }
    setLoading(false);
}

export async function recognize(
    photoPath: string,
    canvas: HTMLCanvasElement,
    div: HTMLDivElement
) {
    try {
        // let canvas = canvasRef.current as unknown as HTMLCanvasElement;
        // canvas = await drawImageOnCanvas(photoPath, divRef, canvas);

        // TODO: canvas.toDataURL("image/png");

        let fullFaceDescriptions = await faceapi.detectAllFaces(canvas);
        console.log('detected', fullFaceDescriptions)
        // chooseOne(fullFaceDescriptions, canvas, 3000);
        return fullFaceDescriptions;
    } catch (e) {
        console.log(`Exception occurred in recognize(): ${e}`);
    }
}
export function detectFaces(canvas: HTMLCanvasElement) {
    // return new Promise(async (resolve) => {
        /*let fullFaceDescriptions: FaceDetection[] =*/ return faceapi.detectAllFaces(canvas);
    //     console.log('detected', fullFaceDescriptions)
    //     // return fullFaceDescriptions
    //     resolve(fullFaceDescriptions);
    // })
    // canvas = await drawImageOnCanvas(photoPath, divRef, canvas);
    // let fullFaceDescriptions = await faceapi.detectAllFaces(canvas);
    // console.log('detected', fullFaceDescriptions)
    // // chooseOne(fullFaceDescriptions, canvas, 3000);
    // return fullFaceDescriptions;
}

export function drawImageOnCanvas(
    photoPath: string,
    div: HTMLDivElement,
    canvas: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const image = new Image();
    const imageLoaderPromise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        try {
            image.onload = function () {
                const viewWidth = div.offsetWidth;
                const scale = viewWidth / image.width;
                canvas.width = viewWidth;
                canvas.height = image.height * scale;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, viewWidth, image.height * scale);
                console.log('fr image drawn', Date.now());
                resolve(canvas);
            };
        } catch (e) {
            console.log(`Exception occurred in drawImageOnCanvas(): ${e}`)
            reject();
        }
    });
    image.src = photoPath;
    return imageLoaderPromise;
}

export function chooseOne(detections: any[], canvas: HTMLCanvasElement,
    duration: number = 3000, callback: (chooseOne: number) => void): number {
    boxChangeTime = lastRender = Date.now();
    animationEndTime = lastRender + duration;
    console.log(`starting animation; duration ${duration}, anima end time ${animationEndTime} `);
    animate(detections, canvas, 0, animationEndTime, callback);
    console.log('animation end ', Date.now())
    return current;
}

function animate(detections: any[], canvas: HTMLCanvasElement,
    current: number, animationEndTime: number, callback: (chooseOne: number) => void) {
    const currentTime = Date.now();
    let delta = currentTime - lastRender;
    lastRender = currentTime;
    boxChangeTime += delta;
    if (boxChangeTime > BOX_COLOR_CHANGE_DURATION) {
        boxChangeTime = 0;
        current = Math.floor(Math.random() * detections.length);
        // TODO: Not evenly distributed
        drawDetections(detections, canvas, current);
    }
    if (currentTime < animationEndTime) {
        requestAnimationFrame(() => animate(detections, canvas, current, animationEndTime, callback));
    } else {
        callback(current);
    }
}

export function drawDetections(detections: any[], canvas: HTMLCanvasElement, current: number) {
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.lineWidth = 2;
    context.strokeStyle = 'white';

    detections.forEach((detection, index) => {
        const box = detection.box;
        context.beginPath();
        context.strokeStyle = index === current ? BOX_HIGHLIGHT_COLOR : BOX_NORMAL_COLOR;
        context.rect(box.x, box.y, box.width, box.height);
        context.stroke();
    });
}

export function getCurrentFaceAsURL(
    canvas: HTMLCanvasElement,
    face: FaceDetection
): string {
    const { x, y, width, height } = face.box;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imageData = ctx.getImageData(x, y, width, height) as ImageData;

    const tempCanvas: HTMLCanvasElement = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext("2d") as CanvasRenderingContext2D;

    tempContext.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL("image/png");
}

