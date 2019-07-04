/*
 Display SPARQL result files loaded from  github

 Based on the convention that all result files are stored in a directory
 "results" below the directory containing the query, and that its file
 basenames are equal to that of the queries.

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
  outputPlugins: ["error", "boolean", "rawResponse", "table"],
  drawOutputSelector: true,
  useGoogleCharts: false
});

// main function
var loadResultFile = function () {

  var resultRef = getUrlParameterByName('resultRef');

  if (resultRef) {
    var re, resultFile, resultHost, directory, queryFile, repo, queryRef;

    // distinguish by host name -
    // get the host name / first part of the URL
    switch (resultRef.match("^http[s]?://([a-zA-Z0-9_\\.-]+?)/.*")[1]) {
      // IIPT repository - available only within the ZBW intranet
      case 'ite-git':
        resultHost = 'IIPT';
        re = new RegExp("http://ite-git/gitlist/(.*?)\\.git/raw/master/(.*?)/results/(.*)");
        break;
      // GitHub repository - use a cors proxy to access a github file
      case 'api.github.com':
        resultHost = 'GitHub';
        re = new RegExp("https://api.github.com/repos/(.*?)/contents/(.*?)/results/(.*)");
        break;
      // other file on the web (particularly files too large for Github)
      default:
        resultHost = 'Other'
        re = 'undefined';
        resultFile = getUrlParameterByName('resultRef');
        queryRef = getUrlParameterByName('queryRef');
        break;
    }

    if (re !== 'undefined') {
      var found = resultRef.match(re);
      if (found) {
        repo = found[1];
        directory = found[2];
        resultFile = found[3];
        queryFile = resultFile.split(".")[0] + ".rq";
        switch(resultHost) {
          case 'IIPT':
            queryRef = "http://ite-git/gitlist/" + repo + ".git/raw/master/" + directory + "/" + queryFile;
            break;
          case 'GitHub':
            queryRef = "https://github.com/" + repo + "/blob/master/" + directory + "/" + queryFile;
            break;
        }
      }
    }

    // set variable in HTML page
    document.getElementById("result_file").innerHTML = resultFile;
    document.getElementById("query").setAttribute("href", queryRef);

    // get and show the result
    jQuery.getJSON(resultRef, function (data) {
      var result;

      // a repository may return the result directly, or,
      // in case of Github, as a JSON data structure with encoded content
      if (resultHost === 'GitHub') {
        result = b64DecodeUnicode(data.content);
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

// decodes Base64 encoded utf8 string, according to
// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings/43271130
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
