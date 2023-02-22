# Genomaps.js Use Guide

This document describes how to deploy and configure Genomaps.js on your own application. We cover code and development details [elsewhere](DevGuide.md).

See also [this document](customisation.md) for further use details and customisation options.

## Linking Genomaps.js in your project

The recommended way to link Genomaps to your project is using NPM. For instance, genomaps, can be used as a dependency in a `package.json` file, using its github URL:

```javascript
package.json
...
dependencies {
  "genomaps": "https://github.com/Rothamsted/genomaps.js.git#2.0"
}
```

You can use a specific version or branch name after the '#'. This must correspond to a tag or a branch on github. TODO: we plan to support the NPM hub in future.

If you want to download runtime dependencies in your web project (which doesn't use NPM at runtime), you can use NPM from the command line:
 
```bash
$ npm pack -w 'https://github.com/Rothamsted/genomaps.js.git#2.0'
$ tar xv --gzip -f genomaps-*.tgz
```

As you can see, NPM creates a tarball containing the distribution files, which you can unzip and place on your own web application file system.  

TODO: we don't know any other way to download the distribution files for an NPM package.  

In the Knetminer application, we have a [script][L.20] to manage the above operations for all the third party NPM dependencies that the the application needs.  

[L.20]: https://github.com/Rothamsted/knetminer/blob/master/client-base/update-js.sh

Of course, there are alternative ways to deploy and use the library files. The most manual one is grabbing a copy of the `dist/` directory. We don't recommend this approach, since it makes update difficult. In particular, it loose track of the library version that you have downloaded.

## Required links

To use Genomaps.js you need the following links:

```html
<script src="./dist/js/genemap-lib.js"></script>
<script src="./dist/js/jquery-bstrap.js"></script>
<script src="./dist/js/genemap.js"></script>

<link rel="stylesheet" href="./dis/styles/jquery-bstrap.css">
<link rel="stylesheet" href="./dis/styles/genemap.css">
```

Alternatively, use the `*.mini.*` files, to link compact versions of the same dependencies. Note that the latter are usually very difficult to use for debugging.  

Also, note that the CSS uses a '.bootstrap' class to namespace all the bootstrap CSS code so it won't affect any elements on the page without that class.  

## Basemap file

Genomaps.js needs an XML file that describes the organism chromosome to be visualised. The file houses a genome object and chromosome bands that should be displayed. Below is a sample basemap.xml currently utilised in Knetminer:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<genome>
  <chromosome index="1" length="30427671" number="1">
    <band index="1">
      <start>0</start>
      <end>30427671</end>
      <color>0xFFFFFF</color>
    </band>
  </chromosome>
  <chromosome index="2" length="19698289" number="2">
  	...
  </chromosome>
  <chromosome index="3" length="23459830" number="3">
    ...
  </chromosome>
  <chromosome index="4" length="18585056" number="4">
    ...
  </chromosome>
  <chromosome index="5" length="26975502" number="5">
    ...
  </chromosome>
</genome>
```

* TODO: point to an example, say to look at the details for how its syntax, point to out scripts to build it, point to the files we already have (in knetminer)

## Input data

Basemaps are provided to the Genomaps object as a path url that returns an XML file with a genome root element. In Knetminer basemaps are served from our API endpoint and detailed explaination on how the path url should be structured can be found in the next section.

* TODO: describe the input, or point to examples from knetminer.com


## Generating the Genomaps.js view

The chart will need to be drawn within an easily identifiable containing element, such as a`<div>` that has the `bootstrap` class added. Something like:

	<div id="#map" class="bootstrap"></div>

By default the chart will size to fit the containing element.

The chart will then need to be drawn by creating a GeneMap object and calling the .draw() method:

	var chart = GENEMAP.GeneMap({api_url: 'http://my.server:8000/server-example/arabidopsis/'});
	chart.draw("#map", basemapPath, annotationsPath);

**Note:** the `api_url` parameter is used to tell GeneMap how to construct URLs to send new queries to KnetMiner. It should include the full server method, name and port (`http://my.server:8000`), webapp (`server-example`), and datasource name (`arabidopsis` in this example). Omitting it will not break GeneMap but some KnetMiner-specific tasks may fail.

The `basemapPath` and `annotationsPath` variable need to include a path to the basemap and annotations XML files that you want to draw on the chart. The annotationPath is optional and doesn't have to be supplied.

### Selecting the basemap file

`basemapPath` can be dynamically served when multiple species are present in a data instance. In Knetminer basemaps are selected based on a species [TaxonomyID][L.21], for example the taxnomy ID for `Arabidopsis thaliana` is `3702` and to get the basemap.xml related to it in Knetminer, a `taxID` params is appended to the `basemapPath` and will look like:
	
	var baseMapUrl = api_url/dataset-route/basemap.xml?taxId=3702;

[L.21]: https://www.ncbi.nlm.nih.gov/taxonomy/?term=3702

* TODO: describe how the default location can be changed, show examples from knetminer.

### Redraw on window re-size

The chart object has a redraw method that re-draws the chart without re-loading the data. This is useful as it takes into account any updates to the containing elements size (if it is a % rather than a fixed size). Just call  this whenever the resize event occurrs with something like:

	var resize = function() {
	  chart.redraw("#map");
	};

  d3.select(window).on('resize', resize);

### Changing the rendering options

There are a limited number of rendering options available on the chart object, these aren't fully tested but a few key functions are:

	chart.resetZoom(); // resets the zoom level on the chart
	chart.layout().numberPerRow = 10; // sets the number of chromosomes per row to 10

## Troubleshooting tips

 - D3 doesn't seem to be very good about raising errors when it can't read an XML file, if you are having problems check the XML files being read are valid (no extra & characters for example). This should be easy enough to do by trying to open the XML file in a browser.
 - Check the head contains the `<meta charset="UTF-8">` tag as d3 uses UTF8.
 
 