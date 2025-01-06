import wixData from 'wix-data';
//import wixUsers from 'wix-users';

let lastFilterTitle;
let debounceTimer;
let gallery;

$w.onReady(async function () {
    await $w("#dynamicDataset").onReady(async () => {
        gallery = await $w('#dynamicDataset').getCurrentItem()._id;
        $w('#photosDataset').onReady(async () => {
            displayCount();
            while ($w('#photosDataset').getCurrentPageIndex() < $w('#photosDataset').getTotalPageCount()) {
                await $w('#photosDataset').loadMore();
                /*
                if (gallery.coverImage){
                  console.log('gallery -' + gallery.coverImage.toString());
                  $w('#backgroundStrip').background.src = 'https://static.wixstatic.com/media/2dcc6c_14cd707951374a7394cb7d19e45e5e59~mv2.jpeg';
                } else {
                  console.log('gallery -' + gallery.coverImage.toString());
                }
                */
            }
        });
        /*
        if(!wixUsers.currentUser.loggedIn){
          $w('#edit').collapse();
        }
        */
    });
});

function displayCount() {
    let datasetCount = $w('#photosDataset').getTotalCount();
    if (datasetCount === 1) {
        $w('#description').text = `${datasetCount.toString()} Image`;
    } else {
        $w('#description').text = `${datasetCount.toString()} Images`;
    }
    if (datasetCount < 1) {
        $w('#favphotorepeater, #gallery1').hide();
        $w('#noCollectionsBox').show();
    }
}

export function iTitle_keyPress(event, $w) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        filter($w('#iTitle').value);
    }, 500);
}

function filter(title) {
    if (lastFilterTitle !== title) {
        let newFilter = wixData.filter();
        newFilter = newFilter.hasSome('PhotoCollections', gallery)
        newFilter = newFilter.contains('title', title)
            .or(newFilter.contains("description", title))
            .or(newFilter = newFilter.contains('locality', title));
        $w('#photosDataset').setFilter(newFilter);
        lastFilterTitle = title;
    }
}

export function edit_click(event) {
    $w('#gallery1, #edit, #title, #description').hide();
    $w('#favphotorepeater, #input1, #save, #delete, #discard').show();
}

export function save_click(event) {
    $w('#gallery1, #edit, #title, #description').show();
    $w('#favphotorepeater, #input1, #save, #delete, #discard').hide();
    displayCount();
}

export function favphotorepeater_itemReady($item, itemData, index) {
    $item('#removeImage').onClick(() => {
        wixData.removeReference("PhotoCollections", "photos", gallery, itemData._id)
            .then(() => {
                $w('#photosDataset').refresh();
            })
    });
}

export function discard_click(event) {
    $w('#gallery1, #edit, #title, #description').show();
    $w('#favphotorepeater, #input1, #save, #delete, #discard').hide();
    displayCount();
}