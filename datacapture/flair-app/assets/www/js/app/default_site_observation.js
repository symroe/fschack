function siteObservation(site_name, user_id, group_id, datetime) {
	// Optional parameters
	user_id = if typeof user_id !== 'undefined' ? user_id : "Group1";
	group_id = if typeof group_id !== 'undefined' ? group_id : "Group1";
	datetime_string = if typeof datetime !== 'undefined' ? datetime.toJSON() : new Date().toJSON();

	// Defaults
	var default_float = 0.0;
	var default_string = "not_set";
	var default_int = 0;
	
	return [
	 	// Wet Width
		{
			"user_id" : user_id,
			"group_id" : group_id,
			"datetime" : datetime_string,
			"experiment_type" : "Wet Width",
			"location" : {
				"name" : site_id
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
				"name" : site_id
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
				"name" : site_id
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
				"name":site_id        
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
				"name":site_id        
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
				"name" : site_id        
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
					},
				]
			}
		}
	]
}