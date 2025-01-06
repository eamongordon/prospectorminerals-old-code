import wixData from "wix-data";
import wixLocation from 'wix-location';

let lastFilterTitle;
let lastFilterContinent;
let debounceTimer;

$w.onReady(function () {
  readParams();    
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
  filter(lastFilterTitle, $w('#ilocality').value);
}

function filter(title, locality) {
  if (lastFilterTitle !== title || lastFilterContinent !== locality) {
    let newFilter = wixData.filter();
    if (title)
      newFilter = newFilter.contains('title', title);
    if (locality)
      newFilter = newFilter.contains('locality', locality);
    $w('#dynamicDataset').setFilter(newFilter);   
    lastFilterTitle = title; 
    lastFilterContinent = locality;
  }
}

export function searchphotoButton_click(event) {
	filter($w('#iTitle').value, $w('#ilocality').value);
}

function readParams() {
  let query = wixLocation.query
  let mineral = query.mineral
  let locality = query.locality
  let pageNumberString = query.page
  let pageNumberNum = Number(pageNumberString)
  filter(mineral, lastFilterTitle);
  filter(lastFilterTitle, locality); 
  $w('#iTitle').value = mineral
  $w('#ilocality').value = locality
  $w("#pagination2").currentPage = pageNumberNum;
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

export function repeater1_itemReady($item, itemData, index) {
	  $item("#box1").onClick( (event, $w) => {
    let targetUrl = itemData['link-photos-title'];
    wixLocation.to(targetUrl)
  } );
}