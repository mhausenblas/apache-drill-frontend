"""
Provides a dummy back-end for the Apache Drill front-end. 

Copyright (c) 2012 The Apache Software Foundation, Licensed under the Apache License, Version 2.0.

@author: Michael Hausenblas, http://mhausenblas.info/#i
@since: 2012-09-30
@status: init
"""

import sys, os, logging, datetime, random, json
from BaseHTTPServer import BaseHTTPRequestHandler
from pyes import *

# configuration
DEBUG = False
DS_DIR = 'ds'
ES_INTERFACE = '127.0.0.1:9200'
DRILL_INDEX = 'apache_drill'
BEER_PREF_TYPE = 'beer_pref'
DRILL_DUMMY_PORT = 6996

if DEBUG:
	FORMAT = '%(asctime)-0s %(levelname)s %(message)s [at line %(lineno)d]'
	logging.basicConfig(level=logging.DEBUG, format=FORMAT, datefmt='%Y-%m-%dT%I:%M:%S')
else:
	FORMAT = '%(asctime)-0s %(message)s'
	logging.basicConfig(level=logging.INFO, format=FORMAT, datefmt='%Y-%m-%dT%I:%M:%S')


class ApacheDrillDummyServer(BaseHTTPRequestHandler):

	def do_GET(self):
		# API calls
		if self.path.startswith('/q/'):
			self.serve_query(self.path.split('/')[-1])
		else:
			self.send_error(404,'File Not Found: %s' % self.path)
		return

	# changes the default behavour of logging everything - only in DEBUG mode
	def log_message(self, format, *args):
		if DEBUG:
			try:
				BaseHTTPRequestHandler.log_message(self, format, *args)
			except IOError:
				pass
		else:
			return

	# serves remote content via forwarding the request
	def serve_query(self, q):
		logging.debug('Quering ES with %s' %q)
		self.send_response(200)
		self.send_header('Content-type', 'application/json')
		self.send_header('Access-Control-Allow-Origin', '*') # enable CORS - http://enable-cors.org/#how
		self.end_headers()
		results = self.query(q)
		self.wfile.write(json.JSONEncoder().encode(results))

	def query(self, query_str):
		"""Executes a query against the existing Drill index in elasticsearch."""
		result_list = []
		connection = ES(ES_INTERFACE)
		connection.refresh()
		q = Search(StringQuery(query_str))
		results = connection.search(q, indices=[DRILL_INDEX])
		for r in results:
			result_list.append(r)
		return result_list

if __name__ == '__main__':
	try:
		from BaseHTTPServer import HTTPServer
		server = HTTPServer(('', DRILL_DUMMY_PORT), ApacheDrillDummyServer)
		logging.info('Apache Dummy Drill server started, use {Ctrl+C} to shut-down ...')
		logging.info("Using elasticsearch interface at %s" %(ES_INTERFACE))
		server.serve_forever()
	except Exception, e:
		logging.error(e)
		print 'Usage:\n $python dummy_drill.py VALUE'
		print 'Example:\n $python dummy_drill.py Jane'
		sys.exit(2)	
