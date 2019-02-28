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
	}, 10)
}

$("#wtfii-button").on("click", function(event) {
	searchQuery($("#wtfii-input").val());
});

$("#wtfii-input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#wtfii-button").click();
    }
});