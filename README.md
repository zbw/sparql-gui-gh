A SPARQL GUI for Queries from Github and other web repositories (Code used for SPARQL Lab)
=============

Load queries from repositories on the web into an IDE-like environment in your browser,
execute them - and start modifying and playing with them.

The __SPARQL Lab__ installation at __http://zbw.eu/beta/sparql-lab__ primarily
aims at supporting [ZBW Labs](http://zbw.eu/labs) projects such as
[sparql-queries](../../../sparql-queries) and
[skos-history](https://github.com/jneubert/skos-history). Additionally, it is
used in [STW Thesaurus for Economics Change Reports
(beta)](http://zbw.eu/stw/version/8.14/changes).  Feel free to use the publicly
available installation for other purposes - without any warranties.

This project provides mainly glue code. It makes heavy use
of Laurens Rietveld's great [YASQE](http://yasqe.yasgui.org/) and
[YASR](http://yasr.yasgui.org/) javascript libraries, part of his
[YASGUI](http://yasgui.org) project.

## URL arguments

The script is controlled by the following URL arguments:  

Argument | Description
---------|------------
endpoint | URL of a SPARQL endpoint (defaults to an endpoint with the STW version history). Remote endpoints have to be [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled.
query    | URL-encoded query text (takes precedence over queryRef if both are defined, defaults to the YASQE built-in example query if neither).
queryRef | URL of a query on the web (no default). Works with GitHub API as in the example below, and presumably with other public repository URLs (CORS on the repository server required).
hide     | With `hide=1`, the query pane is hidden from display (defaults to hide=0).

Example: The URL
> http://zbw.eu/beta/sparql-lab/?queryRef=https://api.github.com/repos/zbw/sparql-queries/contents/class_overview.rq&endpoint=http://data.nobelprize.org/sparql

retrieves and views the query stored at
`https://github.com/zbw/sparql-queries/blob/master/class_overview.rq` 
via the GitHub API and executes it on the
endpoint `http://data.nobelprize.org/sparql`.


## VALUES variable replacement in queries

If stored SPARQL queries contain a VALUES clause, this can be used to inject variables into the code of queries. URL arguments other than the above listed ones are parsed and replaced, when their names match VALUES variables in the query.
 
This mechanism can be used for providing defaults in queries, which can be overridden by URL arguments. It is supposed to work for a single set of values in a single VALUES clause. To be replaced correctly, literal values in the VALUES clause have be enclosed in double quotes. 'undef' variables are presumed to be literals.

Example: The URL

> http://zbw.eu/beta/sparql-lab/?queryRef=https://api.github.com/repos/jneubert/skos-history/contents/sparql/added_concepts.rq&language=de

loads the query (shown below in a heavily abbreviated form) and replaces the value for the `?language` variable in the VALUES clause.

```
SELECT *
WHERE {
  # parameters
  VALUES ( ?versionHistoryGraph ?oldVersion ?newVersion ?language ) {
      ( <http://zbw.eu/stw/version> undef undef "en" )
  }

  # ...
  
  # restrict output to a certain language
  FILTER ( lang(?prefLabel) = ?language )  
}
```

# Display of cached result files

When the datasets addressed in a query are not available through public endpoints, cached result files can be provided instead of interactively executed queries.

The functionality is available via the URI "/result", e.g., __http://zbw.eu/beta/sparql-lab/result__


## URL arguments

The result script is controlled by the following URL arguments:

Argument | Description
---------|------------
queryRef | URL of a sparql-json result on the web (no default). Works with GitHub API as in the example below, and presumably with other public repository URLs (CORS on the repository server required).

Example: The URL
> http://zbw.eu/beta/sparql-lab/result?resultRef=https://api.github.com/repos/zbw/sparql-queries/contents/wikidata/results/count_persons_by_wp_language.wikidata_2016-11-07.json

retrieves and views the result stored at
`https://github.com/zbw/sparql-queries/blob/master/wikidata/results/count_persons_by_wp_language.wikidata_2016-11-07.json` 
via the GitHub API.


## Naming convention

The following naming convention is used:

1. A result file resides in the same repository as the query in a directory "results" below the directory containing the query.
2. The base name of the result file is equal to the base name of the query.
3. The versions of the datasets, which were queried, should be indicated in further file name parts, with `_` as separator between the dataset name and the version name, and `.` as seperator between multiple dataset_version statements.

For example, the result of the `resultRef` in the example above was retrieved by the query `https://github.com/zbw/sparql-queries/blob/master/wikidata/count_persons_by_wp_language.rq` against the dataset `wikidata` in version `2016-11-07`.



# Background

* [Joachim Neubert: Publishing SPARQL queries live](http://zbw.eu/labs/en/blog/publishing-sparql-queries-live) (ZBW Labs)
* [Laurens Rietveld/Rinke Hoekstraa: The YASGUI Family of SPARQL Clients](http://www.semantic-web-journal.net/system/files/swj1001.pdf) (Submission to Semantic Web Journal)
