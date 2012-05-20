import re
import string
pattern = re.compile('[\W_]+')

from django.shortcuts import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings

from django.views.generic.base import View

import json
from bson import json_util

from utils.views import json_response, ReportView

reports = settings.DB.reports

class ViewReport(View):
    def get(self, request):

        results = reports.find()
        # results = reports.find({"experiment_type": "Stone Measurement"})
        # results = reports.find({"data.measurement.width": {'$gt' : 80}})

        results = json.dumps([result for result in results], default=json_util.default)

        return json_response(results)




class HTMLFormview(ReportView):
    def get(self, request):
        
        assert 'group' in request.GET, "Group must be provided"
        
        query = self.buildQuery(request)
        all_reports = list(reports.find(query))
        report_dict = {}
        for report in all_reports:
            report_dict[re.sub(r'[\W_]+', "", report['experiment_type'].lower())] = report
        
        
        return render_to_response('reports/rivers/river_form.html', {
                    'report' : all_reports,
                    'report_dict' : report_dict
                }, context_instance=RequestContext(request))

class ScatterGraphReport(ReportView):
        
    def get(self, request):
        query = self.buildQuery(request)

        results = reports.find(query)
        # results = json.dumps(list(results), default=json_util.default)
        results = json.dumps([result['experiment_type'] for result in results], default=json_util.default)

        return json_response(results)









