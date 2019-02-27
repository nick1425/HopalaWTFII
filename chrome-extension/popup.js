const hardCodedStubsAreFun = [
	{url: "https://www.google.com", hits: 20},
	{url: "https://www.facebook.com", hits: 5},
	{url: "https://www.unicef.org", hits: 901254195},
]

var queryResults = null;

function getQueryResults(query) {
	// Call for api.
	// async: false
	queryResults = hardCodedStubsAreFun;
	queryResults.sort((a, b) => b.hits - a.hits);
}

function searchQuery(query) {
	alert("Searching for " + query);
	
	getQueryResults(query);
	let html = [];
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
		const element = queryResults[i];
		let hits = element.hits;
		let url = "<a id='url_" + i + "'>" + element.url + "</a>";
		html.push(	"<tr>",
						"<td>",
							url,
						"</td>",
						"<td>",
							hits,
						"</td>",
					"</tr>",
		);
	};

	$("#results").append(html.join(""));

	for (let i = 0; i < queryResults.length; i++) {
		$("#url_" + i).on("click", function() {
			chrome.tabs.create({url: queryResults[i].url});
		});
	}

	$("#wtfii-button").removeClass("is-loading");	
}

$("#wtfii-button").on("click", function(event) {
	$(this).addClass("is-loading");
	searchQuery($("#wtfii-input").val());
});

$("#wtfii-input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#wtfii-button").click();
    }
});