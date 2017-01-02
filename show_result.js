/*
 Display SPARQL result files for STW change reports
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
var loadSparqlResult = function(args) {
  var reportFileName, downloadLink;

  // get datafile name
  reportFileName = document.getElementById("jsonFile").href;

  // load datafile
  jQuery.getJSON(reportFileName, function (data) {
    window.yasr.setResponse(data);

    // execute search from parameter
    if (getParameterByName('search') !== '') {
      YASR.$('.dataTables_filter input').val(getParameterByName('search')).keyup();
    }
  });
};

// helper function
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
