import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { authentication, currentMember } from 'wix-members';
import wixLocation from 'wix-location';
import { updateViewCount } from 'backend/viewcounts.jsw';

let mineral;
let memberId;

$w.onReady(async function () {
    await $w("#dynamicDataset").onReady(async () => {
        mineral = await $w('#dynamicDataset').getCurrentItem();
        let section = wixLocation.query.section;
        if (section) {
            $w(`#${section}`).scrollTo();
        }
        let breadcrumbItems = [];
        breadcrumbItems.push({ 'label': 'Minerals', 'link': mineral['link-database-all'] }, { 'label': mineral.title, 'link': mineral['link-database-title'], 'isCurrent': true });
        $w('#breadcrumbs').items = breadcrumbItems;
        $w("#varietiesDataset").onReady(() => {
            checkVarieties();
        });
        $w('#photosButton').target = "_blank";
        $w('#photosButton').link = `/photos?mineral=${mineral.title}`;
        $w('#moreLocalitiesText').text = `View More ${mineral.title} Localities ▸`;
        //$w('#articles').label = `${mineral.title} Articles`;
        $w('#articles').link = `/articles/search/${mineral.title}`;
        if (!mineral.notableLocalities) {
            $w('#notableLocalitiesTxt').collapse();
        }
        if (!mineral.uses) {
            $w('#usesandapplications, #usesandapplicationsBox').collapse();
        }
        if (!mineral.associatedMinerals) {
            $w('#associatedminerals, #associatedmineralsBox').collapse();
        }
        if (authentication.loggedIn()) {
            currentMember.getMember().then((member) => {
                memberId = member._id;
                checkFavoriteMinerals();
            })
            $w('#mailinglistContainer').hide();
        } else {
            $w('#notInfavminerals').show('fade', { duration: 100 });
            $w('#infavminerals').hide('fade', { duration: 100 });
        }
        if (mineral.countViews === true) {
            if (wixWindow.rendering.env === "browser") {
                return updateViewCount(mineral, "Database", mineral.views);
            }
        }
    });
    $w('#facebookIcon').link = `https://www.facebook.com/sharer/sharer.php?u=${wixLocation.url}`
    $w('#twitterIcon').link = `https://www.twitter.com/share?url=${wixLocation.url}`
    $w("#localitiesDataset").onReady(async () => {
        const totalLocalityCount = $w('#localitiesDataset').getTotalCount();
        if (totalLocalityCount === 0) {
            $w('#notablelocalities, #notablelocalitiesBox').collapse();
        }
    });
});

export function infavminerals_click(event, $w) {
    if (authentication.loggedIn()) {
        removeFromfavminerals();
    }
}

export function notInfavminerals_click(event, $w) {
    if (authentication.loggedIn()) {
        addTofavminerals();

    } else {
        authentication.promptLogin({ "mode": "login" });
    }
}

//-------------Wishlist Functionality-------------//

async function addTofavminerals() {
    $w('#notInfavminerals').hide('fade', { duration: 100 });
    $w('#infavminerals').show('fade', { duration: 100 });
    await wixData.insertReference("FavoriteItems", "mineral", memberId, mineral)
        .then(() => {
            console.log("Reference inserted");
        })
        .catch((error) => {
            console.log(error);
        });
}

async function checkFavoriteMinerals() {
    wixData.isReferenced("FavoriteItems", "mineral", memberId, mineral)
        .then((result) => {
            let isReferenced = result; // true
            if (isReferenced) {
                $w('#infavminerals').show('fade', { duration: 100 });
                $w('#notInfavminerals').hide('fade', { duration: 100 });
            } else {
                $w('#notInfavminerals').show('fade', { duration: 100 });
                $w('#infavminerals').hide('fade', { duration: 100 });
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

async function removeFromfavminerals() {
    $w('#infavminerals').hide();
    $w('#notInfavminerals').show();
    await wixData.removeReference("FavoriteItems", "mineral", memberId, mineral)
        .then(() => {
            console.log("Reference removed");
        })
        .catch((error) => {
            console.log(error);
        });
}

function checkVarieties() {
    if ($w('#varietiesDataset').getTotalCount() === 0) {
        $w('#varieties, #varietiesBox').collapse();
    }
}

export function morephotosText_click(event) {
    wixLocation.to(`/galleries/${mineral.title}`);
}

export function moreLocalitiesText_click(event) {
    wixLocation.to(`/locality-database?locality=${mineral.title}`);
}

export function quiz_click(event) {
    if (authentication.loggedIn()) {
        wixLocation.to(`/mineral-quiz/${mineral.title}`)
    } else {
        authentication.promptLogin();
    }
}

export function favlocalityrepeater_itemReady($item, itemData, index) {
    $item("#container5").onClick(() => {
        wixLocation.to(itemData['link-locality-database-title']);
    });
}

export function varietyRepeater_itemReady($item, itemData) {
    if (!itemData.image) {
        $item('#varietyImage').collapse();
    }
    if (!itemData.description) {
        $item('#varietyDescription').collapse();
    }
}