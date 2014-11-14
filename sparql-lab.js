// from an example at https://gist.github.com/LaurensRietveld/eebde750f87c52cdfa58
var consumeUrl = function(yasqe, args) {

  //change query and endpoint value if there are any
  if (args.query) {
    yasqe.setValue(args.query);
    yasqe.query();
  }
  if (args.endpoint) {
    yasqe.options.sparql.endpoint = args.endpoint;
  } else {
    yasqe.options.sparql.endpoint = "http://zbw.eu/beta/sparql/stwv/query";
  }
  // display the endpoint url on the page
  document.getElementById("endpoint_url").innerHTML = yasqe.options.sparql.endpoint;
  if (args.hide) {
    document.getElementById("yasqe").style.display = "none";
    document.getElementById("results").style.display = "none";
    document.getElementById("results-link").style.display = "none";
    YASR.defaults.drawOutputSelector = false;
  }

  //want to consume other arguments such as the request type (POST/GET), or arguments to send to endpoint
  //feel free to add them in this function as well.
  //as you see, all options you can specify in the default settings, are configurable via yasqe.options as well

  //Or, if you want to configure yasqe via a remote url (e.g. a query in some file elsewhere),
  //feel free to do so!
  //This example uses a cors proxy to access a github file containing a query
  if (args.queryRef) {

    // display query reference
    var re = new RegExp("https://api.github.com/repos/(.*?)/contents/(.*)");
    var query_uri = args.queryRef;
    var found = query_uri.match(re);
    document.getElementById("repo").innerHTML = found[1];
    document.getElementById("query_reference").innerHTML = found[2];

    // get the query and exexcute
    $.get(args.queryRef, function(data) {
      yasqe.setValue(atob(data.content));
      yasqe.query();
    });
  }
};
 
var yasqe = YASQE(document.getElementById("yasqe"), {
  // display full query
  viewportMargin: Infinity,
  // modify codemirror tab handling to solely use 2 spaces
  tabSize: 2,
  indentUnit: 2,
  extraKeys: {
    Tab: function(cm) {
      var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
      cm.replaceSelection(spaces);
    }
  },
  sparql: {
    showQueryButton: true
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
  yasr.setResponse(
    {response: data, contentType: xhr.getResponseHeader("Content-Type")}
  );
};
yasqe.options.sparql.handlers.error = function(xhr, textStatus, errorThrown) {
  var exceptionMsg = textStatus + " (response status code " + xhr.status + ")";
  if (errorThrown && errorThrown.length) exceptionMsg += ": " + errorThrown;
  yasr.setResponse({exception: exceptionMsg});
};

