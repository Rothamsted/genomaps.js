var GENEMAP = GENEMAP || {};

GENEMAP.QTLAnnotationLayout = function (userConfig) {

  var defaultConfig = { scale: 1};
  var config = _.merge({}, defaultConfig, userConfig);

  var generateNodesFromClusters = function(clusters) {
    return clusters.map( function(c){
      var qtlList = flattenCluster(c);
      var start = qtlList.reduce( function(min, c){
        return Math.min( min, c.start);
      }, Infinity);

      var end = qtlList.reduce( function(max, c){
        return Math.max( max, c.end);
      },0 );

      var id = qtlList.reduce( function(id, c){
        return id + (id ?  '|' : '')  + c.start + '-' + c.end;
      }, "");

      var midpoint = (start + end ) / 2;

      return {
        cluster: c,
        qtlList : qtlList,
        count : qtlList.length,
        start : start,
        end : end,
        midpoint : midpoint,
        chromosome : qtlList[0].chromosome,
        type: "qtllist",
        id: id
      }
    });

    var combiner = GENEMAP.QTLAnnotationCombiner();
    var identicalResult = combiner.combineSimilarQTLAnnotations(chromosome.annotations.qtls);
  }

  var generateChromosomeLayout = function(chromosome){
    chromosome.layout.qtlDisplayClusters = chromosome.layout.qtlClusters.slice();

    var nLevels = Math.floor(config.scale);

    while ( nLevels -- ) {
      chromosome.layout.qtlDisplayClusters = openClusters(
        chromosome.layout.qtlDisplayClusters);
    }

    var nodes = generateNodesFromClusters( chromosome.layout.qtlDisplayClusters);

    positioner = GENEMAP.QtlPositioner();
    return positioner.sortQTLAnnotations(nodes);
  };


  var annotateCluster = function(cluster){
    if (cluster.value){
      cluster.unit = true;
      cluster.start = cluster.value.start;
      cluster.end = cluster.value.end;
    }
    else {

      var l = cluster.left;
      var r = cluster.right;

      annotateCluster(l);
      annotateCluster(r);

      cluster.unit = (l.unit && r.unit
      && (l.start == r.start ) && ( l.end == r.end));

      cluster.start = Math.min(cluster.left.start, cluster.right.start);
      cluster.end = Math.max(cluster.left.end, cluster.right.end);
    }
  }

  var generateChromosomeClusters = function(chromosome){

    var hClusters = hcluster.hcluster(chromosome.annotations.qtls,
      function( a, b ){

        if ( (a.end == b.end) && (a.start == b.start ) ) {
          return 0;
        }

        var overlap =  Math.min(a.end, b.end) - Math.max(a.start, b.start);
        var aLength = a.end - a.start;
        var bLength = b.end - b.start;
        var normedOverlap = overlap / ( aLength + bLength) / Math.abs( aLength - bLength);
        return Math.exp( - normedOverlap );
      },"single", 1 );

    hClusters.forEach(function(cluster) {
      annotateCluster(cluster);
    });

    return hClusters
  };

  var openClusters = function(clusters){
      var result = [];

      clusters.forEach( function (cluster ){
        if (cluster.value || cluster.unit ) {
          result.push(cluster)
        }
        else {
          var l = cluster.left;
          var r = cluster.right;

          result.push(l);
          result.push(r);
        }
      });

    return result;
   };

  var flattenCluster = function(cluster){
    if (cluster.size == 1){
      return [cluster.value]
    } else {
      return flattenCluster(cluster.left).concat(flattenCluster(cluster.right))
    }
  };

  my = {};

  my.layoutChromosome = function(chromosome){
    chromosome.layout.qtlNodes = (
    generateChromosomeLayout(chromosome) || chromosome.layout.qtlNodes);
  };

  my.computeChromosomeClusters = function(chromosome){
    chromosome.layout.qtlClusters = generateChromosomeClusters(chromosome);
  };

  return my;
}