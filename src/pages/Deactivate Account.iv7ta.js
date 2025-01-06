import {scheduledeletion} from '@prospectorminerals/memberfunctions-backend';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(function () {
	let received = wixWindow.lightbox.getContext();
	if (received.message === 'reactivate') {
		$w('#statebox8').changeState('Success');
		$w('#continueButton, #button2').hide();
		$w('#reactivateButton').show();
	};
});



export function continueButton_click(event) {
	scheduledeletion().then((message) => {
	console.log(message);
	if (message === 'success') {
	$w('#statebox8').changeState('Success');
	$w('#continueButton, #button2').hide();
	$w('#btohomelogout').show();
	} else {
		console.log(message)
	}
	});
}

export function reactivateButton_click(event) {
	wixData.remove("DeactivationAccounts", wixUsers.currentUser.id)
	.then(() => {
		$w('#statebox8').changeState('ReactivationSuccess');
		$w('#continueButton, #button2, #reactivateButton').hide();
		$w('#homebutton').show();
	})
	.catch( (err) => {
		$w('#statebox8').changeState('Error');
	});
}

export function text46_click(event) {
	reactivateButton_click()
}

export function btohomelogout_click(event) {
	wixLocation.to('/')
	wixUsers.logout();
}