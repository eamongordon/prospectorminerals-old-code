import { copyToClipboard } from 'wix-window';
import { lightbox } from 'wix-window';

$w.onReady(function () {
	const received = lightbox.getContext();
	$w('#errTxt').text = received.message;
});

export function copyError_click(event) {
	copyToClipboard($w('#errTxt').text).then(() => {
		$w('#copyError').label = 'Copy Again';
	})
}