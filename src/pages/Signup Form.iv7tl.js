import { getAuthUrlSignup } from '@prospectorminerals/google-oauth-sso';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { session } from 'wix-storage';
import { authentication } from 'wix-members';
import { getFBAuthUrlSignup } from '@prospectorminerals/facebookoauth';
import { checkMember, registerNewUser } from '@prospectorminerals/memberfunctions-backend'
import { generateError } from 'public/statusbox.js';

let debounceTimer;

$w.onReady(function () {
    const receivedData = wixWindow.lightbox.getContext();
    if (receivedData.email) {
        $w('#emailInput').value = receivedData.email;
    }
});

export function googleLogin_click(event) {
    $w('#googleLogin').disable();
    getAuthUrlSignup()
        .then((url) => {
            session.setItem("landingPage", wixLocation.url);
            wixLocation.to(url);
        })
        .catch((error) => {
            console.log(error);
        });
}

export function facebookLogin_click(event) {
    $w('#facebookLogin').disable();
    getFBAuthUrlSignup()
        .then((url) => {
            session.setItem("landingPage", wixLocation.url);
            wixLocation.to(url);
        })
}

function updateValidity() {
    generateError('Please fill out all fields.');
    $w("TextInput").updateValidityIndication();
}

export async function emailContinueBtn_click(event) {
    $w('#emailContinueBtn').disable();
    const email = $w('#emailInput').value;
    if ($w('#emailInput').valid) {
        $w('#statebox').changeState('Loading');
        const res = await checkMember(email);
        if (res.results === true) {
            wixWindow.openLightbox("Login Form", { "email": email });
        } else {
            $w('#passwordEmailDisplay').value = email;
            $w('#statebox').changeState('Password');
        }
    } else {
        updateValidity();
        $w('#emailContinueBtn').enable();
    }
}

export function passwordLoginBtn_click(event) {
    $w('#passwordLoginBtn').disable();
    if ($w('#passwordInput, #firstNameInput, #lastNameInput').valid) {
        $w('#statebox').changeState('Loading');
        const options = {
            contactInfo: {
                firstName: $w('#firstNameInput').value,
                lastName: $w('#lastNameInput').value
            }
        }
        registerNewUser($w('#passwordEmailDisplay').value, $w('#passwordInput').value, options).then((sessionToken) => {
            authentication.applySessionToken(sessionToken).then(() => {
                wixWindow.lightbox.close();
            })
        }).catch((error) => {
            generateError('An error occurred. Try again later');
        })
    } else {
        $w('#passwordLoginBtn').enable();
        updateValidity();
    }
}

export function editEmailBtn_click(event) {
    $w('#statebox').changeState('Email');
    $w('#emailContinueBtn').enable();
}

export function showPasswordBtn_click(event) {
    if ($w("#passwordInput").inputType === 'password') {
        $w("#passwordInput").inputType = 'text';
        $w("#showPasswordBtn").label = "Hide";
    } else {
        $w("#passwordInput").inputType = 'password';
        $w("#showPasswordBtn").label = "Show";
    }
}

export function emailInput_keyPress(event) {
    if (event.key === "Enter") {
        emailContinueBtn_click();
    }
}

export function passwordInput_keyPress(event) {
    if (event.key === "Enter") {
        passwordLoginBtn_click();
    }
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        $w('#passwordCharCheckbox').show();
        if (event.target.value.length > 3) {
            $w('#passwordCharCheckbox').selectedIndices = [0];
        } else if (event.target.value.length === 0) {
            $w('#passwordCharCheckbox').value = null;
            $w('#passwordCharCheckbox').hide();
        } else {
            $w('#passwordCharCheckbox').value = null;
        }
    }, 500);
}

export function socialMediaSignupTxt_click(event) {
    $w('#statebox').changeState('Email');
    $w('#emailContinueBtn').enable();
}