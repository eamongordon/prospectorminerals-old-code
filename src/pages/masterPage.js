import { authentication, currentMember } from 'wix-members';
import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { prefetchPageResources } from 'wix-site';

const prefetch = prefetchPageResources({
    "lightboxes": ["Login Form"],
});

if (prefetch.errors) {
    console.warn("Unable to Prefetch Login Lightbox");
}

$w.onReady(async function () {
    if (authentication.loggedIn()) {
        if (wixWindow.formFactor === "Mobile") {
            loadMemberMobile();
            $w('#mobileAccountButton').label = 'Account';
        } else {
            $w("#accountButton").show();
            $w("#loginheaderButton").hide();
        }
        const memberprefetch = prefetchPageResources({
            "lightboxes": ["Member Lightbox"],
        });
        if (memberprefetch.errors) {
            console.warn("Unable to Prefetch Login Lightbox");
        }
    } else {
        if (wixWindow.formFactor === "Mobile") {
            $w('#mobileAccountButton').label = 'Log In';
        } else {
            $w("#accountButton").hide();
            $w('#loginheaderButton').show();
        }
    }
    $w('#copyrightTxt').html = `<p style="font-size:12px; line-height:normal;"><span style="letter-spacing:normal;"><span style="font-size:12px;"><span class="color_31">Copyright © ${new Date().getFullYear()}, All Rights Reserved. Please note that all content is property of prospectorminerals.com and cannot be used without our permission. If you wish to use any images or other content displayed on this site, please refer to our <span style="text-decoration:underline;"><a href="/policy#dataItem-kyjcqito" target="_self" data-anchor="dataItem-kyjcqito">copyright policy</a></span>.</span></span></span></p>`;
    authentication.onLogin(async (member) => {
        const loggedInMember = await member.getMember();
        const memberId = loggedInMember._id;
        if (wixWindow.formFactor === "Mobile") {
            loadMemberMobile();
            $w('#mobileAccountButton').label = 'Account';
        } else {
            $w("#loginheaderButton").hide();
            $w("#accountButton").show();
        }
        checkDeactivationAccounts(memberId);
        /*
        if (wixLocation.path.length > 0) {
            wixLocation.to(wixLocation.url);
        }
        */
    });
    authentication.onLogout(async () => {
        if (wixWindow.formFactor === "Mobile") {
            $w('#mobileAccountButton').label = 'Log In';
            $w('#memberProfileImgMobile').hide();
        } else {
            $w("#accountButton").hide();
            $w('#loginheaderButton').show();
        }
    });
    async function loadMemberMobile() {
        const member = await currentMember.getMember();
        if (member.profile.profilePhoto) {
            $w('#memberProfileImgMobile').src = member.profile.profilePhoto.url;
            $w('#memberProfileImgMobile').show();
            $w('#mobileMemberButton').hide();
        }
    }
});

function checkDeactivationAccounts(userId) {
    wixData.query("DeactivationAccounts")
        .eq("title", userId)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                wixWindow.openLightbox("Deactivate Account", { "message": "reactivate" });
            }
        });
}

export function searchIcon_click(event) {
    wixWindow.openLightbox("Search (Header)", { "page": wixLocation.path[0] });
}

export function mobileMemberButton_click(event) {
    if (authentication.loggedIn()) {
        wixLocation.to('/account/dashboard');
        //wixWindow.openLightbox("Member Lightbox");
    } else {
        authentication.promptLogin();
    }
}