import wixWindow from 'wix-window';
import wixData from 'wix-data';

$w.onReady(function () {
	let received = wixWindow.lightbox.getContext();
	let topicId = received.topicId; 
	$w('#helpDataset').onReady( () => {
		$w("#helpDataset").setFilter(wixData.filter()
  			.eq("_id", topicId)
		).then( () => {
			$w('#loadingGif').hide();
			$w('#title, #richContent').show();
		}).catch( (err) => {
    		console.error('Failure to Fetch Article - ' + err);
    	} );
	});
});
