/*
 Display SPARQL result files loaded from  github
 */

"use strict"

// YASR settings and initialization

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
  //getUsedPrefixes: yasqe.getPrefixesFromQuery,
  drawOutputSelector: false,
//  drawDownloadIcon: false,
  useGoogleCharts: false
});

// main function
var loadResultFile = function () {

  var resultRef = getUrlParameterByName('resultRef');

  if (resultRef) {
    var re, resultFile, resultHost;

    // distinguish by host name -
    // get the host name / first part of the URL
    switch (resultRef.match("^http[s]?://([a-zA-Z0-9_\\.-]+?)/.*")[1]) {
      // IIPT repository - available only within the ZBW intranet
      case 'ite-git':
        resultHost = 'IIPT';
        re = new RegExp("http://ite-git/gitlist/(.*?)\\.git/raw/master/(.*)");
        break;
      // GitHub repository - use a cors proxy to access a github file
      case 'api.github.com':
        resultHost = 'GitHub';
        re = new RegExp("https://api.github.com/repos/(.*?)/contents/(.*)");
        break;
    }

    if (re !== 'undefined') {
      var found = resultRef.match(re);
      if (found) {
        resultFile = found[2];
      }
    }

    // set variable in HTML page
    document.getElementById("result_file").innerHTML = resultFile;

    // get and show the result
    jQuery.getJSON(resultRef, function (data) {
      var result;

      // a repository may return the result directly, or,
      // in case of Github, as a JSON data structure with encoded content
      if (resultHost === 'GitHub') {
        result = atob(data.content);
      } else {
        result = data;
      }
      window.yasr.setResponse(result);
    });
  }
};

// helper function
function getUrlParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

