import { formFactor, openLightbox } from 'wix-window';
import { elementExists } from 'public/util.js';

let errorDetails;

export function generateError(message) {
    $w('#statusbox').show();
    $w('#statusbox').style.backgroundColor = '#FF4040';
    $w('#statustext').text = message || "An error occurred. Please try again later."
    $w('#statusBoxErrorIcon').show();
    $w('#statusBoxSuccessIcon').hide();
    //$w('#statustext').html = `<h5 style="color: #eb4034; text-align:center; font-size:20px;"><span style="font-size:20px;">${message}</span></h5>`;
    setTimeout(function () {
        $w('#statusbox').hide('fade', { duration: 200 });
    }, 3000);
}

export function generateInfo(message) {
    $w('#statusbox').show('fade', { duration: 200 });
    $w('#statustext').text = message;
    setTimeout(function () {
        $w('#statusbox').hide('fade', { duration: 200 });
    }, 3000);
}

export function generateSuccess(message, details) {
    $w('#statusbox').show('fade', { duration: 200 });
    $w('#statusbox').style.backgroundColor = '#22DB54';
    $w('#statustext').text = message;
    $w('#statusBoxErrorIcon').hide();
    $w('#statusBoxSuccessIcon').show();
    if (details && elementExists('Button', 'statusErrorDetails') === true && elementExists('Button', 'closeStatusMessageButton') === true) {
        errorDetails = details;
        $w('#statusErrorDetails').show();
        $w('#closeStatusMessageButton').hide();
    }
    //$w('#statustext').html = `<h5 style="color: #3bde2c; text-align:center; font-size:20px;"><span style="font-size:20px;">${message}</span></h5>`;
    setTimeout(function () {
        $w('#statusbox').hide('fade', { duration: 200 });
        if (elementExists('Button', 'closeStatusMessageButton')) {
            $w('#statusErrorDetails').hide();
            $w('#closeStatusMessageButton').show();
        }
    }, 3000);
}

if (formFactor !== 'Mobile') {
    if (elementExists('Button', 'closeStatusMessageButton')) {
        $w('#closeStatusMessageButton').onClick(() => {
            $w('#statusbox').hide('fade', { duration: 200 });
        });
    }
    if (elementExists('Button', 'statusErrorDetails')) {
        $w('#statusErrorDetails').onClick(() => {
            openLightbox("Error Details", { message: errorDetails });
        });
    }
}