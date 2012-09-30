var drillstorage = window.localStorage;
var projectnum = 0;

// Drill frontend settings
var MAX_PROJECTS = 100;

$(function(){
	listProjects();
	
    $('#config-dialog').modal({
        backdrop: true,
        keyboard: true,
		show: false
    });
    $('#config').click(function(){
        $('#config-dialog').modal('toggle');
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

	$('#drill-query-execute').click(function(){
		executeQuery();
		return false;
	});

});


// requires Drill Dummy server running on http://localhost:6996/
function executeQuery(){
	var drillquery = $('#drill-query').val();
	if(drillquery){
		$.get('http://localhost:6996/q/' + drillquery , function(data) {
		  $('#drill-results').html('<code>' + JSON.stringify(data) + '</code>');
		});
	}
	else {
		alert("Need to provide a query value, try for example 'jane'");
	}
}



// low-level storage API using localStorage http://caniuse.com/#feat=namevalue-storage

function listProjects(){
	var i = 0;
	$('#project-list').html('');
	
	while(true){
		var key = 'drill_project_' + i;
		var project = _read(key);
		
		if (i > MAX_PROJECTS) return;
		
		if(project) {
			$('#project-list').append('<div class="project-entry" id="' + key + '"><h3>' + project.ptitle + ' <a class="btn btn-small" href="#"><i class="icon-trash"></i></a></h3><p>Created on: ' +  project.timestamp + '</p></div>');
			projectnum = i;
		}
		
		i += 1;
	}
}

function _store(category, entry) {
	var key = 'drill_';
	if(category == 'project') {
		projectnum += 1;
		if (projectnum > MAX_PROJECTS) {
			alert('Maximum number of projects reached');
			return;
		}
		key += 'project_' + projectnum;
	} 
	else return; // can only store known entry categories
	
	drillstorage.setItem(key, JSON.stringify(entry));
	return key;
}

function _remove(key){
	drillstorage.removeItem(key);
}

function _read(key){
	return JSON.parse(drillstorage.getItem(key));
}
