import { getAuthUrlSignup } from '@prospectorminerals/google-oauth-sso';
import { getFBAuthUrlSignup } from '@prospectorminerals/facebookoauth-backend';
import { authentication } from 'wix-members';
import { registerNewUser } from '@prospectorminerals/memberfunctions-backend';
import wixLocation from 'wix-location';
import { local } from 'wix-storage';

export function googleLogin_click(event) {
    $w('#googleLogin').disable();
    getAuthUrlSignup()
        .then((url) => {
            local.setItem("landingPage", "/");
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
            local.setItem("landingPage", "/");
            wixLocation.to(url);
        })
}

export function signup_click(event) {
    if ($w('TextInput').valid) {
        $w('#signup').disable();
        let options = {
            contactInfo: {
                firstName: $w('#first').value,
                lastName: $w('#last').value
            },
            privacyStatus: 'PUBLIC'
        }
        registerNewUser($w('#email').value, $w('#passwordinput').value, options)
            .then((sessionToken) => {
				if (sessionToken.status){
					if (sessionToken.message.message.includes('already exists')){
						$w('#errTxt').text = 'An account with this email address already exists.'
					}
                	$w('#errTxt').show();
        			$w('TextInput').updateValidityIndication();
                	$w('#signup').enable();					
				} else {
                authentication.applySessionToken(sessionToken).then(() => {
                    wixLocation.to('/');
                });
				}
            });
    } else {
        $w('TextInput').updateValidityIndication();
        $w('#errTxt').show();
    }
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