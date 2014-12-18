// SPARQL Lab glue code

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
  if (args.hide && args.hide != 0) {
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
    if (document.getElementById("sub_title")) {
      document.getElementById("sub_title").innerHTML = found[2];
    }
    document.title = found[2] + ' | SPARQL Lab';

    // get the query and exexcute
    $.get(args.queryRef, function(data) {
      var query = atob(data.content);
      // q+d versionHistorySet value replacement (must be first value parameter)
      if (args.versionHistoryGraph) {
        var re = new RegExp("(values\\s+\\(\\s+\\?versionHistoryGraph\\s+.*?\\s+\\)\\s+\\{\\s+\\(\\s+<)\\S+(>\\s+.*?\\s+\\)\\s+\\})", "i");
        query = query.replace(re, "$1" + args.versionHistoryGraph + "$2");
      }
      // q+d language value replacement (must be last value parameter)
      if (args.language) {
        var re = new RegExp("(values\\s+\\(\\s+.*?\\?language\\s+\\)\\s+\\{\\s+\\(\\s+.*?\")\\w\\w(\"\\s+\\)\\s+\\})", "i");
        query = query.replace(re, "$1" + args.language + "$2");
      }
      // q+d oldVersion and newVersion value replacement (must be
      // adjacent value parameters, " undef undef " by default)
      if (args.oldVersion && args.newVersion) {
        var re = new RegExp("(values\\s+\\(\\s+.*?\\?oldVersion\\s+\\?newVersion\\s+.*?\\)\\s+\\{\\s+\\(\\s+.*?\\s+)undef undef(.*?\\s+\\)\\s+\\})", "i");
        query = query.replace(re, "$1" + " \"" + args.oldVersion + "\" \"" + args.newVersion + "\" " + "$2");
        if (document.getElementById("new_version")) {
          document.getElementById("new_version").innerHTML = "v " + args.newVersion;
        }
      }
      // q+d conceptType value replacement
      // (zbwext:Descriptor by default)
      if (args.conceptType) {
        var re = new RegExp("(values\\s+\\(\\s+.*?\\?conceptType\\s+.*?\\)\\s+\\{\\s+\\(\\s+.*?\\s+)zbwext:Descriptor(.*?\\s+\\)\\s+\\})", "i");
        query = query.replace(re, "$1" + args.conceptType + "$2");
      }
      yasqe.setValue(query);
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

// merge fitting labels into uris, don't try to fetch from preflabel.org
YASR.plugins.table.defaults.mergeLabelsWithUris = true;
YASR.plugins.table.defaults.fetchTitlesFromPreflabel = false;
YASR.plugins.table.defaults.datatable.pageLength = 50;
YASR.plugins.pivot.defaults.mergeLabelsWithUris = true;
// don't load google content (protect privacy)
YASR.plugins.pivot.defaults.useGoogleCharts = false;
// disable persitency
YASR.defaults.persistency.prefix = false;

var yasr = YASR(document.getElementById("yasr"), {
  //this way, the URLs in the results are prettified using the defined prefixes in the query
  getUsedPrefixes: yasqe.getPrefixesFromQuery,
  useGoogleCharts: false
});
 
//link yasqe and yasr together
yasqe.options.sparql.callbacks.complete = yasr.setResponse;

