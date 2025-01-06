//-------------Imports-------------//

import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { updateViewCount } from 'backend/viewcounts.jsw'

//-------------Global Variables-------------//

// Current product.
let photo;
// Current user.
let user = wixUsers.currentUser;
let buttonclickCount;
//-------------Page Setup-------------//

$w.onReady(async function () {
    // Get the currently displayed product.
    await $w("#dynamicDataset").onReady(async () => {
        photo = await $w('#dynamicDataset').getCurrentItem();
        if (wixUsers.currentUser.loggedIn) {
            checkFavoritephotos();
        } else {
            $w('#notInfavphotos').show();
        }
        if (photo.countViews === true) {
            if (wixWindow.rendering.env === "browser") {
                return updateViewCount(photo, "Photos", photo.views);
            }
        }
		setTags();
    });
    // Check if the current product is in the wishlist and act accordingly. Code above inwork
    $w('#facebookIcon').link = `https://www.facebook.com/sharer/sharer.php?u=${wixLocation.url}`
    $w('#twitterIcon').link = `https://www.twitter.com/share?url=${wixLocation.url}`
    // Set the action that occurs when the login message is clicked to be the loginMessageClick() function.	
});

export function infavphotos_click(event, $w) {
    if (user.loggedIn) {
        removeFromfavphotos();
    }
}

export function notInfavphotos_click(event, $w) {
    if (user.loggedIn) {
        addTofavphotos();

    } else {
        wixUsers.promptLogin({ "mode": "login" });
    }
}

//-------------Wishlist Functionality-------------//

async function addTofavphotos() {
    $w('#notInfavphotos').hide('fade', { duration: 100 });
    $w('#infavphotos').show('fade', { duration: 100 });
    await wixData.insertReference("FavoriteItems", "photo", user.id, photo)
        .then(() => {
            console.log("Reference inserted");
        })
        .catch((error) => {
            console.log(error);
        });
}

async function checkFavoritephotos() {
    if (wixUsers.currentUser.loggedIn) {
        wixData.isReferenced("FavoriteItems", "photo", user.id, photo)
            .then((result) => {
                let isReferenced = result; // true
                if (isReferenced) {
                    $w('#infavphotos').show('fade', { duration: 100 });
                    $w('#notInfavphotos').hide('fade', { duration: 100 });
                } else {
                    $w('#notInfavphotos').show('fade', { duration: 100 });
                    $w('#infavphotos').hide('fade', { duration: 100 });
                }
            })
            .catch((err) => {
                let errorMsg = err;
            });
    } else {
        $w('#notInfavphotos').show('fade', { duration: 100 });
        $w('#infavphotos').hide('fade', { duration: 100 })
    }
}

async function removeFromfavphotos() {
    $w('#infavphotos').hide();
    $w('#notInfavphotos').show();
    await wixData.removeReference("FavoriteItems", "photo", user.id, photo)
        .then(() => {
            console.log("Reference removed");
        })
        .catch((error) => {
            console.log(error);
        });
}

async function setTags() {
    let options = [];
    options.push(...$w('#dynamicDataset').getCurrentItem().mineralsInPhotoArray.map(continent => {
        return { "value": continent, "label": continent };
    }));
    $w('#mineralselectiontags').options = options;
    /*
	wixData.queryReferenced("Photos", photo, "mineralsInPhoto")
	  .then(res => {
	  	let options = [];
	  	options.push(...res.items.map(continent => {
	  		return {"value": continent.title, "label": continent.title};
	  	}));
	  	$w('#mineralselectiontags').options = options;
	  });
    */
}

async function selectedTagsLink() {
    const selectedTag = $w('#mineralselectiontags').value[0];
    wixLocation.to(`/mineral-database/${selectedTag}`);
    $w('#mineralselectiontags').disable();
    $w('#mineralselectiontags').value = [];
    /*
	setTimeout(function() {
	wixData.query("Database")
	  .eq('title', $w('#photoselectiontags').value)
	  .find()
  	  .then( (results) => {
    	let photoResult = results.items[0];
		let targetLink = photoResult['link-database-title'];
		console.log(targetLink)
		//wixLocation.to(photoResult['link-database-title'])
      } 
	);
	},50);
	*/
    wixLocation.to(`/mineral-database/${selectedTags}`);
}

export function mineralselectiontags_change(event) {
    selectedTagsLink();
}

export function zoominbutton_click(event) {
    if ($w("#image").clickAction === "magnified") {
        $w("#image").clickAction = "expand";
        $w('#text55').text = 'Magnification Disabled';
        $w('#text56').text = 'Click on the button again to reenable.';
        $w('#zoominbutton').label = "Magnify";
        $w('#magnifyingnotice').show('fade', { duration: 500 });
        setTimeout(() => {
            $w('#magnifyingnotice').hide('fade', { duration: 2000 });
        }, 2000);
    } else {
        $w("#image").clickAction = "magnified";
        $w('#text55').text = 'Magnification Enabled';
        $w('#text56').text = 'Click Anywhere on the Image to Magnify.';
        $w('#zoominbutton').label = "Stop";
        $w('#magnifyingnotice').show('fade', { duration: 500 });
        setTimeout(() => {
            $w('#magnifyingnotice').hide('fade', { duration: 2000 });
        }, 2000);
    }
}

export function expandbutton_click(event) {
    $w("#image").clickAction = "expand";
    if (buttonclickCount === 0) {
        $w("#image").fitMode = "fixedWidth";
        buttonclickCount = 1;
        $w("#expandbutton").label = "Collapse";
    } else {
        $w("#image").fitMode = "fill";
        $w("#expandbutton").label = "Expand";
        buttonclickCount = 0;
    }
}

export function placeholderimage_click(event) {
    let imagesrc = $w('#image').src;
    $w('#placeholderimage').src = imagesrc;
    console.log($w('#placeholderimage').src)
}

export function magnifyingnotice_mouseOut(event) {
    $w('#magnifyingnotice').hide();
}

export function addtoCollection_click(event) {
    if (user.loggedIn) {
        wixWindow.openLightbox("AddtoCollections", {
            "photoId": photo,
            "photoImage": photo.image,
        });
    } else {
        wixUsers.promptLogin({ "mode": "login" });
    }
}

export function magnifyingnotice_click(event) {
    $w('#magnifyingnotice').hide();
}