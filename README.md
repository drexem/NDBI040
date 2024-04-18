# ArangoDB


Create an instance of arangoDB container:
**Port `8529` must be available!**
```bash
docker run -e ARANGO_NO_AUTH=1 -d --name arangodb-instance -p 8529:8529 arangodb/arangodb arangod --server.endpoint tcp://0.0.0.0:8529\
```


Run the transformation scripts using `Python`:
```bash
python transform.py Data/Raw/Original ApplicationData/Data/Transformed/Original 
```
Or smaller variant:
```bash
python transform.py Data/Raw/Smaller Application/Data/Transformed/Smaller 
```

Copy necessary files into the docker container:
```bash
docker cp Application arangodb-instance:/Application
```

Enter the bash inside the docker container:
```bash
docker exec -it arangodb-instance sh
```

Change to the directory of input scripts:
```bash
cd /Application
```

Import the transformed data into the database:
```bash
arangosh --javascript.execute ./import.js
```
Or smaller version:
```bash
arangosh --javascript.execute ./import_smaller.js
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