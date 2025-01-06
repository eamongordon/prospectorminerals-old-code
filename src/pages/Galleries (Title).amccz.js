import wixData from 'wix-data';

let lastFilterTitle;
let debounceTimer;
let gallery;

$w.onReady(function () {
    $w("#dynamicDataset").onReady(async () => {
        gallery = $w('#dynamicDataset').getCurrentItem()._id;
        $w('#photosDataset').onReady(async () => {
            let datasetCount = $w('#photosDataset').getTotalCount();
            if (datasetCount === 1) {
                $w('#description').text = `${datasetCount.toString()} Image`;
            } else {
                $w('#description').text = `${datasetCount.toString()} Images`;
            }
            while ($w('#photosDataset').getCurrentPageIndex() < $w('#photosDataset').getTotalPageCount()) {
                await $w('#photosDataset').loadMore();
            }
        });
    });
});

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
        newFilter = newFilter.hasSome('galleries', gallery)
        newFilter = newFilter.contains('title', title)
            .or(newFilter.contains("description", title))
            .or(newFilter = newFilter.contains('locality', title));
        $w('#photosDataset').setFilter(newFilter);
        lastFilterTitle = title;
    }
}