import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixSeo from 'wix-seo';
import { currentMember } from 'wix-members';

$w.onReady(async function () {
    setTitle();
    loadMemberCard();
});

export function logoutButton_click(event) {
    //Locate Back to Home
    wixLocation.to(`/home`);
    //Log Out
    wixUsers.logout();
}

function setTitle() {
    wixSeo.setTitle("Settings | Prospector Minerals")
        .then(() => {
            console.log("title set");
        })
        .catch(() => {
            console.log("failed setting title");
        });
}

async function loadMemberCard() {
    currentMember.getMember().then((member) => {
        if (member.profile.nickname) {
            $w('#nameTxt').text = member.profile.nickname;
        } else {
            $w('#nameTxt').text = member.profile.slug;
        }
        if (member.profile.profilePhoto) {
            $w('#profileImg, #hoverProfileImg').src = member.profile.profilePhoto;
        }
    });
    $w('#profilePicStateBox').onMouseIn((event) => {
        $w('#profilePicStateBox').changeState('Hover');
    });
    $w('#profilePicStateBox').onMouseOut((event) => {
        $w('#profilePicStateBox').changeState('Regular');
    });
}