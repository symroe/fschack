from django.shortcuts import HttpResponse
from django.conf import settings

from django.views.generic.base import View

import json
from bson import json_util

from utils.views import json_response

reports = settings.DB.reports

class AddReport(View):
    def get(self, request):
        
        res = json.dumps({
            'error' : """Use POST to add or update a report."""
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
            data = json.loads(request.raw_post_data)
        except ValueError, e:
            return json_response(json.dumps({
                'error' : e
            }), code="500")
            
        
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
    




