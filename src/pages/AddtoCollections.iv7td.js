import wixData from 'wix-data';
import wixWindow from 'wix-window';

let collectionArray = [];
let photoId;
let collectionImage;
let collectionIndexArray = [];

$w.onReady(function () {
	let received = wixWindow.lightbox.getContext();
	photoId = received.photoId;
	collectionImage = received.photoImage;
	$w('#collectionsDataset').onReady( () => {
	let count = $w('#collectionsDataset').getTotalCount();
	console.log(count);
	if (count > 0) {
		$w('#collectionRepeater, #submit').show();
	} else {
		$w('#noCollectionsTxt').show();
	}
	});
});

export function submit_click(event) {
	createCollectionArr();
	collectionArray.forEach((element) => {
		console.log(element);
		wixData.insertReference("PhotoCollections", "photos", element, photoId)
  		.catch( (error) => {
    		console.log(error);
  		} );
	});
	changeCoverImages();
    wixWindow.lightbox.close();
}

function changeCoverImages() {
	collectionIndexArray.forEach((element) => {
		$w('#collectionsDataset').getItems(element, 1)
		.then( (results) => {
			results.items[0].coverImage = collectionImage;
			wixData.save("PhotoCollections", results.items[0])
			.catch( (err) => {
				console.log(err);
			});
			//objArray.push(results.items[0]);
		});
		//console.log('collectionImage' + collectionImage);
		//$w("#collectionsDataset").setFieldValue("coverImage", collectionImage);
		//$w("#collectionsDataset").save().then( () => {
		//$w("#collectionsDataset").setCurrentItemIndex($w("#collectionsDataset").getCurrentItemIndex() + 1)
		//});
		//.then( (item) => {

		//})
	});
	//wixData.bulkSave("PhotoCollections", objArray)
}


function createCollectionArr(){
	$w("#collectionRepeater").forEachItem( ($item, itemData, index) => {
  		if ($item('#checkboxGroup').value.length > 0){
			console.log(collectionArray);
			collectionArray.push(itemData._id);
			collectionIndexArray.push(index);
  		}
	} );
}

export function selectorBox_click(event) {
	let $item = $w.at(event.context);
    //$item("#container5").background.src = "";
	if ($item("#checkboxGroup").selectedIndices.length > 0){
		console.log('selected');
		$item("#checkboxGroup").selectedIndices = [];
	} else {
		console.log($item("#checkboxGroup").selectedIndices);
		$item("#checkboxGroup").selectedIndices = [0];
	}
}