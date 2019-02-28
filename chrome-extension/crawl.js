var MAX_TIMEOUT = 2000; // Time in miliseconds to crawl for
var startTime;
var usedURLs;
var queuedURLs;
var query;
var output;
var hostname;

function getSortedInsertIndex(array, num) {
	let index = array.length;

	for (let i = 0; i < array.length; i++) {
		if (num > array[i]) {
			index = i;
			break;
		}
	}

	return index;
}

function buildPage(rawHTML) {
	var span = document.createElement('span');
	span.innerHTML = rawHTML;
	return span;
}

function getRawHTML(url) {
	let html;

	$.ajax({
		url: url,
		async: false, // Currently false. Should be true in future versions
		success: (response) => {
			html = response;
		},
		error: (e) => {
			console.log(e);
			console.log("Tried to get url: " + url);
		},
	});

	return html;
}

function getMatchesInPage(page, queryParam) {
	let content = page.textContent || page.innerHTML;
	return content.split(new RegExp(queryParam, "gi")).length - 1;
}

function getLinks(page, startURL) {
	var links = page.getElementsByTagName("a")
	var URLs = [];

	for (var i=0; i<links.length; i++) {
		let url = links[i].getAttribute("href");
		if (url && !url.startsWith("javascript:")) {
			if (!url.startsWith("http")) {
				if (url.charAt(0) == "/") {
					url = hostname + url;
				} else {
					url = startURL + (url.startsWith("./") ? url.substr(2) : url);
				}
			}
			
			url = url.split("#")[0];
			
			if ((!url.includes("/../")) && (!URLs.includes(url))) {
				URLs.push(url);
			}
		}
	}

	return URLs;
}

function getHostname(url) {
    let hostname = url.split('/');

	return hostname[0] + "//" + hostname[2]
}

function doCrawl(urlObj) {
	let url = urlObj.url;
	let depth = urlObj.depth;

	if ((depth == 5) || (performance.now() - startTime > MAX_TIMEOUT) ) {
		console.log("Depth: " + depth);
		console.log("Time: " + performance.now() - startTime);
		endCrawl();
		return;
	}

	// Find how many hits in this site and put it in the output array
	let page = buildPage(getRawHTML(url));
	let hits = getMatchesInPage(page, query);
	output.push({url, hits});

	// Never visit this url again
	usedURLs.push(url);

	// Get all URLs in the page
	let pageLinks = getLinks(page, url);
	for (var i = pageLinks.length; i --> 0;) {
		if (getHostname(pageLinks[i]) === hostname) {
			if (!usedURLs.includes(pageLinks[i])) { // If the URL was not visited for recursion yet
				let newQueueURL = {url: pageLinks[i], depth: depth + 1, hits: hits};
				// let regexp = new RegExp("[#?&%$!@]+.*" + query);
				// if ((pageLinks[i].includes(query)) &&
					// (!regexp.test(pageLinks[i]))) {
				if (pageLinks[i].includes(query)) {
					queuedURLs.unshift(newQueueURL)
				} else {
					if (depth > 2) {
						let index = getSortedInsertIndex(queuedURLs.map(obj => obj.hits), hits);
						queuedURLs.splice(index, 0, newQueueURL);
					} else {
						queuedURLs.push(newQueueURL);
					}
				}
			}
		}
	}

	doCrawl(queuedURLs.shift());
}

function beginCrawl(baseURL, queryParam) {
	// Initiate values and begin recursion crawl
	query = queryParam;
	output = [];
	usedURLs = [];
	queuedURLs = [];
	hostname = getHostname(baseURL);
	startTime = performance.now();
	doCrawl({url: baseURL, depth: 1});
}

function endCrawl() {
	const RESULTS_NUM = 5;

	output = output.filter(obj => obj.hits != 0).slice(0 , RESULTS_NUM);
}

function crawl(baseURL, queryParam) {
	// Reset output and begin crawl
	beginCrawl(baseURL,queryParam);
	
	return output;
}

$("#maxTimeout").on("change", function(event) {
	MAX_TIMEOUT = event.target.value;
	chrome.storage.local.set({
		maxTimeout: MAX_TIMEOUT,
	}, ()=>{});
})

chrome.storage.local.get([
	'maxTimeout',
], function(items) {
	$("#maxTimeout").val(items.maxTimeout || 2000);
});