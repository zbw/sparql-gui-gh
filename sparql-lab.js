/*
 SPARQL Lab glue code

 derived from an example at https://gist.github.com/LaurensRietveld/eebde750f87c52cdfa58
 */

"use strict";

var consumeUrl, setPageVars;

consumeUrl = function (yasqe, args) {
  var pageVars = {};

  // default settings
  yasqe.options.sparql.endpoint = "http://zbw.eu/beta/sparql/stwv/query";

  if (args) {

    // change endpoint value if there is any
    if (args.endpoint) {
      yasqe.options.sparql.endpoint = args.endpoint;
    }

    if (args.hide && args.hide !== 0) {
      document.getElementById("yasqe").style.display = "none";
      document.getElementById("results").style.display = "none";
      document.getElementById("results-link").style.display = "none";
      //YASR.defaults.drawOutputSelector = false;
    }

    //want to consume other arguments such as the request type (POST/GET), or arguments to send to endpoint
    //feel free to add them in this function as well.
    //as you see, all options you can specify in the default settings, are configurable via yasqe.options as well

    // change query value if provided in URL
    // (takes precedence over queryref)
    if (args.query) {
      yasqe.setValue(args.query);
      yasqe.query();
    }
    //Or, if you want to configure yasqe via a remote url (e.g. a query in some file elsewhere),
    //feel free to do so!
    else if (args.queryRef) {
      var re, queryHost;

      // distinguish by host  name -
      // get the host name / first part of the URL
      switch (args.queryRef.match("^http[s]?://([a-zA-Z0-9_\\.-]+?)/.*")[1]) {
        // IIPT repository - available only within the ZBW intranet
        case 'ite-git':
          queryHost = 'IIPT';
          re = new RegExp("http://ite-git/gitlist/(.*?)\\.git/raw/master/(.*)");
          break;
        // GitHub repository - use a cors proxy to access a github file
        case 'api.github.com':
          queryHost = 'GitHub';
          re = new RegExp("https://api.github.com/repos/(.*?)/contents/(.*)");
          break;
      }

      // set variables for use in HTML page
      pageVars.queryRef = args.queryRef;
      pageVars.queryHost = queryHost;
      if (re !== 'undefined') {
        var found = args.queryRef.match(re);
        if (found) {
          pageVars.queryRepo = found[1];
          pageVars.queryFile = found[2];
        }
      }

      // get the query and execute
      $.get(args.queryRef, function (data) {
        var query;

        // a repository may return the query directly, or,
        // in case of Github, as a JSON data structure with encoded content
        if (queryHost === 'GitHub') {
          query = atob(data.content);
        } else {
          query = data;
        }

        // q+d versionHistorySet value replacement (must be first value parameter)
        if (args.versionHistoryGraph) {
          re = new RegExp("(values\\s+\\(\\s+\\?versionHistoryGraph.*?\\s+\\)\\s+\\{\\s+\\(\\s+<)\\S+(>.*?\\s+\\)\\s+\\})", "i");
          query = query.replace(re, "$1" + args.versionHistoryGraph + "$2");
        }
        // q+d language value replacement (must be last value parameter)
        if (args.language) {
          re = new RegExp("(values\\s+\\(\\s+.*?\\?language\\s+\\)\\s+\\{\\s+\\(\\s+.*?\")\\w\\w(\"\\s+\\)\\s+\\})", "i");
          query = query.replace(re, "$1" + args.language + "$2");
        }
        // q+d oldVersion and newVersion value replacement (must be
        // adjacent value parameters, " undef undef " by default)
        if (args.oldVersion && args.newVersion) {
          re = new RegExp("(values\\s+\\(\\s+.*?\\?oldVersion\\s+\\?newVersion\\s+.*?\\)\\s+\\{\\s+\\(\\s+.*?\\s+)undef undef(.*?\\s+\\)\\s+\\})", "i");
          query = query.replace(re, "$1" + " \"" + args.oldVersion + "\" \"" + args.newVersion + "\" " + "$2");
          if (document.getElementById("new_version")) {
            document.getElementById("new_version").innerHTML = "v " + args.newVersion;
          }
        }
        // q+d conceptType value replacement
        // (zbwext:Descriptor by default)
        if (args.conceptType) {
          re = new RegExp("(values\\s+\\(\\s+.*?\\?conceptType\\s+.*?\\)\\s+\\{\\s+\\(\\s+.*?\\s+)zbwext:Descriptor(.*?\\s+\\)\\s+\\})", "i");
          query = query.replace(re, "$1" + args.conceptType + "$2");
        }
        yasqe.setValue(query);
        yasqe.query();
      });
    }
  }
  // set more variables for use in HTML page, and modify it
  pageVars.endpoint = yasqe.options.sparql.endpoint;
  setPageVars(pageVars);
};

// set specific elements on the html page
setPageVars = function (vars) {
  // endpoint has to be defined
  document.getElementById("endpoint_url").innerHTML = vars.endpoint;
  // additionally, if queryRef was assigned
  if (vars.queryRef) {
    document.getElementById("query_details").innerHTML = "Query: " + vars.queryRef;
  }
  // additionally, if the query reference could be parsed and split up
  if (vars.queryRepo) {
    document.getElementById("query_details").innerHTML =
        vars.queryHost + " repo: " + vars.queryRepo + ", Query: " + vars.queryFile;
    document.title = vars.queryFile + ' | SPARQL Lab';
  }
};

var yasqe = YASQE(document.getElementById("yasqe"), {
  // display full query
  viewportMargin: Infinity,
  // grey edit window during query execution
  backdrop: 99,
  // modify codemirror tab handling to solely use 2 spaces
  tabSize: 2,
  indentUnit: 2,
  extraKeys: {
    Tab: function (cm) {
      var spaces = new Array(cm.getOption("indentUnit") + 1).join(" ");
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
// disable persistency
YASR.defaults.persistency.prefix = false;

var yasr = YASR(document.getElementById("yasr"), {
  //this way, the URLs in the results are prettified using the defined prefixes in the query
  getUsedPrefixes: yasqe.getPrefixesFromQuery,
  useGoogleCharts: false
});

// link yasqe and yasr together
yasqe.options.sparql.callbacks.complete = function () {
  window.yasr.setResponse.apply(this, arguments);
  document.getElementById('results').scrollIntoView();
};
