// Saves options to chrome.storage
function save_options() {
	let clientWebCrawling = document.getElementById('client-webcrawl').checked;
	chrome.storage.local.set({
		clientWebCrawling,
	}, function() {
		// Update status to let user know options were saved.
		console.log(clientWebCrawling);
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.local.get([
		'clientWebCrawling',
	], function(items) {
		document.getElementById('client-webcrawl').checked = items.clientWebCrawling || false;
		console.log(items);
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);