var fs=require("fs");
(function() {
  var console = require("console");
  var internal = require("internal");
  var db = internal.db;

  var gName = "imdb";

 
  var vNameBasics = "name.basics";
  var vTitleAkas = "title.akas";
  var vTitleBasics = "title.basics";
  var vTitleEpisode = "title.episode";
  var vTitleRatings = "title.ratings";

  var eWriters = "writers";
  var eDirectors = "directors";
  var eTitleAkas = "title.akas_edges";
  var eTitleEpisode = "title.espisode_edges";
  var eTitlePrincipals = "title.principals_edges";
  var eTitleRatings = "title.ratings_edges";

  var vertexCollections = [vNameBasics, vTitleAkas, vTitleBasics, vTitleEpisode, vTitleRatings];
  var edgeCollections = [eWriters, eDirectors, eTitleAkas, eTitleEpisode, eTitlePrincipals, eTitleRatings];


  var gm = require('@arangodb/general-graph');
  var g;

  try {
    gm._drop(gName);
  } catch (e) { }

  for(const vCollection of vertexCollections){
    try {
        db._drop(vCollection);
    } catch (e) { }
    db._create(vCollection);
  }
  for(const eCollection of edgeCollections){
    try {
        db._drop(eCollection);
    } catch (e) { }
    db._createEdgeCollection(eCollection);
  }




  g = gm._create(gName);
  for(const vCollection of vertexCollections){
    g._addVertexCollection(vCollection);
  }

  var directorsRel = gm._relation(eDirectors, vTitleBasics, vNameBasics);
  g._extendEdgeDefinitions(directorsRel);

  var writersRel = gm._relation(eWriters, vTitleBasics, vNameBasics);
  g._extendEdgeDefinitions(writersRel);

  var titleAkasRel = gm._relation(eTitleAkas, vTitleBasics, vTitleAkas);
  g._extendEdgeDefinitions(titleAkasRel);

  var titleEpisodeRel = gm._relation(eTitleEpisode, vTitleBasics, vTitleEpisode);
  g._extendEdgeDefinitions(titleEpisodeRel);

  var titlePrincipalsRel = gm._relation(eTitlePrincipals, vTitleBasics, vNameBasics);
  g._extendEdgeDefinitions(titlePrincipalsRel);

  var titleRatingsRel = gm._relation(eTitleRatings, vTitleBasics, eTitleRatings);
  g._extendEdgeDefinitions(titleRatingsRel);

  g = gm._graph(gName);
  var genres = {};
  
  var toKey = function(d) {
    return d.toLowerCase().replace(" ", "-");
  };




  var storeTitleBasics = function(d) {
    g[vTitleBasics].save(d);
  };

  var storeTitleAkas = function(d) {
    g[vTitleAkas].save(d);
  };

  var storeNameBasics = function(d) {
    g[vNameBasics].save(d);
  };

  var storeTitleEpisode = function(d) {
    g[vTitleEpisode].save(d);
  };

  var storeTitleRatings = function(d) {
    g[vTitleRatings].save(d);
  };

  // eWriters, eDirectors, eTitleAkas, eTitleEpisode, eTitlePrincipals, eTitleRatings

  var storeWritersEdge = function(d) {
    g[eWriters].save(d);
  };

  var storeDirectorsEdge = function(d) {
    g[eDirectors].save(d);
  };

  var storeTitleAkasEdge = function(d) {
    g[eTitleRatings].save(d);
  };

  var storeTitleEpisodeEdge = function(d) {
    g[eTitleEpisode].save(d);
  };

  var storeTitlePrincipalsEdge = function(d) {
    g[eTitlePrincipals].save(d);
  };

  var storeTitleRatingsEdge = function(d) {
    g[eTitleRatings].save(d);
  };


  // var verticesCollection = db._collection(vName);
  // Leave index creation up to the user, who may prefer an ArangoSearch View
  //verticesCollection.ensureFulltextIndex("description", 3);
  //verticesCollection.ensureFulltextIndex("title", 3);
  //verticesCollection.ensureFulltextIndex("name", 3);
  //verticesCollection.ensureFulltextIndex("birthplace", 3);

  // vNameBasics, vTitleAkas, vTitleBasics, vTitleEpisode, vTitleRatings
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "name.basics.jsonl"), storeNameBasics);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.basics.jsonl"), storeTitleBasics);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.akas.jsonl"), storeTitleAkas);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.episode.jsonl"), storeTitleEpisode);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.ratings.jsonl"), storeTitleRatings);

  // eWriters, eDirectors, eTitleAkas, eTitleEpisode, eTitlePrincipals, eTitleRatings
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "writers.jsonl"), storeWritersEdge);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "directors.jsonl"), storeDirectorsEdge);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.akas_edges.jsonl"), storeTitleAkasEdge);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.episode_edges.jsonl"), storeTitleEpisodeEdge);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.principals_edges.jsonl"), storeTitlePrincipalsEdge);
  internal.processJsonFile(fs.join(__dirname, "Data", "Transformed", "Original", "title.ratings_edges.jsonl"), storeTitleRatingsEdge);
}());