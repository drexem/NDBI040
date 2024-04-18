# ArangoDB

Create an instance of arangoDB container:
```bash
docker run -e ARANGO_NO_AUTH=1 -d --name arangodb-instance -p 8529:8529 arangodb/arangodb arangod --server.endpoint tcp://0.0.0.0:8529\
```

```bash
docker cp pokus arangodb-instance:/pokus
```

```bash
python transform.py pokus pokus 
```

```bash
docker exec -it arangodb-instance sh
```

```bash
cd /IMDB
arangosh --javascript.execute ./import.js
```

```bash
arangoimport --file /pokus/transformed/title.akas.jsonl --type jsonl --server.password root --overwrite true --collection title.akas --create-collection true
```

```bash
arangoimport --file /pokus/transformed/title.basics.jsonl --type jsonl --server.password root --overwrite true --collection title.basics --create-collection true

```

```bash
arangoimport --file /pokus/transformed/title.akas_edges.jsonl --type jsonl  --server.password root --overwrite true --create-collection true --collection "title.akas_edges" --create-collection-type edge
```