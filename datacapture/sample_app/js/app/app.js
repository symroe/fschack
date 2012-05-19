/**
 * Function called when jQuery Mobile is up and ready
 */
function initApp() {
	// Nothing to see here yet
}

/**
 * Function called when the whole app (jQuery Mobile + Phonegap) is up and ready
 */
function startApp() {
	// Home page
	$("#homePage").live('pageinit',function() {
		
	});
	
	// Observation page
	$("#addPage").live('pageinit',function() {		
    // Bind to form submits
    $("#add-form").submit(function (e) {
      e.preventDefault();
      return false;
    });
		// Bind to clicks on the get location button
		$("#get-location-button").bind('vclick',function (e) {
			$("#get-location-button").html("Loading...");
			$("#get-location-button").button('refresh');
			navigator.geolocation.getCurrentPosition(
					// Success callback
					function (position) {
						$("#get-location-button").html("Refresh location");
						$("#get-location-button").button('refresh');
						$("#latitude").val(position.coords.latitude);
						$("#longitude").val(position.coords.longitude);
					},
					// Error callback
					function (error) {
						alert("Failed to get your location: " + error.message);
						$("#get-location-button").html("Retry location");
						$("#get-location-button").button('refresh');
					}, 
					// Options
					{ 
						maximumAge: 10000,
						timeout: 100000,
						enableHighAccuracy: true 
					}
				);
      e.stopImmediatePropogation();
			e.preventDefault();
			return false;
		});
  });
}