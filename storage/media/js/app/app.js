/**
 * Function called when jQuery Mobile is up and ready
 */
function initApp() {
	// Nothing to see here yet
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
}

/**
 * Function called when the whole app (jQuery Mobile + Phonegap) is up and ready
 * Everything happens here.
 */
function startApp() {
	
	/**************************************************************************
	 * 
	 * Page specific functionality
	 * 
	 *************************************************************************/
	
	///////////////////////////////////////////////////////////////////////////
	// Homepage
	///////////////////////////////////////////////////////////////////////////
	
	$("#homePage").live('pageshow pageinit',function() {
		// Clear current site in localStorage whenever this page is loaded,
		// should handle people going back to the homepage and choosing a new
		// site
		window.localStorage.removeItem("currentSite");
		
		// When a site is clicked, save it in the local storage so we can pass
		// it onto the next page - Android doesn't like ?x=y query-parameters
		// so we have to do this instead	
		$("a.siteLink").live("tap",function () {
			safelySetItem("currentSite", $(this).attr("data-site-id"));
		});			
		
		// Update the list to show any that are completed as such
		$("#siteList li").each(function () {
			// Check the relevant observation object exists and is completed
			var observation = getObservation("site" + $(this).children().children().children(".siteLink").attr("data-site-id"));
			if(observationIsComplete(observation)) {
				$(this).jqmData({'data-icon': 'check'});
				$(this).children().children().next().removeClass('ui-icon-plus').addClass('ui-icon-check');
				$(this).children().children().children(".siteLink").css({"color" : "green"});
			}
		});
		
		// Bind to submits on the sync button
		$("#syncSubmit").live("tap", function (e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			$.ajax({
				crossDomain:true,
				url: "http://192.168.2.117:8000/data/add/",
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify(getAllObservations()),
				error: function () {
					alert("There was an error syncing your data. Please try again!");
				},
				success : function (data, textStatus, jqXHR) {
					for(var i; i < data.length; i++) {
						if(data[i].error === null) {
							alert("There was an error syncing your data. Please try again! Error message: " + data[i].error);
						}
					}
					alert("Data successfully synced! You need to clear your data before starting a new session");
				},
				type : "POST"
			});
			return false;
		});
		
		// Bind to submits on the clear data button
		$("#clearSubmit").live("tap", function (e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			if(confirm("Are you really sure you want to delete ALL your data? This can't be undone!")) {
				window.localStorage.clear();
				$.mobile.changePage("#homePage", {'reloadPage':true});
			}
		});
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Visualisation page
	///////////////////////////////////////////////////////////////////////////
	
	$("#visualisationPage").live('pageshow',function() {
		for(var i = 1; i < 9; i++) {
			// Check the relevant observation object exists and is completed
			var observation = getObservation("site" + i.toString());
			if(observationIsComplete(observation)) {
				var wetWidth = observation[0].data.measurement;
				var depths = observation[4].data.measurement;
				var chartDivId = "site" + i.toString() + "Chart";
				createCrossSection(chartDivId, wetWidth, depths);
			}
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Observation page
	///////////////////////////////////////////////////////////////////////////
	
	$("#observationPage").live('pageshow',function() {
		
		// Get the current site id
		var currentSite = window.localStorage.getItem("currentSite");
		if(currentSite !== null) {
			var observation = getOrCreateSiteObservation("site" + currentSite.toString());
			
			// Update the page title
			$("#site-title").text("You are at: Site " + currentSite);
			
			// Setup validation
			$("#site-form").validate({
				rules: {
					wetwidth: "required",
					wettedperimeter: "required",
					gradient: "required"
				},
				submitHandler : function (form) {
					// We never 'submit' the form because there are trickeries to
					// jqueryMobile's events, see the 'tap' event bindings below
				},
				invalidHandler : function (form) {
					alert("Looks like you missed something, can you double check?");
				}
				
			});
			
		    // Bind to next button clicks
			$("#depthSubmit").live("tap",function (e) {
				$("#site-form").validate();
				if($("#site-form").valid()) {
					var observation = getCurrentObservation();
					var currentSite = window.localStorage.getItem("currentSite");
					// Save into localStorage
					observation[0].data.measurement = parseFloat($("#wet-width").val());
					observation[1].data.measurement = parseFloat($("#wetted-perimeter").val());
					observation[2].data.measurement = parseFloat($("#gradient").val());
					setObservation("site" + currentSite, observation);
				}
				else {
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;
				}
		    });
		}
		else {
			alert("Current Site not set - go back to the start and retry");
			$.mobile.changePage("#homePage");
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Depth page
	///////////////////////////////////////////////////////////////////////////	
	$("#depthPage").live('pageshow',function() {
		// total data points
		var totalDataPoints = 5.0
		
		// Get the current observation
		var observation = getCurrentObservation();
		
		if(observation !== null) {
			// Get the river width
			var totalWidth = parseFloat(observation[0].data.measurement);
			// TODO - check for NaN
		
			// Calculate the step size
			var stepSize = totalWidth/(totalDataPoints-1);
			
			// Update the measurement titles
			for(var i = 0; i < totalDataPoints; i++) {
				var distance = (stepSize * parseFloat(i)).toFixed(2);
				$("#depth-measurement-" + (i + 1).toString() + "-title").text("Distance to measure at: " + distance.toString() + "m");
			}
			
			// Setup validation
			$("#depth-form").validate({
				rules: {
					depthmeasurement1: "required",
					depthmeasurement2: "required",
					depthmeasurement3: "required",
					depthmeasurement4: "required",
					depthmeasurement5: "required",
				},
				submitHandler : function (form) {
					// We never 'submit' the form because there are trickeries to
					// jqueryMobile's events, see the 'tap' event bindings below
				},
				invalidHandler : function (form) {
					alert("Looks like you missed something, can you double check?");
				}
				
			});
			
		    // Bind to next button click
		    $("#flowSubmit").live('tap', function (e) {
		    	$("#depth-form").validate();
				if($("#depth-form").valid()) {
			    	var currentSite = window.localStorage.getItem("currentSite");
			    	var observation = getCurrentObservation();
			    	var depthMeasurements = [];
			    	// TODO - serialise form element properly
			    	for(var i = 0; i < 5; i++) {
			    		var elementId = "#depth-measurement" + (i + 1).toString();
				    	depthMeasurements[i] = parseFloat($(elementId).val());
			    	}
			    	observation[4].data.measurement = depthMeasurements;
			    	setObservation("site" + currentSite, observation);
				}
				else {
					e.stopImmediatePropagation();
					e.preventDefault();
					return false;
				}
		    });
		}
		else {
			alert("Error retrieving site data, please go back and put it in.");
			$.mobile.changePage("#observationPage");
		}
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Flow page
	///////////////////////////////////////////////////////////////////////////	
	$("#flowPage").live('pageshow',function() {	
		// Setup validation
		$("#flow-form").validate({
			rules: {
				flowmeasurement1: "required",
				flowmeasurement2: "required",
				flowmeasurement3: "required",
				flowmeasurement4: "required",
				flowhmeasurement5: "required",
			},
			submitHandler : function (form) {
				// We never 'submit' the form because there are trickeries to
				// jqueryMobile's events, see the 'tap' event bindings below
			},
			invalidHandler : function (form) {
				alert("Looks like you missed something, can you double check?");
			}
			
		});
		
		// Bind to next button click
	    $("#finishSubmit").live('tap', function (e) {
	    	$("#flow-form").validate();
			if($("#flow-form").valid()) {
		    	var currentSite = window.localStorage.getItem("currentSite");
		    	var observation = getCurrentObservation();
		    	var flowMeasurements = [];
		    	// TODO - serialise form element properly
		    	for(var i = 0; i < 5; i++) {
		    		var elementId = "#flow-measurement" + (i + 1).toString();
			    	flowMeasurements[i] = parseFloat($(elementId).val());
		    	}
		    	observation[3].data.measurement = flowMeasurements;
		    	setObservation("site" + currentSite, observation);
		    }
			else {
				e.stopImmediatePropagation();
				e.preventDefault();
				return false;
			}
	    });
	});
}

/**
 * Safely put something into the localStorage, catching exceptions with an alert
 * if they have a problem
 */
function safelySetItem(key, item) {
	try {
		window.localStorage.setItem(key, item);
	} catch (e) {
		if (e == QUOTA_EXCEEDED_ERR) {
			// data wasn't successfully saved due to quota exceed so 
			// throw an error
		 	alert('Local storage quota exceeded!');
		}
		else {
			// Something else happened
			alert("An error occurred saving your data, please retry! Error message: " + e.message);
		}
	}
}

/**
 * Save an observation object into local storage
 */
function setObservation(site_name, observation) {
	var observation_key = site_name + ":observation";
	safelySetItem(observation_key, JSON.stringify(observation));
}

/**
 * Get the current observation - assumes that you've got a currentSite set
 */
function getCurrentObservation() {
	var currentObservation = null;
	var currentSite = window.localStorage.getItem("currentSite");
	if(typeof currentSite !== 'undefined') {
		var site_name = "site" + currentSite;
		currentObservation = JSON.parse(window.localStorage.getItem(site_name + ":observation"));
	}
	return currentObservation;
}

function getObservation(site_name) {
	if(site_name !== null) {
		var json = window.localStorage.getItem(site_name + ":observation");
		if(json !== null) {
			return JSON.parse(json);
		}
	}
	else {
		return null;
	}
			
}

/**
 * Get site observation from local storage or create a new one.
 * @param site_name - string site_name
 * @returns
 */
function getOrCreateSiteObservation(site_name) {
	var observation = getObservation(site_name);
	if(observation == null) {
		observation = siteObservation(site_name);
		setObservation(site_name, observation);
	}
	return observation;
}

function getAllObservations() {
	var observations = [];
	for(var i = 1; i < 9; i++) {
		observations[i-1] = getOrCreateSiteObservation("site" + i.toString());
	}
	return observations;
}

/**
 * Function to generate a new, blank site observation
 * @param site_name - required string site_name
 * @param user_id - optional user_id string
 * @param group_id - optional group_id string
 * @param datetime - optional Javascript Date object
 * @returns
 */
function siteObservation(site_name, user_id, group_id, datetime) {
	// Optional parameters
	user_id = typeof user_id !== 'undefined' ? user_id : "Group1";
	group_id = typeof group_id !== 'undefined' ? group_id : "Group1";
	datetime_string = typeof datetime !== 'undefined' ? datetime.toJSON() : new Date().toJSON();

	// Defaults
	var default_float = 0.0;
	var default_string = "not_set";
	var default_int = 0;
	
	observation = [
	 	// Wet Width
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Wet Width",
			"location" : {
				"name" : site_name
			},
			"notes" : "",
			"data": {
				"measurement":default_float,
				"unitofmeasurement":"m"
			}
		},
		// Wetted Perimeter
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Wetted Perimeter",
			"location" : {
				"name" : site_name
			},
			"notes" : "",
			"data": {
				"measurement":default_float,
				"unitofmeasurement":"m"
			}
		},
		// Gradient
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Gradient",
			"location" : {
				"name" : site_name
			},
			"notes" : "",
			"data": {
				"measurement" : default_int,
				"unitofmeasurement":"degree"
			}
		},
		// Impellor Time
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Impellor Time",
			"location" : {
				"name":site_name        
			},
			"notes" : "",
			"data": {
				"measurement":[default_float,default_float,default_float,default_float,default_float,],
				"unitofmeasurement":"seconds"	
			}
		},
		// Wet (Water) Depth
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Wet (Water) Depth",
			"location" : {
				"name":site_name        
			},
			"notes" : "",
			"data": {
				"measurement":[default_float,default_float,default_float,default_float,default_float,],
				"unitofmeasurement":"m"	
			}
		},
		// Stone Measurement
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Stone Measurement",
			"location" : {
				"name" : site_name        
			},
			"notes" : "",
			"data": {
				"measurement":[
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},	
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					},
					{
						"length":default_int,
						"width":default_int,
						"depth":default_int,
						"powershapeindex":default_int
					}
				]
			}
		}
	];	
	
	return observation;
}

/**
 * Check an observation object is complete
 * @param observation - the object to check
 */
function observationIsComplete(observation) {
	if(typeof observation === 'undefined' || observation === null) {
		return false;
	}
	
	// Check single value fields
	// wetwidth, wettedperimeter, gradient
	if(observation[0].data.measurement === 0.0
			|| observation[1].data.measurement === 0.0
			|| observation[2].data.measurement === 0) {
		
		return false
	}
	
	// Check array value fields
	// impellor times
	for(var i = 0; i < 5; i++) {
		if(observation[3].data.measurement[i] === 0.0) {
			return false;
		}
	}
	// Check array value fields
	// depths
	for(var i = 0; i < 5; i++) {
		if(observation[4].data.measurement[i] === 0.0) {
			return false;
		}
	}
	
	return true;
}