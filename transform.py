import json
import sys
import os

def tsv_to_json_lines(tsv_file, json_lines_file, get_data_func):
    with open(tsv_file, 'r', encoding='utf-8') as tsvfile, open(json_lines_file, 'w', encoding='utf-8') as jsonfile:
        
        #dump header
        tsvfile.readline()

        line_number = 1

        # Read remaining lines and convert to JSON lines
        for line in tsvfile:
            fields = line.strip().split('\t')
            data = get_data_func(fields, line_number)
            if data is not None:
              if isinstance(data, list):              
                for document in data:                
                  json.dump(document, jsonfile)
                  jsonfile.write('\n')
              else:
                json.dump(data, jsonfile)
                jsonfile.write('\n')     

            line_number += 1




def map_name_basics(fields, line_number):
        return {
             '_key': fields[0],
              'name': fields[1] if fields[1] != "\\N" else None,
              'birthYear': int(fields[2]) if fields[2] != "\\N" else None,
              'deathYear': int(fields[3]) if fields[3] != "\\N" else None,
              'primaryProfession': fields[4] if fields[4] != "\\N" else None,
              'knownForTitles': fields[5] if fields[5] != "\\N" else None,
             }  

def map_title_akas(fields, line_number):  
        return {
             '_key': str(line_number),
              'ordering': int(fields[1]) if fields[1] != "\\N" else None,
              'title': fields[2] if fields[2] != "\\N" else None,
              'region': fields[3] if fields[3] != "\\N" else None,
              'language': fields[4] if fields[4] != "\\N" else None,
              'types': fields[5] if fields[5] != "\\N" else None,
              'attributes': fields[6] if fields[6] != "\\N" else None,
              'isOriginalTitle': bool(fields[7]) if fields[7] != "\\N" else None,
             }  


def map_title_basics(fields, line_number):
              return {
              '_key': fields[0],
              'titleType': fields[1] if fields[1] != "\\N" else None,
              'primaryTitle': fields[2] if fields[2] != "\\N" else None,
              'originalTitle': fields[3] if fields[3] != "\\N" else None,
              'isAdult': bool(fields[4]) if fields[4] != "\\N" else None,
              'startYear': int(fields[5]) if fields[5] != "\\N" else None,
              'endYear': int(fields[6]) if fields[6] != "\\N" else None,
              'runtimeMinutes': int(fields[7]) if fields[7] != "\\N" else None,
              'genres': fields[7] if fields[7] != "\\N" else None,
             }  

def map_title_akas_edge(fields, line_number):
              return {
              '_from': f"title.basics/{fields[0]}", 
              '_to': f"title.akas/{line_number}"
             }  

def map_directors_edge(fields, line_number):
              if fields[1] == "\\N":
                      return None
              
              director_ids = fields[1].split(",")  # Split director IDs separated by commas
    
              # Create an edge for each director ID
              edges = []
              for director_id in director_ids:
                  if director_id != "\\N":
                      edges.append({
                          '_from': f"title.basics/{fields[0]}", 
                          '_to': f"name.basics/{director_id}"  # Remove leading/trailing whitespace
                      })
              
              return edges

def map_writers_edge(fields, line_number):
              if fields[1] == "\\N":
                      return None
              
              writer_ids = fields[1].split(",")  
    

              edges = []
              for writer_id in writer_ids:
                  if writer_id != "\\N":
                      edges.append({
                          '_from': f"title.basics/{fields[0]}", 
                          '_to': f"name.basics/{writer_id}" 
                      })
              
              return edges

def map_title_episode(fields, line_number):
              return {
              '_key': fields[0],
              'seasonNumber': int(fields[2]) if fields[2] != "\\N" else None,
              'episodeNumber': int(fields[3]) if fields[3] != "\\N" else None
             }  

def map_title_episode_edge(fields, line_number):
              return {
              '_from': f"title.basics/{fields[1]}", 
              '_to': f"title.episode/{fields[0]}"
             }  

def map_title_principals_edge(fields, line_number):
              return {
              '_from': f"title.basics/{fields[0]}",
              '_to': f"name.basics/{fields[2]}",
              'ordering': int(fields[1]) if fields[1] != "\\N" else None,
              'category': fields[3] if fields[3] != "\\N" else None,
              'job': fields[4] if fields[4] != "\\N" else None,
              'characters': fields[5] if fields[5] != "\\N" else None
             }  

def map_title_ratings(fields, line_number):
              return {
              '_key': str(line_number),
              'averageRating': float(fields[1]) if fields[1] != "\\N" else None,
              'numVotes': int(fields[2]) if fields[2] != "\\N" else None
             }  
def map_title_ratings_edge(fields, line_number):
              return {
              '_from': f"title.basics/{fields[0]}", 
              '_to': f"title.ratings/{line_number}"
             } 


def main():
    if len(sys.argv) != 3:
        print("Usage: python script.py input_directory output_directory")
        return

    input_dir = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    map_functions = {
        'name.basics': [map_name_basics, 'name.basics'],
        'title.akas': [map_title_akas, 'title.akas'],
        'title.akas_edges': [map_title_akas_edge, 'title.akas'],
        'title.basics': [map_title_basics,'title.basics'],
        'directors': [map_directors_edge, 'title.crew'], 
        'writers': [map_writers_edge, 'title.crew'], 
        'title.episode': [map_title_episode, 'title.episode'],
        'title.episode_edges': [map_title_episode_edge, 'title.episode'],
        'title.principals_edges': [map_title_principals_edge,'title.principals'],
        'title.ratings': [map_title_ratings, 'title.ratings'],
        'title.ratings_edges': [map_title_ratings_edge, 'title.ratings']
    }

    for file_name, mf_if in map_functions.items():
        map_function,input_file = mf_if
        input_file = os.path.join(input_dir, f"{input_file}.tsv")
        output_file = os.path.join(output_dir, f"{file_name}.jsonl")
        tsv_to_json_lines(input_file, output_file, map_function)

if __name__ == "__main__":
    main()