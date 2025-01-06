import { deleteUsersHandle } from 'backend/members.jsw';
import { sendEmailLoginLink } from '@prospectorminerals/nodemailer-link-login-backend';
import { checkMember } from '@prospectorminerals/memberfunctions-backend';
import wixData from 'wix-data';

$w.onReady(function () {
    console.log($w('#vectorImage7').src);
    //checkMember('')
});


export function deleteacc_click(event) {
    deleteUsersHandle()
        .then(() => {
            $w('#text39').show();
        })
}

export function SendLoginEmailLink_click(event) {
    sendEmailLoginLink('ekeokigordon@icloud.com');
}
