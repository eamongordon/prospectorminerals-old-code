import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import { memory } from 'wix-storage';
import { authentication } from 'wix-members';
import { generateInfo } from 'public/statusbox.js';

let debounceTimer;
let currIndex = -1;
let listSize;

authentication.onLogin(() => {
    generateInfo('Succesfully Logged In!');
});

function filter(input) {
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
    memory.setItem("homeSearchUserInput", $w('#iTitle').value);
	if ($w('#iTitle').value === '') {
		$w('#box, #termrepeater').collapse();
		$w('#vectorImage3').expand();
	}
    filter($w('#iTitle').value);  
  }, 500);
}

export function iTitle_keyPress(event) {
		$w('#vectorImage3').collapse();
		$w('#box, #termrepeater').expand();
        listSize = $w('#termrepeater').data.length;
	    $w('#box').show();
		switch (event.key) {
            case 'Enter':
            if (currIndex === -1) {
                    wixLocation.to(`/search?q=${$w('#iTitle').value}`);
            } else { 
                    wixLocation.to(`/search?q=${$w('#termrepeater').data[currIndex].title}`);
            }
                break;
            case 'ArrowUp':
                if (currIndex > 0) {
                    currIndex = currIndex - 1;
                    refreshItemsColors();
                    $w('#iTitle').value = $w('#termrepeater').data[currIndex].title;
                } else {
                    currIndex = currIndex - 1;
                    $w('#iTitle').value = memory.getItem('homeSearchUserInput');
                    $w('#iTitle').focus();
                    $w('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
                }
                break;
            case 'ArrowDown':
                if (currIndex < listSize - 1) {
                    currIndex = currIndex + 1;
                    refreshItemsColors();
                    $w('#iTitle').value = $w('#termrepeater').data[currIndex].title;
                } else {
                    currIndex = -1;
                    $w('#iTitle').value = memory.getItem('homeSearchUserInput');
                    $w('#iTitle').focus();
                    $w('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
                }
                console.log(currIndex);
                break;
            case 'Escape':
                $w('#iTitle').value = '';
                currIndex = -1;
                $w('#termrepeater').collapse();
                break;
	}
}

export function vectorSearch_click(event) {
	wixLocation.to(`/search?q=${$w('#iTitle').value}`)
}

export function iTitle_click(event) {
	wixWindow.openLightbox("Search (Header)", {"page": wixLocation.path[0]});
}

export function termrepeater_itemReady($item, itemData, index) {
	$item('#container').onClick( (event, $w) => {
		wixLocation.to(`/search?q=${itemData.title}`);
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
            $item('#container').background.src = 'https://static.wixstatic.com/media/2dcc6c_676da724a30e41dfb04c3f7e6af723b9~mv2.png';
        }
    });
}