A SPARQL GUI for Queries from Github
=============

Load queries from repositories on the web into an IDE-like environment in your browser,
execute them - and start modifying and playing with them.

The installation at __http://zbw.eu/beta/sparql-lab__ primarily aims at supporting [ZBW
Labs](http://zbw.eu/labs) projects such as
[sparql-queries](../../../sparql-queries) and
[skos-history](../../../skos-history). Additionally, it is used in
[STW Thesaurus for Economics Change Reports (beta)](http://zbw.eu/stw/version/8.14/changes).
Feel free to use the publicly available installation for other purposes - without any warranties. 

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
> http://zbw.eu/beta/sparql-lab/?queryRef=https://api.github.com/repos/jneubert/sparql-queries/contents/class_overview.rq&endpoint=http://data.nobelprize.org/sparql

retrieves and views the query stored at
`https://github.com/jneubert/sparql-queries/blob/master/class_overview.rq` 
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

## Background

* [Joachim Neubert: Publishing SPARQL queries live](http://zbw.eu/labs/en/blog/publishing-sparql-queries-live) (ZBW Labs)
* [Laurens Rietveld/Rinke Hoekstraa: The YASGUI Family of SPARQL Clients](http://www.semantic-web-journal.net/system/files/swj1001.pdf) (Submission to Semantic Web Journal)
