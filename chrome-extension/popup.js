const hardCodedStubsAreFun = [
	{url: "https://www.google.com", hits: 20},
	{url: "https://www.facebook.com", hits: 5},
	{url: "https://www.unicef.org", hits: 901254195},
]

var queryResults;
var getQueryResults;
var baseURL;
chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
	baseURL = tabs[0].url;
	if (baseURL.startsWith("chrome://")) {
		$("body").html("<h2>Cannot search in chrome:// websites</h2>")
	}
});

chrome.storage.local.get('clientWebCrawling', function(data) {
	if (data.clientWebCrawling) {
		getQueryResults = (query) => {
			// alert("Web-crawling on the client");
			queryResults = crawl(baseURL, query);

			queryResults.sort((a, b) => b.hits - a.hits);
		}
	} else {
		getQueryResults = (query) => {
			// alert("Web-crawling on the server");

			// ****** STUB *******
			queryResults = hardCodedStubsAreFun;
			// ****** STUB *******

			queryResults.sort((a, b) => b.hits - a.hits);
		}
	}
});

function searchQuery(query) {
	$("#wtfii-button").addClass("is-loading");

	setTimeout(() => {

		// Get query results with ajax (async: false)
		getQueryResults(query);
		
		let html = [];
		html.push("<tbody>");
		html.push(	"<tr>",
						"<th>",
							"URL",
						"</th>",
						"<th>",
							"Hits",
						"</th>",
					"</tr>",
		);
				
		for (let i = 0; i < queryResults.length; i++) {
			let hits = queryResults[i].hits;
			let link = "<a id='url_" + i + "'>" + queryResults[i].url + "</a>";
			html.push(	"<tr>",
							"<td>",
								link,
							"</td>",
							"<td>",
								hits,
							"</td>",
						"</tr>",
			);
		};
			
		html.push("</tbody>");
		
		$("#results").hide();
		$("#results").html(html.join(""));
		$("#results").fadeIn("slow");
		
		for (let i = 0; i < queryResults.length; i++) {
			$("#url_" + i).on("click", function() {
				chrome.tabs.create({url: queryResults[i].url + "#" + query});
			});
		}
		
		$("#wtfii-button").removeClass("is-loading");

		initSelector();
	}, 10)
}


var curSelectedIndex = null;

function initSelector() {
	curSelectedIndex = 0;
	$("#url_" + curSelectedIndex).addClass("hovered");

	keyDownHandler = () => {
		if (event.keyCode == 13)  { // Return
			$("#url_" + curSelectedIndex).click();
			event.preventDefault();
			return;
		} else if (event.keyCode == 40) {
			curSelectedIndex = (curSelectedIndex + 1) % queryResults.length;
		} else if (event.keyCode == 38) {
			if (curSelectedIndex == 0) {
				curSelectedIndex = queryResults.length - 1;
			} else {
				curSelectedIndex -= 1;
			}
		}
	
		$("a").removeClass("hovered");
		$("#url_" + curSelectedIndex).addClass("hovered");
	}
}

$("#wtfii-button").on("click", function(event) {
	searchQuery($("#wtfii-input").val());
});

$("#wtfii-input").on("focus", function(event) {
    keyDownHandler = () => {};
});

$("#wtfii-input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#wtfii-button").click();
    }
});

var keyDownHandler = () => {

}

$(document).keydown(function(event) {
	keyDownHandler();
});