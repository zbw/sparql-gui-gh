/*
 SPARQL Lab glue code
 derived from an example at https://gist.github.com/LaurensRietveld/eebde750f87c52cdfa58

 IDE for SPARQL queries based on YASGUI.
 Optionally, load a query from a remote repository.
 Optionally, substitute VALUES parameters in the query.
 */

"use strict";

// Certain arguments are interpreted by this code, and cannot be used to
// modify SPARQL VALUES parameters:
var reservedArgumentNames = ['endpoint', 'query', 'queryRef', 'hide'];

// The following VALUES replacement code originates from
// https://raw.githubusercontent.com/NatLibFi/Finto-data/04f88fd31200238fe1e094377e4248ef40fbe3f2/tools/ysa-to-yso/ysa-to-yso.js
// by Osma Suominen

// This regular expression will parse a VALUES clause from a SPARQL query
// and return the following match groups:
// 0: the whole VALUES clause
// 1: opening clause e.g. "VALUES (?var1 ?var2) {"
// 2: variables e.g. "?var1 ?var2"
// 3: content of the block (everything within {})
// 4: closing "}"
var valuesBlockRegExp = /(VALUES\s+\(([^)]+)\)\s+\{)([^}]*?)([ \t]*})/i;

// This regular expression matches SPARQL variable names from the
// variable list of a VALUES clause.
// e.g. ["var1", "var2"], no question marks
var variableNamesRegExp = /\w+/g;

// This regular expression matches a single row of a VALUES clause,
// i.e. a set of values enclosed in parentheses. Match groups:
// 1: the content of the row (i.e. what is within the parentheses)
var valueRowRegExp = /\(\s+([^\)]*\s+)/;
// Same as above, but with the global flag, so matches several rows.
var valueRowRegExp_all = /\(\s+([^\)]*\s+)/g;

// This regular expression matches all individual values from a VALUES row:
// either URI tokens (full URI or qname), or literals in quotation marks.
var individualValueRegExp = /(?:[^\s"]+|"[^"]*")+/g;

function getVariables(query) {
  var matches = valuesBlockRegExp.exec(query);
  if (matches == null) return [];
  var variables = matches[2].match(variableNamesRegExp);
  return variables;
}

function getDefaultValues(query) {
  var matches = valuesBlockRegExp.exec(query);
  if (matches == null) return {};
  var valueRows = matches[3].match(valueRowRegExp_all);
  var defaultValueRow = valueRows[0].match(valueRowRegExp)[1];
  var originalValues = defaultValueRow.match(individualValueRegExp);

  var variables = getVariables(query);
  var defaultValues = {};
  for (var i = 0; i < variables.length; ++i) {
    defaultValues[variables[i]] = originalValues[i];
  }
  return defaultValues;
}

function replaceQueryValues(query, newValues) {
  var values = getDefaultValues(query);
  $.each(newValues, function (key, value) {
    // need to determine proper quoting for the values
    // (for 'undef' in the default values, we can't know what is expected,
    // and presume a literal value will fit in most cases)
    if (values[key][0] == '"' || values[key] == 'undef') {
      // a literal value - make sure it's quoted
      if (value[0] != '"') {
        values[key] = JSON.stringify(value);
      } else { // already in quotes
        values[key] = value;
      }
    } else {
      // a resource value, either full URI or qname
      if (value.indexOf('http') == 0) {
        // make sure full URIs are enclosed in angle brackets
        values[key] = "<" + value + ">";
      } else {
        values[key] = value;
      }
    }
  });

  var variables = getVariables(query);

  // Variables which not already defined in the VALUES clause are dropped here.
  var vals = $.map(variables, function (varname) {
    return values[varname];
  });
  var valueString = "( " + vals.join(" ") + " )";
  var matches = valuesBlockRegExp.exec(query);
  if (matches == null) return query;
  var newquery = query.replace(valuesBlockRegExp, matches[1] + "\n" + valueString + "\n" + matches[4]);

  return newquery;
}
// end of VALUES replacement code

function getNewValues (args) {
  var newValues = {};
  $.each(args, function (key, value) {
    // Skip if one of the reserved argument names.
    // VALUES with these names cannot be replaced!
    if(reservedArgumentNames.indexOf(key) == -1) {
      newValues[key] = value;
    }
  });
  return newValues;
}

var extendShareLink = function (yasqe) {
  var shareLink = YASQE.createShareLink(yasqe);
  shareLink["endpoint"] = yasqe.options.sparql.endpoint;
  return shareLink;
};

var consumeUrl = function (yasqe, args) {
  var pageVars = {};

  // default settings
  yasqe.options.sparql.endpoint = "http://zbw.eu/beta/sparql/stwv/query";

  if (args) {

    // change endpoint value if there is any
    if (args.endpoint) {
      yasqe.options.sparql.endpoint = args.endpoint;
    }

    if (args.hide && args.hide === "1") {
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
      // asyncron execution
      setTimeout(function() { yasqe.query(); }, 1);
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

        // replace VALUES parameters, if they exist
        // (otherwise, leave query intact, in order to allow multi-row
        // VALUES parameters in the loaded query)
        var newValues = getNewValues(args);
        if (!jQuery.isEmptyObject(newValues)) {
          query = replaceQueryValues(query, newValues)
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
function setPageVars (vars) {
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
}

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
  // extended sharelink for sharelink button
  createShareLink: extendShareLink,
  // does not use the yasge/yasgui sharelink logic,
  // but url get params
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
