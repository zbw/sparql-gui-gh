sparql-gui-gh
=============

_View, edit and execute SPARQL queries stored on GitHub_

This project makes heavy use
of Laurens Rietveld's [YASQE](http://yasqe.yasgui.org/) and
[YASR](http://yasr.yasgui.org/) javascript libraries, part of his
[YASGUI](http://yasgui.org) project.

An installation is publicly available - without any warranties - at
http://zbw.eu/beta/sparql-lab. It's main purpose is supporting [ZBW
Labs](http://zbw.eu/labs) projects such as
[sparql-queries](../../../sparql-queries) and
[skos-history](../../../skos-history). Additionally, it is used in
[STW Thesaurus for Economics Change Reports (beta)](http://zbw.eu/stw/version/8.14/changes).

## URL arguments

Argument | Description
---------|------------
endpoint | SPARQL endpoint (defaults to an endpoint with the STW version history).
query    | URL-encoded query text (defaults to the YASQE built-in query, takes precedence over queryRef if both are defined).
queryRef | URL of a query on the web (no default). Works with GitHub as in the example below, and maybe with other URLs too.
hide     | With `hide=1`, the query pane is hidden from display (defaults to hide=0).


Example: The URL
> http://zbw.eu/beta/sparql-lab/?queryRef=https://api.github.com/repos/jneubert/sparql-queries/contents/class_overview.rq&endpoint=http://data.nobelprize.org/sparql

retrieves and views the query stored at
`https://github.com/jneubert/sparql-queries/blob/master/class_overview.rq` 
via the GitHub API and executes it on the
endpoint `http://data.nobelprize.org/sparql`.

Remote endpoints have to be
[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled for
this to work).

## VALUES replacement in queries

If stored SPARQL queries contain a VALUES clause, this can be used to inject parameters into the code of queries. URL arguments (other than the above listed) are parsed and replaced, when their names match VALUES parameters in the query.
 
 This mechanism can be used for providing defaults in queries, which can be overriden by URL arguments. It is supposed to work for a single set of values in a single VALUES clause. 
 