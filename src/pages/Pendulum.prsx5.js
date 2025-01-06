import wixLocation from 'wix-location';
import wixWindow from 'wix-window';

$w.onReady(function () {
/*
  wixWindow.openLightbox("Help Lightbox", {
    "topicId": "ea0457a4-5fb8-40b1-9dc4-f986be1e0d4a",
  });
  */
});

export function go_click(event) {
	if ($w('#password').value === 'ILovePhysics'){
		wixLocation.to('https://docs.google.com/document/d/17Qju6J3WcqZOLhV_uRO0wydT1mZoyLV4ab8ti0JtBCg/edit?usp=sharing');
	} else {
		$w('#go').label = 'Try Again';
	}
}

export function documentation_click(event) {
	$w('#password, #go').expand();
	$w('#password').scrollTo();
}

/*************
 * Page Code *
 *************/

export function openButton_click(event) {
  wixWindow.openLightbox("Help Lightbox", {
    "topicId": "ea0457a4-5fb8-40b1-9dc4-f986be1e0d4a",
  });
}

