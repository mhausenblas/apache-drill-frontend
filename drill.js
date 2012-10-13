var drillstorage = window.localStorage;
var projectnum = 0;

// Drill frontend settings
var MAX_PROJECTS = 100;
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
		
		if (ptitle) {
			_store('project', project);
			$('#project-create-form').hide();
			listProjects();
			return true;
		}
		return false;
	});
	$('.project-entry .icon-trash').live('click', function(event){
		var response = confirm('Are you sure you want to delete this project?');
		var key = $(this).parent().parent().parent().attr('id')  // using @id of the project entry, with current element: div/h3/a/i
		if (response) {
			_remove(key);
			listProjects();
		}
	});
	$('#project-help').click(function(){
		$('#project-help-alert').fadeIn('slow');
		return false;
	});
	$('.add-ds').click(function(){
		alert('Not yet implemented ...');
	});
	
	

	$('#drill-query-execute').click(function(){
		executeQuery();
		return false;
	});

});

// init all forms (about, config, project lsit, etc.)
function initForms(){
	var dconfig = _read('drill_config');
	
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
	if(drillquery){
		$.ajax({
			type: "GET",
			url: backendURL +'/q/' + drillquery,
			dataType : "json",
			success: function(data){
				if(data) {
					var b = '<p class="text-info lead">Number of results: <strong>' + data.length + '</strong></p>';
					for(i in data) {
						b += '<div><p class="text-info">' + i + '</p><pre>' + JSON.stringify(data[i]) + '</pre></div>';
					}
					$('#drill-results').html(b);
				}
			},
			error:  function(msg){
				$('#drill-results').html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">×</button><h4>Something went wrong. Might check your configuration and/or query?</h4><div style="margin: 20px"><pre>' + JSON.stringify(msg) + '</pre></div></div>');
			} 
		});
	}
	else {
		alert("Need to provide a query value, try for example 'jane'");
	}
}


/////////////////////////////////////////////////////
// low-level storage API using localStorage 
// check http://caniuse.com/#feat=namevalue-storage
// if your browser supports it

function listProjects(){
	var i = 0;
	var buf = '';
	$('#project-list').html('');
	
	while(true){
		var key = 'drill_project_' + i;
		var project = _read(key);
		
		if (i > MAX_PROJECTS) return;
		
		if(project) {
			buf = '';
			buf = '<div class="project-entry" id="' + key + '"><h4>' + project.ptitle + ' <a class="pull-right btn btn-small" href="#"><i class="icon-trash"></i></a></h4>';
			buf += ' <p><small>Created on: ' +  project.timestamp + '</small></p>';
			buf += ' <div style="margin: 1em 0 4em 0;"><button class="pull-right btn btn-small btn-primary add-ds" type="button"><i class="icon-plus icon-white"></i> Add Data Source</button></div>';
			buf += '</div>';
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
				alert('Maximum number of projects reached');
				return;
			}
			key += 'project_' + projectnum;
		}
		else return; // can only store known entry categories
	}
	
	drillstorage.setItem(key, JSON.stringify(entry));
	return key;
}

function _remove(key){
	drillstorage.removeItem(key);
}

function _read(key){
	return JSON.parse(drillstorage.getItem(key));
}
