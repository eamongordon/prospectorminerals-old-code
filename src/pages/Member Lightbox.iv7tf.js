import { currentMember, authentication } from 'wix-members';

$w.onReady(function () {
    loadMemberCard();
});

async function loadMemberCard() {
    const member = await currentMember.getMember();
    if (member.profile.nickname) {
        $w('#nameTxtLightbox').text = member.profile.nickname;
    } else {
        $w('#nameTxtLightbox').text = member.profile.slug;
    }
    if (member.profile.profilePhoto) {
        $w('#profilePicRegularLightbox, #profilePicHoverLightbox').src = member.profile.profilePhoto.url;
    }
    $w('#profilePicStateBoxLightbox').onMouseIn((event) => {
        $w('#profilePicStateBoxLightbox').changeState('HoverLightbox');
    });
    $w('#profilePicStateBoxLightbox').onMouseOut((event) => {
        $w('#profilePicStateBoxLightbox').changeState('RegularLightbox');
    });
    $w('#memberCardStateboxLightbox').changeState('cardLightbox');

}

export function logoutButtonLighBox_click(event) {
	authentication.logout();
}