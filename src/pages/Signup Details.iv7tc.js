// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

$w.onReady(function () {
	// Write your JavaScript here

	// To select an element by ID use: $w('#elementID')

	// Click 'Preview' to run your code
});

export function nextButton_click(event) {
	let currentState = $w('#statebox').currentState;
	switch (currentState) {
		case 'Thanks':
			$w('#statebox').changeState('Interests');
		break;
		
		case 'Interests':
			saveInterests();
		break;

		case 'Name':
			updateName();
		break;

	}
}

function saveInterests() {
	return void;
}

function updateName() {
	return void;
}