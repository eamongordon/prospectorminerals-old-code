import wixData from "wix-data";
import wixLocation from 'wix-location';

let lastFilterTitle;
let lastFilterContinent;
let debounceTimer;
let category;
let query = wixLocation.query;
if (query.category === 'All Categories') {
    category = ''
} else {
    category = query.category
}
let term = query.term
let sort = query.sort

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

export function iTitle_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter(event.target.value, lastFilterContinent);  
  }, 500);
}

export function iCategory_change(event, $w) {
  if ($w('#iCategory').value === 'All Categories'){
    filter(lastFilterTitle, '');
  } else {
   filter(lastFilterTitle, $w('#iCategory').value);
  }
}

function loadContinents() {
	/*
  let opts = $w("#iCategory").options;
  opts.push({"label": "All Categories", "value": ""});
  $w("#iCategory").options = opts
  */
}

function sortDataset() {
  let sort = wixData.sort();
  let sortValue = $w('#sortDropdown').value;
    switch (sortValue) {
    
    case 'newestFirst':
        // Sort the products by their name: A - Z
        sort = sort.descending('_createdDate');
        break;
    
    case 'lastUpdatedFirst':
        // Sort the products by their name: A - Z
        sort = sort.descending('_updatedDate');
        break;
      
    case 'a-z':
        // Sort the products by their name: A - Z
        sort = sort.ascending('title');
        break;

    case 'z-a':
        // Sort the products by their name: Z - A
        sort = sort.descending('title');
        break;
    
    case 'mostViewed':
        sort = sort.descending('views')
        break;
      
    }

  $w('#dynamicDataset').setSort(sort);

}

function filter(title, category) {
  if (lastFilterTitle !== title || lastFilterContinent !== category) {
    let newFilter = wixData.filter();
    if (title)
      newFilter = newFilter.contains('title', title);
    if (category)
      newFilter = newFilter.contains('category', category);
    $w('#dynamicDataset').setFilter(newFilter);   
    lastFilterTitle = title; 
    lastFilterContinent = category;
  }
}

function readParams() {
  filter(term, lastFilterContinent)
  filter(lastFilterTitle, category);
  $w('#iTitle').value = term
  //$w('#iCategory').value = category
  $w('#sortDropdown').value = sort
}

export function sortDropdown_change(event) {
	sortDataset();
}
