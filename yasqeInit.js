var consumeUrl = function(yasqe, args) {
//change query and endpoint value if there are any
// "https://raw.githubusercontent.com/jneubert/skos-history/master/sparql/version_overview.rq"
if (args.query) yasqe.setValue(args.query);
if (args.endpoint) yasqe.options.sparql.endpoint = "http://zbw.eu/beta/sparql/stwv/query";

//want to consume other arguments such as the request type (POST/GET), or arguments to send to endpoint
//feel free to add them in this function as well.
//as you see, all options you can specify in the default settings, are configurable via yasqe.options as well
 
//Or, if you want to configure yasqe via a remote url (e.g. a query in some file elsewhere),
//feel free to do so!
//This example uses a cors proxy to access a github file containing a query
if (args.queryRef) $.get(args.queryRef, function(data) {yasqe.setValue(atob(data.content))});
};
 
var yasqe = YASQE(document.getElementById("yasqe"), {
sparql: {
showQueryButton: true,
endpoint: "http://zbw.eu/beta/sparql/stwv/query"
},
consumeShareLink: consumeUrl
});


var yasr = YASR(document.getElementById("yasr"), {
//this way, the URLs in the results are prettified using the defined prefixes in the query
getUsedPrefixes: yasqe.getPrefixesFromQuery
});
 
/**
* Set some of the hooks to link YASR and YASQE
*/
yasqe.options.sparql.handlers.success = function(data, textStatus, xhr) {
yasr.setResponse({response: data, contentType: xhr.getResponseHeader("Content-Type")});
};
yasqe.options.sparql.handlers.error = function(xhr, textStatus, errorThrown) {
var exceptionMsg = textStatus + " (response status code " + xhr.status + ")";
if (errorThrown && errorThrown.length) exceptionMsg += ": " + errorThrown;
yasr.setResponse({exception: exceptionMsg});
};


