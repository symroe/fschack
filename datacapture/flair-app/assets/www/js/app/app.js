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
	
	$("#homePage").live('pageshow',function() {
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
		
		// TODO: Check each site list element in the datastore and see if it's 
		// complete. If so, colour it green and mark it with a check.
		
		// Bind to submits on the sync button
		$("#syncSubmit").live("tap", function () {
			$.ajax("http://192.168.2.23", {
				'data': JSON.stringify(getAllObservations()),
				'error': function () {
					alert("There was an error syncing your data. Please try again!");
				},
				'success' : function (data, textStatus, jqXHR) {
					alert("Data successfully synced! All local data will now be wiped!");
					//localStorage.clear();
				},
				'type' : "POST"
			});
		});
		
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Observation page
	///////////////////////////////////////////////////////////////////////////
	
	$("#observationPage").live('pageshow',function() {
		
		// Get the current site id
		var currentSite = window.localStorage.getItem("currentSite");
		var observation = getOrCreateSiteObservation("site" + currentSite.toString());
		// Update the page title
		$("#site-title").text("You are at: Site " + currentSite);
		
	    // Bind to next button clicks
		$("#depthSubmit").live("tap",function (e) {
			var observation = getCurrentObservation();
			var currentSite = window.localStorage.getItem("currentSite");
			// Save into localStorage
			observation[0].data.measurement = parseFloat($("#wet-width").val());
			observation[1].data.measurement = parseFloat($("#wetted-perimeter").val());
			observation[2].data.measurement = parseFloat($("#gradient").val());
			setObservation("site" + currentSite, observation);
	    });
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Depth page
	///////////////////////////////////////////////////////////////////////////	
	$("#depthPage").live('pageshow',function() {
		// total data points
		var totalDataPoints = 5.0
		
		// Get the current observation
		var observation = getCurrentObservation();
		
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
		
	    // Bind to next button click
	    $("#flowSubmit").live('tap', function (e) {
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
	    });
	});
	
	///////////////////////////////////////////////////////////////////////////
	// Flow page
	///////////////////////////////////////////////////////////////////////////	
	$("#flowPage").live('pageshow',function() {	
		// Bind to next button click
	    $("#finishSubmit").live('tap', function (e) {
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

/**
 * Get site observation from local storage or create a new one.
 * @param site_name - string site_name
 * @returns
 */
function getOrCreateSiteObservation(site_name) {
	var observation = JSON.parse(window.localStorage.getItem(site_name + ":observation"));
	console.log(observation);
	if(observation == null) {
		observation = siteObservation(site_name);
		setObservation(site_name, observation);
	}
	console.log(observation);
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
	console.log(site_name);
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
	
	console.log(observation);
	
	
	return observation;
}