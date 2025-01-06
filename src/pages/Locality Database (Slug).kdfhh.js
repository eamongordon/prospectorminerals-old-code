//-------------Imports-------------//

// Import the wix-data module for working with queries.
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { updateViewCount } from 'backend/viewcounts.jsw';

//-------------Global Variables-------------//

// Current product.
let locality;
// Current user.
let user = wixUsers.currentUser;

//-------------Page Setup-------------//

$w.onReady(async function () {
    // Get the currently displayed product.
    await $w("#dynamicDataset").onReady(async () => {
        locality = $w('#dynamicDataset').getCurrentItem();
        let breadcrumbItems = [];
        let country = locality.title.split(',').map(item => item.trim()).pop();
        breadcrumbItems.push({ 'label': 'Localities', 'link': locality['link-locality-database-1-title'] }, { 'label': country, 'link': `/locality-database?locality=${country}`, 'isCurrent': true });
        $w('#breadcrumbs').items = breadcrumbItems;
        $w('#googleMaps1').location = {
            "latitude": locality.latitude,
            "longitude": locality.longitude,
            "description": locality.title
        }
        setTags();
        setPhotos();
        if (locality.countViews === true) {
            if (wixWindow.rendering.env === "browser") {
                return updateViewCount(locality, "LocalityDatabase", locality.views);
            }
        }
        if (wixUsers.currentUser.loggedIn) {
            checkFavoriteminerals();
        } else {
            $w('#notInfavminerals').show();
        }
    });
    $w('#facebookIcon').link = `https://www.facebook.com/sharer/sharer.php?u=${wixLocation.url}`
    $w('#twitterIcon').link = `https://www.twitter.com/share?url=${wixLocation.url}`
});

export function infavminerals_click(event, $w) {
    if (user.loggedIn) {
        removeFromfavminerals();
    }
}

export function notInfavminerals_click(event, $w) {
    if (user.loggedIn) {
        addTofavminerals();

    } else {
        wixUsers.promptLogin({ "mode": "login" });
    }
}

//-------------Wishlist Functionality-------------//

async function addTofavminerals() {
    $w('#notInfavminerals').hide('fade', { duration: 100 });
    $w('#infavminerals').show('fade', { duration: 100 });
    await wixData.insertReference("FavoriteItems", "locality", user.id, locality)
        .then(() => {
            console.log("Reference inserted");
        })
        .catch((error) => {
            console.log(error);
        });
}

async function checkFavoriteminerals() {
    if (wixUsers.currentUser.loggedIn) {
        wixData.isReferenced("FavoriteItems", "locality", user.id, locality)
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
    } else {
        $w('#notInfavminerals').show('fade', { duration: 100 });
        $w('#infavminerals').hide('fade', { duration: 100 })
    }
}

async function removeFromfavminerals() {
    $w('#infavminerals').hide();
    $w('#notInfavminerals').show();
    await wixData.removeReference("FavoriteItems", "locality", user.id, locality)
        .then(() => {
            console.log("Reference removed");
        })
        .catch((error) => {
            console.log(error);
        });
}

async function setTags() {
    let options = [];
    options.push(...locality.mineralsArray.map(continent => {
        return { "value": continent.name, "label": continent.name };
    }));
    options.sort((a, b) => {
        let fa = a.value.toLowerCase(),
            fb = b.value.toLowerCase();

        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });
    $w('#mineralselectiontags').options = options;
    /*
	wixData.queryReferenced("LocalityDatabase", locality, "significantMinerals", {"order" : "asc"})
	  .then(res => {
	  	let options = [];
	  	options.push(...res.items.map(continent => {
            let valuestring = continent['link-database-title'];
            let valueurl = valuestring.toString();
	  		return {"value": valueurl, "label": continent.title};
	  	}));
	  	$w('#mineralselectiontags').options = options;
	  });
    */
}

async function selectedTagsLink() {
    const selectedTags = $w('#mineralselectiontags').value[0];
    wixLocation.to(`/mineral-database/${selectedTags}`);
    $w('#mineralselectiontags').disable();
    $w('#mineralselectiontags').value = [];
    /*
    const selectedTags = $w('#mineralselectiontags').value[0];
	wixLocation.to(selectedTags);
    */
}

export function mineralselectiontags_change(event) {
    selectedTagsLink();
}

async function setPhotos() {
    $w("#dynamicDataset").onReady(async function () {
        let options = [{ 'type': "image", 'src': locality.image, 'title': locality.title, 'description': locality.imageCaption }];
        //$w('#gallery1').items = options;
        let results = await $w("#photosDataset").getItems(0, 10);
        options.push(...results.items.map(ite => {
            return { 'type': "image", 'src': ite.image, 'title': ite.specimenName, 'description': ite.locality, 'link': ite['link-photos-title'] };
        }));
        const uniqueIds = [];
        const uniqueoptions = options.filter(element => {
            const isDuplicate = uniqueIds.includes(element.src);
            if (!isDuplicate) {
                uniqueIds.push(element.src);
                return true;
            }
            return false;
        });
        console.log(uniqueoptions);
        console.log(uniqueIds);
        $w('#gallery1').items = uniqueoptions;
        $w('#gallery1').show();
    });
}