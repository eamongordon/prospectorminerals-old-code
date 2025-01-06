import wixData from 'wix-data';
import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import { formFactor } from 'wix-window';

let userId = wixUsers.currentUser.id;
let buttonClickCount = 0;

async function getData() {
    const results = await wixData.query("MemberAPIUsage")
        .eq("title", userId)
        .find()
        .then((results) => {
            let member = results.items[0]
            let requestsnum = member.requests;
            let resetTime = member.resetTime;
            let limit = member.limit;
            let now = new Date();
            var queryTimeStamp = (member.resetTime).getTime();
            var nowTimeStamp = now.getTime();
            var microSecondsDiff = (queryTimeStamp - nowTimeStamp);
            var daysDiff = Math.floor(microSecondsDiff / (1000 * 60 * 60 * 24));
            var requestsPercentage = ((requestsnum / limit) * 100);
            if (wixWindow.rendering.env == "backend") {
                wixWindow.warmupData.set("RequestsData", requestsnum);
                wixWindow.warmupData.set("ResetTime", resetTime);
                wixWindow.warmupData.set("LimitData", limit);
                wixWindow.warmupData.set("DaysRemaining", daysDiff);
                wixWindow.warmupData.set("RequestsPercentage", requestsPercentage);
            }
        });
    return;
}

$w.onReady(async function () {
    if (formFactor !== 'Mobile') {
        loadMemberCard();
    }
    wixData.query("MemberAPIUsage")
        .eq("title", wixUsers.currentUser.id)
        .find()
        .then((results) => {
            let member = results.items[0]
            console.log(results.items.length)
            console.log(userId)
            let requestsnum = member.requests;
            let resetTime = member.resetTime;
            let limit = member.limit;
            let now = new Date();
            var queryTimeStamp = (member.resetTime).getTime();
            var nowTimeStamp = now.getTime();
            var microSecondsDiff = (queryTimeStamp - nowTimeStamp);
            var daysDiff = Math.ceil(Math.abs(microSecondsDiff / (1000 * 60 * 60 * 24)));
            var requestsPercentage = ((requestsnum / limit) * 100);
            var localResetTime = resetTime.toLocaleString();
            var roundedmonthsaway = Math.ceil(Math.abs(daysDiff / 30));
            let daysfr = roundedmonthsaway * 30
            if (microSecondsDiff <= 0) {
                console.log("Resetting Time")
                member.requests = 0
                member.resetTime = new Date(member.resetTime)
                member.resetTime.setDate(member.resetTime.getDate() + daysfr);
                console.log(member.resetTime)
                wixData.update("MemberAPIUsage", member);
                $w('#text51').text = 'Days Remaining'
            } else {
                $w('#text50').text = (daysDiff + 30).toLocaleString();
            }
            $w('#text44').text = wixUsers.currentUser.id;
            $w('#text47').text = requestsnum.toLocaleString();
            $w('#text49').text = limit.toLocaleString();
            $w('#text50').text = daysDiff.toLocaleString();
            $w('#progressBar1').value = requestsPercentage;
            $w('#text53').text = localResetTime;
            if (daysDiff === 1) {
                $w('#text51').text = 'Day Remaining'
            };
        });
    return;
    console.log(userId)
    wixSeo.setTitle("Developers | Prospector Minerals");
    const requestsResults = wixWindow.warmupData.get("RequestsData") || await getData();
    const resetTimeResults = wixWindow.warmupData.get("ResetTime") || await getData();
    const limitDataResults = wixWindow.warmupData.get("LimitData") || await getData();
    const daysRemainingResults = wixWindow.warmupData.get("DaysRemaining") || await getData();
    const requestsPercentageResults = wixWindow.warmupData.get("RequestsPercentage") || await getData();
    const options = {
        day: "numeric",
        month: "short",
        year: "numeric"
    };
    const daysRemainingResultsString = daysRemainingResults.toLocaleString("en", options);
    //const daysRemainingFinal = daysRemainingResultsString.split(' ').splice(0, 4).join(' ');
    $w('#text44').text = wixUsers.currentUser.id;
    $w('#text47').text = requestsResults.toLocaleString();
    $w('#text49').text = limitDataResults.toLocaleString();
    $w('#text50').text = daysRemainingResultsString;
    $w('#progressBar1').value = requestsPercentageResults;
    $w('#text53').text = resetTimeResults.toLocaleString();
    if (daysRemainingResults === 1) {
        $w('#text51').text = 'Day Remaining'
    };
});

export function keytoggleButton_click(event) {
    buttonClickCount++;
    if (buttonClickCount === 1) {
        $w('#text44').expand();
        $w('#keytoggleButton').label = 'Hide Key'
        $w('#copybutton').expand();
    } else {
        $w('#text44').collapse();
        $w('#copybutton').collapse();
        $w('#keytoggleButton').label = 'Show Key'
        buttonClickCount = 0
    }
}

export function logoutButton_click(event) {
    //Locate Back to Home
    wixLocation.to(`/home`);
    //Log Out
    wixUsers.logout()
}

export function copybutton_click(event) {
    wixWindow.copyToClipboard(userId)
        .then(() => {
            $w('#copybutton').label = 'Copy Again'
        })
        .catch((err) => {

        });
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