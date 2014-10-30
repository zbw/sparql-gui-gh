sparql-gui-gh
=============

View, edit and execute SPARQL queries stored on GitHub.

This project simply consists of a little bit of glue code. It makes heavy use
of Laurens Rietveld's [YASGE](http://yasqe.yasgui.org/) and
[YASR](http://yasr.yasgui.org/) javascript libraries, part of his
[YASGUI](http://yasgui.org) project.

An installation is publicly available - without any warranties - at
http://zbw.eu/beta/sparql-gui. It's main purpose is supporting [ZBW
Labs](http://zbw.eu/labs) projects such as
[sparql-queries](../../../sparql-queries) and
[skos-history](../../../skos-history).

Example:
http://zbw.eu/beta/sparql-gui/?queryRef=https://api.github.com/repos/jneubert/sparql-queries/contents/class_overview.rq&endpoint=http://data.nobelprize.org/sparql
views and executes the query stored at
https://github.com/jneubert/sparql-queries/blob/master/class_overview.rq on the
endpoint `http://data.nobelprize.org/sparql`.

