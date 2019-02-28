const MAX_TIMEOUT = 1500; // Time in miliseconds to crawl for
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

function getLinks(page) {
	var links = page.getElementsByTagName("a")
	var urls = [];

	for (var i=0; i<links.length; i++) {
		let url = links[i].getAttribute("href");
		if (url) {
			if (url.charAt(0) == '/') {
				url = hostname + url;
			}
			
			if (!urls.includes(url)) {
				urls.push(url);
			}
		}
	}

	return urls;
}

function getHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
	hostname = hostname.split('?')[0];
	
	return hostname;
}

function getFullHostname(url) {
	if (url.charAt(7) == "/") {
		return "https://" + getHostname(url);
	}

	return "http://" + getHostname(url);
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
	let pageLinks = getLinks(page);
	for (var i = pageLinks.length; i --> 0;) {
		if (getFullHostname(pageLinks[i]) === hostname) {
			if (!usedURLs.includes(pageLinks[i])) { // If the URL was not visited for recursion yet
				if (hits > Math.max.apply(Math, output.map(function(o) { return o.hits; }))) {
					queuedURLs.unshift({url: pageLinks[i], depth: depth + 1}); // Add the URL to be queue'd for next iteration	
				} else {
					queuedURLs.push({url: pageLinks[i], depth: depth + 1}); // Add the URL to be queue'd for next iteration
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
	hostname = getFullHostname(baseURL);
	startTime = performance.now();
	doCrawl({url: baseURL, depth: 1});
}

function endCrawl() {

}

function crawl(baseURL, queryParam) {
	// Reset output and begin crawl
	beginCrawl(baseURL,queryParam);
	
	return output;
}