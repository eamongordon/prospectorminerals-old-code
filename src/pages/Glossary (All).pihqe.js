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
  //loadContinents();
  if (query) {
    readParams();
  }     
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
  let opts = $w("#iCategory").options;
  opts.push({"label": "All Categories", "value": ""});
  $w("#iCategory").options = opts
  /*
  wixData.query('Glossary')
	  .find()
	  .then(res => {
	  	let options = [{"value": '', "label": 'All Categories'}];
	  	options.push(...res.items.map(category => {
	  		return {"value": category.category, "label": category.category};
	  	}));
	  	$w('#iCategory').options = options;
	  });
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
    $w('#dynamicDataset').setFilter(newFilter)
    .then( () => {
      noResultsCheck();	
    });
    lastFilterTitle = title; 
    lastFilterContinent = category;
  }
}

function readParams() {
  if (query.page){
    $w("#pagination2").currentPage = query.page;
    $w("#dynamicDataset").onReady( () => {
      $w("#dynamicDataset").loadPage(Number(query.page));
    });
  }
  filter(term, lastFilterContinent)
  filter(lastFilterTitle, category);
  $w('#iTitle').value = term;
  $w('#iCategory').value = category;
  $w('#sortDropdown').value = sort;
}

export function sortDropdown_change(event) {
	sortDataset();
}

export function listRepeater_itemReady($item, itemData, index) {
	$item("#container1").onClick( (event) => {
    let targetUrl = itemData['link-glossary-1-title'];
    wixLocation.to(targetUrl);
  } );
}

async function noResultsCheck(){
  let count = await $w('#dynamicDataset').getTotalCount();
  if (count > 0){
    $w('#noresultsTxt').hide();
  } else {
    $w('#noresultsTxt').show();
  }
}

export function noresultsTxt_click(event) {
  $w('#noresultsTxt').hide();
	filter(null, null);
}

$w("#pagination2").onChange( (event) => {
  wixLocation.queryParams.add({
    "page": $w('#pagination2').currentPage.toString()
  })
});
