// For full API documentation, including code examples, visit http://wix.to/94BuAAs

//-------------Imports-------------//

import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { currentMember } from 'wix-members';
import { formFactor } from 'wix-window';

//-------------Page Setup-------------//

let prevSelectedValue;
let user = wixUsers.currentUser;
let debounceTimer;
let mineralResult;
let photoResult;
let articleResult;
let localityResult;

$w.onReady(async function () {
    loadfavmineralrepeater().then(() => { $w('#mineralsLoadingGif').collapse() });
    loadfavphotorepeater().then(() => { $w('#photosLoadingGif').collapse() });
    loadfavarticlerepeater().then(() => { $w('#articleLoadingGif').collapse() });
    loadfavlocalityrepeater().then(() => { $w('#localitiesLoadingGif').collapse() });
    readParams();
    if (formFactor !== 'Mobile') {
        loadMemberCard();
    }
});

async function readParams() {
    let query = wixLocation.query;
    if (query.section) {
        prevSelectedValue = wixLocation.query.section;
        $w('#menuselectiontags').value = [prevSelectedValue];
        updateSection(query.section);
    } else {
        prevSelectedValue = "All";
        $w('#menuselectiontags').value = [prevSelectedValue];
    }
}

async function loadfavmineralrepeater() {
    await wixData.queryReferenced("FavoriteItems", user.id, "mineral", { "order": "desc" })
        .then((results) => {
            if (results.items.length > 0) {
                $w("#favmineralrepeater").expand();
                $w('#favmineralrepeater').data = results.items;
                $w("#favmineralrepeater").onItemReady(($item, itemData, index) => {
                    $item("#mineralImage").src = itemData.coverImage;
                    $item("#mineralImage").link = itemData['link-database-title'];
                    $item("#mineralName").label = itemData.title;
                    $item("#mineralName").link = itemData['link-database-title'];
                    let mid = itemData._id;
                    $item('#removeItem').onClick(removeItem(mid));
                    console.log(itemData.title)
                });
            } else {
                $w('#favmineralrepeater').collapse();
                $w('#text40').text = "No Favorite Minerals Yet";
            }
            mineralResult = results.items;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

async function loadfavphotorepeater() {
    await wixData.queryReferenced("FavoriteItems", user.id, "photo", { "order": "desc" })
        .then((results) => {
            if (results.items.length > 0) {
                $w("#favphotorepeater").expand();
                $w('#favphotorepeater').data = results.items;
                $w("#favphotorepeater").onItemReady(($item, itemData, index) => {
                    $item("#photoImage").src = itemData.image;
                    $item("#photoImage").link = itemData['link-photos-title'];
                    $item("#photoName").text = itemData.specimenName;
                    $item("#photoLocality").text = itemData.locality;
                    $item('#box3').onClick(() => {
                        wixLocation.to(itemData['link-photos-title']);
                    });
                    let pid = itemData._id;
                    $item('#removePhoto').onClick(removePhoto(pid));
                });
            } else {
                $w('#favphotorepeater').collapse();
                $w('#text43').text = "No Favorite Photos Yet";
            }
            photoResult = results.items;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

async function loadfavarticlerepeater() {
    await wixData.queryReferenced("FavoriteItems", user.id, "article", { "order": "desc" })
        .then((results) => {
            if (results.items.length > 0) {
                $w("#favarticlerepeater").expand();
                $w('#favarticlerepeater').data = results.items;
                $w("#favarticlerepeater").onItemReady(($item, itemData, index) => {
                    $item("#button3").link = itemData.postPageUrl;
                    $item("#text46").text = itemData.title;
                    $item("#container5").background.src = itemData.coverImage;
                    let aid = itemData._id;
                    $item('#removeArticle').onClick(removeArticle(aid));
                });
            } else {
                $w('#favarticlerepeater').collapse();
                $w('#text44').text = "No Favorite Articles Yet";
            }
            articleResult = results.items;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

async function loadfavlocalityrepeater() {
    await wixData.queryReferenced("FavoriteItems", user.id, "locality", { "order": "desc" })
        .then((results) => {
            if (results.items.length > 0) {
                $w("#favlocalityrepeater").onItemReady(($item, itemData, index) => {
                    $item("#title").text = itemData.title;
                    $item("#image").src = itemData.image;
                    $item("#image").link = itemData['link-locality-database-title'];
                    $item('#title').onClick(() => {
                        wixLocation.to(itemData['link-locality-database-title']);
                    });
                    let lid = itemData._id;
                    $item('#removeLocality').onClick(removeLocality(lid));
                });
                $w("#favlocalityrepeater, #viewinMapButton").expand();
                $w('#favlocalityrepeater').data = results.items;
            } else {
                $w('#favlocalityrepeater, #viewinMapButton').collapse();
                $w('#text47').text = "No Favorite Localities Yet";
            }
            localityResult = results.items;
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

function removeItem(mid) {
    return async function () {
        await wixData.removeReference("FavoriteItems", "mineral", user.id, mid)
            .then(() => {
                console.log("Reference removed");
            })
        loadfavmineralrepeater();
    }
}

function removePhoto(pid) {
    return async function () {
        await wixData.removeReference("FavoriteItems", "photo", user.id, pid)
            .then(() => {
                console.log("Reference removed");
            })
        loadfavphotorepeater();
    }
}

function removeArticle(aid) {
    return async function () {
        await wixData.removeReference("FavoriteItems", "article", user.id, aid)
            .then(() => {
                console.log("Reference removed");
            })
        loadfavarticlerepeater();
    }
}

function removeLocality(lid) {
    return async function () {
        await wixData.removeReference("FavoriteItems", "locality", user.id, lid)
            .then(() => {
                console.log("Reference removed");
            })
        loadfavlocalityrepeater();
    }
}

export function logoutButton_click(event) {
    wixLocation.to(`/home`);
    wixUsers.logout();
}

export function menuselectiontags_change(event) {
    // Prevent deselecting the only selected tag. Radio buttons do not allow it so tags shouldn't either.
    if (!event.target.value || event.target.value.length === 0) {
        // Re-apply the previously selected tag.
        event.target.value = [prevSelectedValue];
        // Replace the previously selected tag with the newly selected one.
    } else {
        // Note: Array.filter() was added in ES7. Only works in some browsers.
        event.target.value = event.target.value.filter(x => x !== prevSelectedValue);
        prevSelectedValue = event.target.value[0];
    }
    updateSection(event.target.value[0]);
}

async function updateSection(section) {
    switch (section) {
    case "All":
        $w('#mgroup, #lgroup, #pgroup, #agroup').expand();
        break;
    case "Minerals":
        $w('#lgroup, #pgroup, #agroup').collapse();
        $w('#mgroup').expand();
        break;
    case "Photos":
        $w('#lgroup, #mgroup, #agroup').collapse();
        $w('#pgroup').expand();
        break;
    case "Articles":
        $w('#lgroup, #pgroup, #mgroup').collapse();
        $w('#agroup').expand();
        break;
    case "Localities":
        $w('#pgroup, #mgroup, #agroup').collapse();
        $w('#lgroup').expand();
        break;
    }
}

export function iTitle_keyPress(event) {
    const mineralData = $w('#favmineralrepeater').data;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        filter($w('#iTitle').value);
    }, 500);

}

async function filter(input) {
    if (input) {
        const filteredmineralData = mineralResult.filter((str) => str.title.toLowerCase().includes(input.toLowerCase()));
        const filteredphotoData = photoResult.filter((str) => str.locality.toLowerCase().includes(input.toLowerCase()) || str.title.toLowerCase().includes(input.toLowerCase()));
        const filteredarticleData = articleResult.filter((str) => str.title.toLowerCase().includes(input.toLowerCase()));
        const filteredlocalityData = localityResult.filter((str) => str.title.toLowerCase().includes(input.toLowerCase()));
        $w('#favmineralrepeater').data = filteredmineralData;
        if (filteredmineralData.length === 0) {
            $w('#mgroup').collapse();
        } else {
            $w('#mgroup').expand();
        }
        $w('#favphotorepeater').data = filteredphotoData;
        if (filteredphotoData.length === 0) {
            $w('#pgroup').collapse();
        } else {
            $w('#pgroup').expand();
        }
        $w('#favarticlerepeater').data = filteredarticleData;
        if (filteredarticleData.length === 0) {
            $w('#agroup').collapse();
        } else {
            $w('#agroup').expand();
        }
        $w('#favlocalityrepeater').data = filteredlocalityData;
        if (filteredlocalityData.length === 0) {
            $w('#lgroup').collapse();
        } else {
            $w('#lgroup').expand();
        }
    } else {
        $w('#favmineralrepeater').data = mineralResult;
        $w('#favphotorepeater').data = photoResult;
        $w('#favarticlerepeater').data = articleResult;
        $w('#favlocalityrepeater').data = localityResult;
        $w('#mgroup, #lgroup, #pgroup, #agroup').expand();
    }
}

export function closeButton_click(event) {
    $w('#closeButton, #iTitle').hide();
    $w('#menuselectiontags').show();
    prevSelectedValue = "All";
    $w('#menuselectiontags').value = [prevSelectedValue];
    $w('#iTitle').value = null;
    filter(null);
}

export function vectorImage3_click(event) {
    $w('#menuselectiontags').hide();
    $w('#closeButton, #iTitle').show();
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