import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { updateViewCount } from 'backend/viewcounts.jsw';

let prevcount;
let item;

$w.onReady(async function () {
    await $w("#dynamicDataset").onReady(async () => {
        item = await $w('#dynamicDataset').getCurrentItem();
        let breadcrumbItems = [];
        breadcrumbItems.push({ 'label': 'Glossary', 'link': '/glossary' }, { 'label': item.title, 'link': item['link-glossary-1-title'], 'isCurrent': true });
        $w('#breadcrumbs').items = breadcrumbItems;
        if (item.countViews === true) {
            if (wixWindow.rendering.env === "browser") {
                return updateViewCount(item, "Glossary", item.views);
            }
        }
    });
    $w('#facebookIcon').link = `https://www.facebook.com/sharer/sharer.php?u=${wixLocation.url}`
    $w('#twitterIcon').link = `https://www.twitter.com/share?url=${wixLocation.url}`
});