import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import { currentMember } from 'wix-members';
import { formFactor } from 'wix-window';

$w.onReady(async function () {
    $w('#collectionsDataset').onReady(() => {
        $w('#loadingGif').hide();
        let count = $w('#collectionsDataset').getTotalCount();
        if (count > 0) {
            $w('#favarticlerepeater').show();
        } else {
            $w('#noCollectionsBox').show();
        }
    });
    if (formFactor !== 'Mobile') {
        loadMemberCard();
    }
});

export function logoutButton_click(event) {
    //Locate Back to Home
    wixLocation.to(`/home`);
    //Log Out
    wixUsers.logout();
}

async function loadMemberCard() {
    const member = await currentMember.getMember();
    if (formFactor !== 'Mobile') {
        if (member.profile.nickname) {
            $w('#nameTxt').text = member.profile.nickname;
        } else {
            $w('#nameTxt').text = member.profile.slug;
        }
        if (member.profile.profilePhoto) {
            $w('#profileImg, #hoverProfileImg').src = member.profile.profilePhoto.url;
        }
        $w('#profilePicStateBox').onMouseIn((event) => {
            $w('#profilePicStateBox').changeState('Hover');
        });
        $w('#profilePicStateBox').onMouseOut((event) => {
            $w('#profilePicStateBox').changeState('Regular');
        });
        $w('#memberCardStatebox').changeState('card');
    }
}