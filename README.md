# Rock Properties Explorer


An AngularJS/TypeScript web app to deliver public Rock Properties data from: 
<a href="http://www.ga.gov.au/geophysics-rockpropertypub-gws/web/">
	http://www.ga.gov.au/geophysics-rockpropertypub-gws/web/
</a>	

- Visualisation tools provided by 
<a href="https://github.com/GeoscienceAustralia/explorer-rock-properties-components">explorer-rock-properties-components</a>.
- Geospatial indexing services provided by `explorer-quadtree-service`.


2 x pages in this project:

1. `src/main/webapp/index.html` for local development
2. `src/main/webapp/rock-properties.html` for deployment (file paths written to integrate with `explorer-web` overlay).

This project was generated with [yo generator-explorer] (https://github.com/GeoscienceAustralia/generator-explorer)
generator

## Install, Build, Run

```bash
npm install
bower install
tsd install
gulp
```

The default task has a nodemon watching for changes.<br/>
To just run server: `gulp serve`