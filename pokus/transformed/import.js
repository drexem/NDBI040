var fs=require("fs");
(function() {
  var console = require("console");
  var internal = require("internal");
  var db = internal.db;
 
  var vName = "imdb_vertices";
  var eName = "imdb_edges";
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

  var rel = gm._relation(eName, vName, vName);
  g._extendEdgeDefinitions(rel);

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

  var storeVertex = function(d) {
    if (d.releaseDate) {
      var datF = new Date(d.releaseDate).toISOString().slice(0, 4);
      datF = Math.floor(datF / 10) * 10;
      datS = datF + 10;
      var dat = datF + "-" + datS;
      d.released = dat;
    }
    g[vName].save(d);
    if (d.genre) {
      var gK = toKey(d.genre);
      if (!genres[gK]) {
        genres[gK] = true;
        g[vName].save({_key: gK, label: d.genre, type: "Genre"});
      }
      g[eName].save({
        _from: vName + "/" + gK,
        _to: vName + "/" + d._key,
        $label: "has_movie"
      });
    }
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

  var storeTitleAkasEdge = function(d) {
      g[eTitleAkas].save(d);
  };

  var storeEdge = function(d) {
    d._from = vName + "/" + d._from;
    d._to = vName + "/" + d._to;

    try {
      g[eName].save(d);
    } catch (e) {
      console.log("Failed:", d._from, "->", d._to);
    }
  };

  var verticesCollection = db._collection(vName);
  // Leave index creation up to the user, who may prefer an ArangoSearch View
  //verticesCollection.ensureFulltextIndex("description", 3);
  //verticesCollection.ensureFulltextIndex("title", 3);
  //verticesCollection.ensureFulltextIndex("name", 3);
  //verticesCollection.ensureFulltextIndex("birthplace", 3);

  internal.processJsonFile(fs.join(__dirname, "title.basics.jsonl"), storeTitleBasics);
  internal.processJsonFile(fs.join(__dirname, "title.akas.jsonl"), storeTitleAkas);
  internal.processJsonFile(fs.join(__dirname, "title.akas_edges.jsonl"), storeTitleAkasEdge);
}());