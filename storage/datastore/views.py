from django.shortcuts import HttpResponse
from django.conf import settings

from django.views.generic.base import View

import json
from bson import json_util

reports = settings.DB.reports

def json_response(res, code=200):
    res = HttpResponse(res, content_type="application/json", )
    res.status_code = code
    return res



class AddReport(View):
    def get(self, request):
        
        return HttpResponse("""
        <form method="post" enctype="text/plain">
        <textarea name="asd">
    


[

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Wet Width",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":1.9,

			"unitofmeasurement":"m"		

		}

	},

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Wetted Perimeter",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":2.38,

			"unitofmeasurement":"m"		

		}

	},

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Gradient",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":4,

			"unitofmeasurement":"degree"		

		}

	},

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Impellor Time",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":[75,28,20,19.5,78],

			"unitofmeasurement":"seconds"	

		}

	},

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Wet (Water) Depth",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":[0.2,0.25,0.11,0.1,0.1,0.09,0.06,0.12,0.02,0.03],

			"unitofmeasurement":"m"	

		}

	},

	{

		"user_id" : "Group1",

		"group_id" : "Group1",

		"datetime" : "2012-01-01",

		"experiment_type" : "Stone Measurement",

		"location" : {

			"name":"Site1"        

		},

		"notes" : "",

		"data": {

			"measurement":[

				{

					"length":99,

					"width":71,

					"depth":8,

					"powershapeindex":4

				},

				{

					"length":102,

					"width":97,

					"depth":37,

					"powershapeindex":4

				},

				{

					"length":91,

					"width":34,

					"depth":5,

					"powershapeindex":3

				},

				{

					"length":56,

					"width":20,

					"depth":9,

					"powershapeindex":4

				},

				{

					"length":91,

					"width":52,

					"depth":19,

					"powershapeindex":4

				},

				{

					"length":52,

					"width":25,

					"depth":10,

					"powershapeindex":4

				},

				{

					"length":67,

					"width":31,

					"depth":10,

					"powershapeindex":4

				},

				{

					"length":69,

					"width":36,

					"depth":5,

					"powershapeindex":4

				},

				{

					"length":55,

					"width":35,

					"depth":13,

					"powershapeindex":4

				},

				{

					"length":34,

					"width":30,

					"depth":8,

					"powershapeindex":3

				},

				{

					"length":46,

					"width":35,

					"depth":7,

					"powershapeindex":5

				}

			]

		}

	}	

]



    
        </textarea>
        <input type="submit" /></form>
        
        
        """)
        
        
        res = json.dumps({
            'error' : """Use POST or PUT methods to add or update a report."""
        })
        return json_response(res, code=500)
    
    def validatereport(self, report):
        """
        TODO: put in some validation!
        
        Always returns True for now
        """
        # if 'data' not in report:
        #     return {"error":"No data found"}
        
        
        return False
    
    def addreport(self, report):
        errors = self.validatereport(report)
        if errors:
            return errors
        report = reports.save(report)
        saved = {
            'generation_time' : report.generation_time.isoformat(),
            'id' : str(report)
        }
        return saved

    def post(self, request):
        """
        Upload a new document.
        
        A document should be JSON formatted.
        
        If a list is provided, it's assumed to be a list of objects who are 
        documents.  Each document in the list is processed, validated and saved.
        
        For each document provided, the database ID is returned for that 
        document.  If a list is provided, the IDs will be returned in the same
        order as the documents were received.
        
        Basic sanity checking is done, and a JSON object with a list of errors 
        is returned if the response is not properly formed.
        
        The error will raise a HTTP 400 "Bad Request".
        
        Example error output:
        
        {
            'error' : "The document POSTed was not well formed",
            'fields' : [list of fields that were missing or contained errors],
        }
        
        
        
        """
        try:
            data = json.loads(request.raw_post_data[4:])
        except Exception, e:
            print e
            data = ""
        
        ids = []
        if isinstance(data, list):
            for report in data:
                ids.append(self.addreport(report))
        elif isinstance(data, dict):
            ids = self.addreport(data)
        else:
            return json_response(json.dumps({
                'error' : "expected JSON list or object"
            }), code="400")
        return json_response(json.dumps(ids))



def example(request):
    x = {
        'name' : 'Sym Roe',
        "_id" : '0',
    }
    
    
    posts = settings.DB.posts
    print type(posts.save(x))
    # 
    # p = posts.find_one({'_id' : '0'})
    # p['name'] = "Sym Roe"
    # p.save()
    
    # return HttpResponse(reports.find({'name' : { '$regex' : 'Roe', '$options': 'i' } }))
    return HttpResponse(reports.find())
    # return HttpResponse("<br>".join(dir(posts)))
    




class ViewReport(View):
    def get(self, request):

        results = reports.find()
        # results = reports.find({"experiment_type": "Stone Measurement"})
        # results = reports.find({"data.measurement.width": {'$gt' : 80}})

        results = json.dumps([result for result in results], default=json_util.default)
        
        return json_response(results)









