//import { getAuthUrl } from '@velo/google-sso-integration';
import { getAuthUrlSignup } from '@prospectorminerals/google-oauth-sso';
import { getFBAuthUrlSignup } from '@prospectorminerals/facebookoauth';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';
import { formFactor } from 'wix-window';
import wixWindow from 'wix-window';

$w.onReady(function () {
    if (formFactor === "Mobile") {
        $w('#googleLogin').label = 'Google';
        $w('#facebookLogin').label = 'Facebook';
    }
    const receivedData = wixWindow.lightbox.getContext();
    if (receivedData.email){
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

export function passwordinput_input(event) {
    $w('#passwordCharCheckbox').show();
    if (event.target.value.length > 3) {
        $w('#passwordCharCheckbox').selectedIndices = [0];
    } else if (event.target.value.length === 0) {
        $w('#passwordCharCheckbox').value = null;
        $w('#passwordCharCheckbox').hide();
    } else {
        $w('#passwordCharCheckbox').value = null;
    }
}