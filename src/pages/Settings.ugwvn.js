import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import { updateData, sendSetPasswordEmailFunction, changeMemberLoginEmail } from '@prospectorminerals/memberfunctions-backend';
import wixData from 'wix-data';
import { getAuthUrlEnable } from '@prospectorminerals/google-oauth-sso';
import { getFBAuthUrlEnable } from '@prospectorminerals/facebookoauth';
import { generateSuccess, generateError } from 'public/statusbox.js';
import { formFactor } from 'wix-window';
//import { listCountries } from 'public/countrycodes.js';

let id = wixUsers.currentUser.id;
let email;
let loginData;
//let savedMemberData;

$w.onReady(async function () {
    retrieveProfileInfo();
    //retrieve2faStatus();
    //populatePhoneDropdown();
    if ($w('Button').some((obj) => obj.id === 'logoutButton')) {
        $w("#logoutButton").onClick(logoutAndRedirect);
    }
});

async function retrieveProfileInfo() {
    currentMember.getMember({ fieldsets: ['FULL'] })
        .then((member) => {
            if (formFactor !== 'Mobile') {
                if (member.profile.nickname) {
                    $w('#nameTxt').text = member.profile.nickname;
                } else {
                    $w('#nameTxt').text = member.profile.slug;
                }
                if (member.profile.profilePhoto) {
                    $w('#profileImg, #hoverProfileImg').src = member.profile.profilePhoto.url;
                }
                //$w('#memberCardStatebox').changeState('card');
                $w('#profilePicStateBox').onMouseIn((event) => {
                    $w('#profilePicStateBox').changeState('Hover');
                });
                $w('#profilePicStateBox').onMouseOut((event) => {
                    $w('#profilePicStateBox').changeState('Regular');
                });
                $w('#memberCardStatebox').changeState('card');
            }
            //savedMemberData = member;
            email = member.loginEmail;
            $w('#iDisplayName').value = member.profile.nickname;
            if (member.profile.profilePhoto) {
                $w('#profileImage').src = member.profile.profilePhoto.url;
            }
            $w('#iFirstName').value = member.contactDetails.firstName;
            $w('#iLastName').value = member.contactDetails.lastName;
            $w('#iEmail').value = member.loginEmail;
            $w('#iPhone').value = member.contactDetails.phones[0];
            $w('#loadingGif').hide();
            $w('#tabs').show();
            loadSocialLoginSettings(member._id);
        })
        .catch((err) => {
            console.log(err);
        });
}

async function loadSocialLoginSettings(memberId) {
    loginData = await wixData.get("LoginSettings", memberId);
    if (wixLocation.query.googleLoginStatus) {
        const tabtoSelect = $w('#tabs').tabs.find((obj) => obj.label === 'Login');
        $w('#tabs').changeTab(tabtoSelect);
        $w('#socialLoginLine').scrollTo();
        if (wixLocation.query.googleLoginStatus === 'success') {
            generateSuccess("Google login enabled.");
            wixLocation.queryParams.remove(['googleLoginStatus']);
        } else {
            generateError("Unable to enable Google login. This Google account may already be connected to another account.");
            wixLocation.queryParams.remove(['googleLoginStatus']);
        }
    } else if (wixLocation.query.facebookLoginStatus) {
        const tabtoSelect = $w('#tabs').tabs.find((obj) => obj.label === 'Login');
        $w('#tabs').changeTab(tabtoSelect);
        $w('#socialLoginLine').scrollTo();
        if (wixLocation.query.facebookLoginStatus === 'success') {
            generateSuccess("Facebook login enabled.");
            wixLocation.queryParams.remove(['facebookLoginStatus']);
        } else {
            generateError("Unable to enable Facebook login. This Facebook account may already be connected to another account.");
            wixLocation.queryParams.remove(['facebookLoginStatus']);
        }
    }
    loadSocialLoginRepeater();
    if (loginData.twoFactorAuthEnabled) {
        $w('#tfaswitch').checked = true;
        $w('#methodDropdown').value = loginData.twoFactorAuthMethods[0];
        $w('#methodDropdown').expand();
    }

    function loadSocialLoginRepeater() {
        $w('#socialLoginRepeater').forEachItem(($item, itemData, index) => {
            if ($item('#loginText').text === 'Google') {
                if (loginData.googleLoginEnabled) {
                    $item('#connectedStatusTxt').text = "Connected";
                    $item('#connectedStatusTxt').html = $item('#connectedStatusTxt').html.replace(/>/g, ' style="color: ' + "#22db54" + '">');
                    $item('#connectMode').hide();
                    $item('#disconnectMode').show();
                } else {
                    $item('#disconnectMode').hide();
                    $item('#connectMode').show();
                }
            } else if ($item('#loginText').text === 'Facebook') {
                if (loginData.facebookLoginEnabled) {
                    $item('#connectedStatusTxt').text = "Connected";
                    $item('#connectedStatusTxt').html = $item('#connectedStatusTxt').html.replace(/>/g, ' style="color: ' + "#22db54" + '">');
                    $item('#connectMode').hide();
                    $item('#disconnectMode').show();
                } else {
                    $item('#disconnectMode').hide();
                    $item('#connectMode').show();
                }
            }
        });
    }
}

async function retrieve2faStatus() {
    wixData.query("TwoFactorAuthMembers")
        .eq("_id", id)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w('#tfaswitch').checked = true;
                $w('#methodDropdown').value = results.items[0].type;
                $w('#methodDropdown').expand();
            }
        });
}

export function resetPassword_click(event) {
    $w('#resetPassword').disable();
    sendSetPasswordEmailFunction(email).then(() => {
        generateSuccess('Password reset email sent.');
    }).catch((error) => {
        generateError('There was an error sending a password reset email. Please try again later.');
    }).finally(() => {
        $w('#resetPassword').enable();
    })
}

export function updateProfile() {
    let items = $w("TextInput").map(el => $w("#" + el.id));
    let invalidCount = items.filter(el => !el.valid).length;
    let deletePhones;
    if (invalidCount === 0) {
        let member = {
            contactDetails: {
                firstName: $w('#iFirstName').value,
                lastName: $w('#iLastName').value,
                emails: [$w('#iEmail').value],
                phones: [$w('#iPhone').value],
            },
            profile: {
                nickname: $w('#iDisplayName').value,
                profilePhoto: {
                    url: $w('#profileImg').src
                }
            }
        }
        if (!$w('#iPhone').value) {
            deletePhones = true;
            delete member.contactDetails.phones;
        } else {
            deletePhones = false;
        }
        let prefs = {
            deletePhones: deletePhones
        }
        return updateData(member, prefs)
            .then((member) => {
                if (member.status === true) {
                    return { status: true };
                }
            }).catch((error) => {
                Promise.reject(error);
            })
    } else {
        $w("TextInput").updateValidityIndication();
    }
}

export function updateProfileBtn_click(event) {
    $w('#updateProfileBtn').disable();
    updateProfile()
        .then((res) => {
            generateSuccess('Profile Successfully Updated');
        }).catch((err) => {
            generateError('There was an error updating your account. Please check all required (*) fields.');
        }).finally(() => {
            $w('#updateProfileBtn').enable();
        })
}

export function discardProfileBtn_click(event) {
    retrieveProfileInfo();
}

function savetwofactorAuthSettings() {
    if ($w('#tfaswitch').checked === true) {
        //validateNumber(phone)
        //.then( (results) => {
        //if (results.isValid === true) {
        if ($w('#methodDropdown').value) {
            if ($w('#methodDropdown').value === 'email') {
                loginData.twoFactorAuthMethods = ['email'];
                loginData.twoFactorAuthEnabled = true;
                return wixData.save("LoginSettings", loginData).then(() => {
                    Promise.resolve({ status: true });
                });
            } else {
                if ($w('#iPhone').value && $w('#iPhone').valid === true) {
                    loginData.twoFactorAuthMethods = ['email'];
                    loginData.twoFactorAuthEnabled = true;
                    return wixData.save("LoginSettings", loginData).then(() => {
                        Promise.resolve({ status: true });
                    });
                } else {
                    $w('#tfaswitch').checked = false;
                    $w('#text41').text = "Please Enter a Valid Phone Number with the Country Code Included.";
                    Promise.reject();
                }
            }
        } else {
            $w('#tfaswitch').checked = false;
            $w('#text41').text = "Please Select a Valid Method from the Dropdown.";
            Promise.reject();
        }
        //})
    } else {
        loginData.twoFactorAuthMethods = [];
        loginData.twoFactorAuthEnabled = false;
        return wixData.save("LoginSettings", loginData).then(() => {
            Promise.resolve({ status: true });
        });
    }
}

function logoutAndRedirect(event) {
    Promise.all([wixLocation.to('/'), wixUsers.logout()]);
}

export function uploadButton_change(event) {
    $w("#uploadButton").uploadFiles()
        .then((uploadedFiles) => {
            $w('#profileImage').src = `https://static.wixstatic.com/media/${uploadedFiles[0].fileName}`;
        })
}

/*
async function populatePhoneDropdown() {
    const countryList = listCountries();
    const formattedCountries = countryList.map((obj) => {
        return { label: `${obj.name} (${obj.dial_code})`, value: obj.dial_code }
    });
    $w('#countryDropdown').options = formattedCountries;
}
*/

export function updateLoginBtn_click(event) {
    $w('#updateLoginBtn').disable();
    if ($w('#iEmail').value !== email) {
        Promise.all([changeMemberLoginEmail($w('#iEmail').value), savetwofactorAuthSettings()]).then(() => {
            email = $w('#iEmail').value;
            generateSuccess('Settings Successfully Updated');
        }).catch((error) => {
            console.log(error);
            generateError("An error occured. Try again later");
        }).finally(() => {
            $w('#updateLoginBtn').enable();
        })
    } else {
        savetwofactorAuthSettings().then((res) => {
            generateSuccess('Settings Successfully Updated');
        }).catch((err) => {
            console.log(err);
            generateError("An error occured. Try again Later.");
        }).finally(() => {
            $w('#updateLoginBtn').enable();
        });
    }
}

export function discardLoginBtn_click(event) {
    retrieveProfileInfo();
    retrieve2faStatus();
}

export function tfaswitch_change(event) {
    if (event.target.checked === true) {
        $w('#methodDropdown').expand();
    } else {
        $w('#methodDropdown').collapse();
    }
}

export function connectMode_click(event) {
    let $item = $w.at(event.context);
    $item('#connectMode').disable();
    if ($item('#loginText').text === "Google") {
        getAuthUrlEnable()
            .then((url) => {
                wixLocation.to(url);
            })
            .catch((error) => {
                $item('#connectMode').enable();
                console.log(error);
            });
    } else if ($item('#loginText').text === "Facebook") {
        getFBAuthUrlEnable()
            .then((url) => {
                wixLocation.to(url);
            })
            .catch((error) => {
                $item('#connectMode').enable();
                console.log(error);
            });
    }
}

export async function disconnectMode_click(event) {
    let $item = $w.at(event.context);
    $item('#disconnectMode').disable();
    if ($item('#loginText').text === "Google") {
        loginData.googleLoginEnabled = false;
        loginData.googleUserId = null;
        wixData.update("LoginSettings", loginData)
            .then(() => {
                $item('#connectedStatusTxt').html = `<p style="font-size:16px;"><span class="color_13"><span style="font-size:16px;">Disconnected</span></span></p>`;
                //$item('#connectedStatusTxt').html = $item('#connectedStatusTxt').html.replace(/>/g, ' style="color: ' + "#999797" + '">');
                //$item('#connectedStatusTxt').text = "Disconnected";
                generateSuccess("Google login disconnected");
                $item('#disconnectMode').hide();
                $item('#connectMode').show();
            })
            .catch((error) => {
                $item('#disconnectMode').enable();
                generateError();
                console.log(error);
            });
    } else if ($item('#loginText').text === "Facebook") {
        loginData.facebookLoginEnabled = false;
        loginData.facebookUserId = null;
        wixData.update("LoginSettings", loginData)
            .then(() => {
                $item('#connectedStatusTxt').html = `<p style="font-size:16px;"><span class="color_13"><span style="font-size:16px;">Disconnected</span></span></p>`;
                generateSuccess("Facebook login disconnected");
                $item('#disconnectMode').hide();
                $item('#connectMode').show();
            })
            .catch((error) => {
                $item('#disconnectMode').enable();
                generateError();
                console.log(error);
            });
    }
}