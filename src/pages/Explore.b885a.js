import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';

let debounceTimer;
let searchquery = wixLocation.query.q;
let prevSelectedValue = null;
let currIndex = -1;
let listSize;
const maxListSize = 5;
const HL_COLOR = 'rgb(90,90,90)';
const REG_COLOR = 'rgb(153,151,151)';
let page;

$w.onReady(function () {
	//page = wixWindow.lightbox.getContext().page;
    page = 'explore';
});


function filter(input) {
	//let newFilter = wixData.filter();
	let searchFilter = wixData.filter();
	let inputarray = input.split(" ");
	inputarray.forEach((element) => {
	searchFilter = searchFilter.contains('title', element);
	$w('#termsDataset').setFilter(searchFilter)
	.then( () => {
		let count = $w('#termsDataset').getTotalCount();
		if (count === 0) {
			$w('#termrepeater').hide();
		} else {   
			$w('#termrepeater').show();
		}
	});
	});
}

export function iTitle_input(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }
  debounceTimer = setTimeout(() => {
    filter($w('#iTitle').value);  
    $w('#termrepeater').show();
  }, 500);
}

export function iTitle_keyPress(event) {
    listSize = $w('#termrepeater').data.length;
		switch (event.key) {
            case 'Enter':
            if (currIndex === -1) {
                if (page === 'search') {
                    wixLocation.to(`https://www.prospectorminerals.com/search?q=${$w('#iTitle').value}`);
                } else {
                    wixLocation.to(`/search?q=${$w('#iTitle').value}`);
                }
            } else { 
                if (page === 'search') {
                    wixLocation.to(`https://www.prospectorminerals.com/search?q=${$w('#termrepeater').data[currIndex].title}`);
                } else {  
                    wixLocation.to(`/search?q=${$w('#termrepeater').data[currIndex].title}`);
                }
            }
                break;
            case 'ArrowUp':
                if (currIndex > 0) {
                    currIndex = currIndex - 1;
                    refreshItemsColors();
                } else {
                    currIndex = currIndex - 1;
                    $w('#iTitle').focus();
                    $w('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
                }
                break;
            case 'ArrowDown':
                if (currIndex < listSize - 1) {
                    currIndex = currIndex + 1;
                    refreshItemsColors();
                }
                console.log(currIndex);
                break;
            case 'Escape':
                $w('#iTitle').value = '';
                currIndex = -1;
                $w('#termrepeater').collapse();
                break;
	}
	/*
	if (debounceTimer) {
    	clearTimeout(debounceTimer);
    	debounceTimer = undefined;
    }
	debounceTimer = setTimeout(() => {
		*/
	//}, 500);
}

export function vectorImage3_click(event) {
        if (page === 'search') {
            wixLocation.to(`https://www.prospectorminerals.com/search?q=${$w('#iTitle').value}`);
        } else {
		    wixLocation.to(`/search?q=${$w('#iTitle').value}`);
        }
}

export function termrepeater_itemReady($item, itemData, index) {
	$item('#container').onClick( (event, $w) => {
    	if (page === 'search') {
            wixLocation.to(`https://www.prospectorminerals.com/search?q=${itemData.title}`);
        } else {
		    wixLocation.to(`/search?q=${itemData.title}`);
        }
	} );
    $item('#container').onMouseIn( (event, $w) => {
		$item('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_0f1b39f0614e4502aadb8bfdb46a9614~mv2.png';
	} );
    $item('#container').onMouseOut( (event, $w) => {
		$item('#container').background.src = null;
	} );   
}

function refreshItemsColors() {
    $w('#termrepeater').forEachItem(($item, itemData, index) => {
        if (index === currIndex) {
            $item('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_0f1b39f0614e4502aadb8bfdb46a9614~mv2.png';
        } else {
            $item('#container').background.src = null;
        }
    });
}