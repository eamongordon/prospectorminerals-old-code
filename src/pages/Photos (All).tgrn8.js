import wixData from "wix-data";
import wixLocation from 'wix-location';

let lastFilterTitle;
let lastFilterContinent;
let debounceTimer;
let query = wixLocation.query
let mineral = query.mineral
let locality = query.locality
let pageNumberString = query.page
let pageNumberNum = Number(pageNumberString)

$w.onReady(function () {
  if (query) {
    readParams();
  }
    $w('#dynamicDataset').onReady(async () => {
    while($w('#dynamicDataset').getCurrentPageIndex() < $w('#dynamicDataset').getTotalPageCount()) {
      await $w('#dynamicDataset').loadMore();
    }
  });   
}); 

export function iTitle_keyPress(event, $w) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter($w('#iTitle').value, lastFilterContinent);  
  }, 500);
}

export function ilocality_keyPress(event, $w) {
    if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter(lastFilterTitle, $w('#ilocality').value);
  }, 500);
}

async function filter(title, locality) {
  if (lastFilterTitle !== title || lastFilterContinent !== locality) {
    let newFilter = wixData.filter();
    let galleryFilter = wixData.filter();
    let adjtitle;
    let adjlocality;
    if (title) {
      newFilter = newFilter.contains('title', title)
      .or(newFilter.contains("description", title));
      adjtitle = title;
    } else {
      adjtitle = locality;
    }
    if (locality) {
      newFilter = newFilter.contains('locality', locality);
      adjlocality = locality;
    } else {
      adjlocality = title;
    }
      galleryFilter = galleryFilter.contains('title', adjtitle)
      .or(galleryFilter.contains("description", adjtitle))
      .or(galleryFilter = galleryFilter.contains('title', adjlocality))
      .or(galleryFilter.contains("description", adjlocality));
    $w('#dynamicDataset').setFilter(newFilter)
    .then( () => {
		let count = $w('#dynamicDataset').getTotalCount();
		if (count === 0) {
			$w('#photoText, #photoButton, #photoGallery').collapse();
		} else {
			$w('#photoText, #photoButton, #photoGallery').expand();
		}
	  });   
    $w('#galleriesDataset').setFilter(galleryFilter)
    	.then( () => {
		let count = $w('#galleriesDataset').getTotalCount();
		if (count === 0) {
			$w('#galleryText, #galleryButton, #galleryRepeater').collapse();
		} else {
			$w('#galleryText, #galleryButton, #galleryRepeater').expand();
		}
	  });
    lastFilterTitle = title; 
    lastFilterContinent = locality;
  }
}

export function searchphotoButton_click(event) {
	filter($w('#iTitle').value, $w('#ilocality').value);
  //$w('#button1').expand();  
}

async function readParams() {
  filter(mineral, locality);
  $w('#iTitle').value = mineral
  $w('#ilocality').value = locality
  //$w("#pagination2").currentPage = pageNumberNum;
}

function paginationParam() {
  let pagcurrentPage = $w("#pagination2").currentPage;
  wixLocation.queryParams.add({
    "page" : pagcurrentPage
  });
}

export function pagination2_click(event) {
  paginationParam();
}

async function loadData() {
    $w('#dynamicDataset').onReady(async () => {
    while($w('#dynamicDataset').getCurrentPageIndex() < $w('#dynamicDataset').getTotalPageCount()) {
      await $w('#dynamicDataset').loadMore();
    }
  });
}