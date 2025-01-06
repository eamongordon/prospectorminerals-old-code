import {currentMember} from 'wix-members';
import wixUsers from 'wix-users';
//import {validateNumber} from '@velo/wix-members-2fa-twilio-backend'
import wixLocation from 'wix-location';
import wixSeo from 'wix-seo';
import wixData from 'wix-data';
import {scheduledeletion} from '@prospectorminerals/memberfunctions-backend';

let email;
let phone;
let userid;

$w.onReady( function() {
  setTitle();
  	wixData.query("TwoFactorAuthMembers")
    .eq("_id", wixUsers.currentUser.id)
    .find()
	  .then( (results) => {
      if (results.items.length > 0){
        $w('#tfaswicth').checked = true;
      }
    });
    currentMember.getMember({fieldsets: [ 'FULL' ]})
   .then( (results) => {
     email = results.loginEmail
     phone = results.contactDetails.phones[0];
     userid = results._id
  });
} );

export function logoutButton_click(event) {
	//Locate Back to Home
  wixLocation.to (`/home`); 
  //Log Out
  wixUsers.logout()
}

function setTitle() {
	wixSeo.setTitle("Account | Prospector Minerals")
    .then( () => {
      console.log("title set");
    } )
    .catch( () => {
      console.log("failed setting title");
    } );
}

export function tfaswicth_change(event) {
	if($w('#tfaswicth').checked === true){
    //validateNumber(phone)
    //.then( (results) => {
      //if (results.isValid === true) {
        if (phone) {
          wixData.insert("TwoFactorAuthMembers", {email: email, _id: wixUsers.currentUser.id})
          console.log(phone);
        } else {
          $w('#tfaswicth').checked = false;
          $w('#text41').text = "Please Enter a Valid Phone Number with the Country Code Included"
      }
    //})
  } else {
    wixData.remove("TwoFactorAuthMembers", wixUsers.currentUser.id);
  }
}

export function deactivateAccountTxt_click(event) {
	scheduledeletion();
}