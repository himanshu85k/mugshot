import * as faceapi from 'face-api.js'
import { FaceDetection } from 'face-api.js';

let lastRender: number;
let boxChangeTime: number;
let animationEndTime: number;
let current = 0;

const BOX_COLOR_CHANGE_DURATION = 80;
const BOX_HIGHLIGHT_COLOR = '#372772';
const BOX_NORMAL_COLOR = '#FFFFFF';
const MODEL_URL = process.env.PUBLIC_URL + '/models';
const IMAGE_RESIZE_TO_WIDTH = 2000;
const BOX_LINE_WIDTH_MULTIPLY_FACTOR = 0.004;

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

export async function detectFaces(canvas: HTMLCanvasElement) {
    const detectedFaces = await faceapi.detectAllFaces(canvas);
    return detectedFaces.map(face => {
        const box = face.box;
        const margin = 0.1 * box.width;
        return {
            box: {
                x: box.x - margin,
                y: box.y - margin,
                width: box.width + 2 * margin,
                height: box.height + 2 * margin,
            }
        }
    });
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
                const viewWidth = Math.min(IMAGE_RESIZE_TO_WIDTH, image.width);
                const scale = viewWidth / image.width;
                canvas.width = viewWidth;
                canvas.height = image.height * scale;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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
    duration: number, callback: (chooseOne: number) => void): number {
    boxChangeTime = lastRender = Date.now();
    animationEndTime = lastRender + duration;
    animate(detections, canvas, 0, animationEndTime, callback);
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
    context.lineWidth = canvas.width * BOX_LINE_WIDTH_MULTIPLY_FACTOR;
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
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const padding = canvas.width * BOX_LINE_WIDTH_MULTIPLY_FACTOR;
    const imageData = ctx.getImageData(x + padding, y + padding,
                                        width - 2 * padding, height - 2 * padding) as ImageData;

    const tempCanvas: HTMLCanvasElement = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

    tempContext.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL('image/png');
}

