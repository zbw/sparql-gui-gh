sparql-gui-gh
=============

_View, edit and execute SPARQL queries stored on GitHub_

This project simply consists of a little bit of glue code. It makes heavy use
of Laurens Rietveld's [YASQE](http://yasqe.yasgui.org/) and
[YASR](http://yasr.yasgui.org/) javascript libraries, part of his
[YASGUI](http://yasgui.org) project.

An installation is publicly available - without any warranties - at
http://zbw.eu/beta/sparql-lab. It's main purpose is supporting [ZBW
Labs](http://zbw.eu/labs) projects such as
[sparql-queries](../../../sparql-queries) and
[skos-history](../../../skos-history).

Example:
http://zbw.eu/beta/sparql-lab/?queryRef=https://api.github.com/repos/jneubert/sparql-queries/contents/class_overview.rq&endpoint=http://data.nobelprize.org/sparql
views and executes the query stored at
https://github.com/jneubert/sparql-queries/blob/master/class_overview.rq on the
endpoint `http://data.nobelprize.org/sparql`.

Remote endpoints have to be
[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled for
this to work).

The URL parameter &hide={anyvalue} hides the query editing area and the switch
for raw results.

