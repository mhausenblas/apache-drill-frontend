# Dummy Drill

This is a Drill dummy-backend, used in the Apache Drill front-end, to simulate the real backend (as long as we don't have one).

## Usage

### 0. Launching elasticsearch

Got to the directory where you have [elasticsearch](http://www.elasticsearch.org/) installed and launch it:

	$ bin/elasticsearch -f

If you now `curl http://localhost:9200/` you should see:

	HTTP/1.1 200 OK
	Content-Length: 172
	Content-Type: application/json; charset=UTF-8

	{
		"name": "Blindspot", 
		"ok": true, 
		"status": 200, 
		"tagline": "You Know, for Search", 
		"version": {
			"number": "0.19.9", 
			"snapshot_build": false
		}
	}

### 1. Generate data sources

First, you want to generate a number of data sources (here: JSON documents with random information about beer-preferences of people). Let's create 200 data sources:

	 $ python gen_ds.py 200

The `gen_ds.py` script will generate as many data sources as you tell it to in a sub-directory of the current directory called `ds` and add each to the `apache_drill` index in elasticsearch.  If you now inspect the `ds` directory, you should see 200 JSON documents, each looking something like:

	{
		"beer": "Bud,Paulaner Hefe-Weizen,Bud",
		"id": 1,
		"name": "Jane Masters",
		"created": "2012-09-30T18:02:16Z"
	}
	
You might want to check if all is well (I'm using [httpie](https://github.com/jkbr/httpie) here but feel free to use `curl`):

	$ http http://localhost:9200/apache_drill/beer_pref/_search

... should yield something like:

	{
		took: 90,
		timed_out: false,
		_shards: {
			total: 5,
			successful: 5,
			failed: 0
		},
		hits: {
			total: 2,
			max_score: 1,
			hits: [{
				_index: "apache_drill",
				_type: "beer_pref",
				_id: "3JnyB2A7Tg2pvYgl_uZkeA",
				_score: 1,
				_source: {
					beer: "Paulaner Hefe-Weizen,Guinness,Guinness",
					id: 1,
					name: "Jane Jones",
					created: "2012-09-30T18:02:16Z"
				}
			}, {
				_index: "apache_drill",
				_type: "beer_pref",
				_id: "aWikIo0eR6qqJlYEyD9VOQ",
				_score: 1,
				_source: {
					beer: "Bud,Paulaner Hefe-Weizen,Bud",
					id: 2,
					name: "Jane Masters",
					created: "2012-09-30T18:02:16Z"
				}
			}]
		}
	}


### 2. Launching the back-end

	$ python dummy_drill.py

	2012-09-30T08:33:13 Apache Dummy Drill server started, use {Ctrl+C} to shut-down ...
	2012-09-30T08:33:13 Using elasticsearch interface at 127.0.0.1:9200
	
## Dependencies

* Python 2.7
* [elasticsearch](http://www.elasticsearch.org/)
* [pyes](https://github.com/aparo/pyes) - Python ElasticSearch

## License

This software is licensed under Apache 2.0 Software License. In case you have any questions, ask [Michael Hausenblas](http://mhausenblas.info/ "Michael Hausenblas").