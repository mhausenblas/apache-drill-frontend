var drillstorage = window.localStorage;
var projectnum = 0;

// Drill frontend settings
var MAX_PROJECTS = 100;
var MAX_DATASOURCES = 100;
var DRILL_BACKEND_URL = 'http://localhost:6996';
var backendURL = DRILL_BACKEND_URL;

$(function(){
	initForms();
	
	$('#config').click(function(){
		$('#config-dialog').modal('toggle');
		return false;
	});
	$('#config-form').submit(function() {
		var bURL = $('#config-drill-backend-url').val();
		var dconfig = { backendURL: bURL };
		
		if (bURL) {
			backendURL = bURL;
			_store('config', dconfig);
			return true;
		}
		return false;
	});
	$('#config-drill-reset').click(function(){
		var dconfig = { backendURL: DRILL_BACKEND_URL };
		backendURL = DRILL_BACKEND_URL;
		$('#config-drill-backend-url').val(backendURL);
		_store('config', dconfig);
		return false;
	});
	
	$('#about').click(function(){
		$('#about-dialog').modal('toggle');
		return false;
	});

	$('#tutorial').popover({
		title : 'Apache Drill Tutorial',
		content : 'We are working on a tutorial ...', 
		placement : 'bottom'
	});
	
	$('#help-dialog').modal({
        backdrop: false,
        keyboard: true,
		show: false
    });

    $('#project-create').click(function(){
		$('#project-title').val('');
		$('#project-create-form').fadeIn('slow');
		return false;
    });
    $('#project-create-cancel').click(function(){
		$('#project-create-form').hide();
		return false;
    });
	$('#project-create-form').submit(function() {
		var ptitle = $('#project-title').val();
		var project = { timestamp : new Date() , ptitle: ptitle };
		var newpid;
		
		if (ptitle) {
			newpid = _store('project', project);
			$('#current-project').html(newpid);
			$('#project-create-form').hide();
			listProjects();
			return true;
		}
		return false;
	});
	$('.project-entry .project-main').live('click', function(event){ // deal with project selection
		var key = $(this).parent().attr('id'); // using @id of the selected project entry, with current element: div/div
		$('#current-project').html(key); // ... remember it globaly ...
		listProjects(); // ... and highlight in project list as the active one
		return false;
	});
	$('.project-entry .icon-trash').live('click', function(event){ // deal with project deletion
		var response = confirm('Are you sure you want to delete this project and all data sources within it? Note that this action can not be undone ...');
		var key = $(this).parent().parent().parent().attr('id')  // using @id of the project entry, with current element: div/div/a/i
		var idx = 0;
		var ds;
		
		if (response) {
			// first, remove data sources in project, if they exist ...
			while(true){
				ds = _read('drill_ds_' + key + '_' + idx);
				if (idx > MAX_DATASOURCES) {
					break;
				} 
				else {
					if(ds){
						_remove('drill_ds_' + key + '_' + idx);
					}
					idx += 1;
				}
			}
			// ... and then remove the project itself ...
			_remove(key);
			listProjects();
		}
	});
	$('#project-help').click(function(){
		$('#project-help-alert').fadeIn('slow');
		return false;
	});

	$('.project-entry .add-ds').live('click', function(event){ // deal with data source addition to project
		var key = $(this).parent().parent().attr('id'); // using @id of the selected project entry, with current element: div/div/button
		$('#current-project').html(key); // ... to remember it globaly ...
		$('#datasource-id').val('');
		$('#datasource-add-form').fadeIn('slow');
		return false;
    });
    $('#datasource-add-cancel').click(function(){
		$('#datasource-add-form').hide();
		return false;
    });
	$('#datasource-add-form').submit(function() {
		var pid = $('#current-project').text();
		var dsid = $('#datasource-id').val();
		var ds = { timestamp : new Date(), pid: pid, dsid: dsid };
		
		if (dsid) {
			_store('ds', ds);
			$('#datasource-add-form').hide();
			listProjects();
			return true;
		}
		return false;
	});
	$('.project-entry .project-main .datasource-entry').live('click', function(event){ // deal with data source selection
		var key = $('.dsid', this).attr('id'); // using @id of the child span that has a dsid class on it ...
		$('#current-ds').html(key); // ... to remember it globaly ...
		listProjects(); // ... and to highlight in project list as the active one
		return false;
	});
	

	$('#drill-query-execute').click(function(){
		executeQuery();
		return false;
	});

});

// init all forms (about, config, project lsit, etc.)
function initForms(){
	var dconfig = _read('drill_config');
	
	//TODO: store last selected target data source
	if(dconfig){
		backendURL = dconfig.backendURL;
		$('#config-drill-backend-url').val(backendURL);
	}
	else {
		$('#config-drill-backend-url').val(backendURL);
	}
	listProjects();
	
	$('#config-dialog').modal({
		backdrop: true,
		keyboard: true,
		show: false
	});
	
	$('#about-dialog').modal({
		backdrop: true,
		keyboard: true,
		show: false
	});
	
}

// executes the query against a Dummy Drill back-end
function executeQuery(){
	var drillquery = $('#drill-query').val();
	var seldsid = $('#current-ds').text();
	var ds = _read(seldsid);
	
	$('#drill-results').html('');
	
	if(ds && drillquery){
		$.ajax({
			type: "GET",
			url: backendURL +'/q/' + ds.dsid + '/' + drillquery,
			dataType : "json",
			success: function(data){
				if(data) {
					// var b = '<p class="text-info lead">Number of results: <strong>' + data.length + '</strong></p>';
					// for(i in data) {
					// 	b += '<div><p class="text-info">' + i + '</p><pre>' + JSON.stringify(data[i]) + '</pre></div>';
					// }
					// $('#drill-results').html(b);
					$('#drill-results-meta').html('<p class="text-info lead">Number of results: <strong>' + data.length + '</strong></p>');
					$('#drill-results').renderJSON(data);
				}
			},
			error:  function(msg){
				$('#drill-results-meta').html('');
				$('#drill-results').html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">×</button><h4>Something went wrong. Might check your configuration and/or query?</h4><div style="margin: 20px"><pre>' + JSON.stringify(msg) + '</pre></div></div>');
			} 
		});
	}
	else {
		alert("Can't execute the query. Check if you've selected a data source to the right and if you've provided a query value, try for example 'name:jane'");
	}
}


/////////////////////////////////////////////////////
// low-level storage API using localStorage 
// check http://caniuse.com/#feat=namevalue-storage
// if your browser supports it

// lists all projects, the selected project and data source
function listProjects(){
	var i = 0; // project pointer
	var j = 0; // data source pointer
	var buf = '';
	var selpid = $('#current-project').text();
	var seldsid = $('#current-ds').text();
	
	$('#project-list').html('');
	
	while(true){
		var pid = 'drill_project_' + i;
		var project = _read(pid);
		
		if (i > MAX_PROJECTS) return; // respect limit
		
		if(project) {
			buf = '';
			
			if(selpid && (pid == selpid)) { // highligt selected project
				buf = '<div class="active project-entry" ';
				console.log('The active project is: ' + selpid);
			}
			else {
				buf = '<div class="project-entry" ';
			}
			buf += 'id="' + pid + '">';
			buf += '<div style="text-align: right"><button class="btn btn-small btn-primary add-ds" type="button" title="Add a new data source to this project ..."><i class="icon-plus icon-white"></i> Add Data Source</button> <a class="btn btn-small" href="#" title="Delete project ..."><i class="icon-trash"></i></a></div>';
			buf += '<div class="project-main"><h4>' + project.ptitle + '</h4>';
			buf += '<p class="project-meta">Created on: ' +  project.timestamp + '</p>';
			if(selpid && (pid == selpid)) { // show data sources of selected project
				buf += '<div><h5>Data Sources:</h5>';
				while(true){
					var dsid = 'drill_ds_drill_project_' + i + '_' + j;
					var ds = _read(dsid);
					
					if (j > MAX_DATASOURCES) break; // respect limit
					
					if(ds){
						if(seldsid && (dsid == seldsid)) { // highligt selected data source
							buf += '<div class="target datasource-entry btn-success"><i class="icon-file icon-white"></i> <span class="dsid" id="' + dsid +'">' + ds.dsid +'</span></div>';
							console.log('The target data source for the query is: ' + seldsid);
						}
						else {
							buf += '<div class="datasource-entry"><i class="icon-file"></i> <span class="dsid" id="' + dsid +'">' + ds.dsid +'</span></div>';
						}
					}
					j += 1;
				}
				if(_find_latest_ds_in(pid) == 0) buf += '<div class="alert alert-info">No data sources added so far! Use the "Add Data Source" button above to add some ...</div></div>';
				else buf += '</div>';
			}
			else {
				buf += '<p class="project-meta">Data Sources: ' +  _find_latest_ds_in(pid) + '</p>';
			}
			buf += '</div></div>';
			$('#project-list').append(buf);
			projectnum = i;
		}
		i += 1;
	}
}

function _store(category, entry) {
	var key = 'drill_';
	if(category == 'config') {
		key += 'config';
	}
	else {
		if(category == 'project') {
			projectnum += 1;
			if (projectnum > MAX_PROJECTS) {
				alert('Maximum number of projects reached!');
				return;
			}
			key += 'project_' + projectnum;
		}
		else {
			if(category == 'ds') {
				key += 'ds_' + entry.pid + '_' + (_find_latest_ds_in(entry.pid) + 1);
			}
			else return; // can only store known entry categories
		}
	}
	drillstorage.setItem(key, JSON.stringify(entry));
	return key;
}

function _find_latest_ds_in(pid){
	var idx = 0;
	var ds;
	var last_idx = idx;
	
	while(true){
		ds = _read('drill_ds_' + pid + '_' + idx);
		
		if (idx > MAX_DATASOURCES) {
			return last_idx;
		} 
		else {
			if(ds){
				last_idx = idx;
			}
			idx += 1;
		}
	}
}

function _remove(key){
	drillstorage.removeItem(key);
}

function _read(key){
	return JSON.parse(drillstorage.getItem(key));
}
