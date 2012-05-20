from django.shortcuts import HttpResponse
from django.conf import settings

from django.views.generic.base import View

import json
from bson import json_util

from utils.views import json_response

reports = settings.DB.reports


class ViewReport(View):
    def get(self, request):

        results = reports.find()
        # results = reports.find({"experiment_type": "Stone Measurement"})
        # results = reports.find({"data.measurement.width": {'$gt' : 80}})

        results = json.dumps([result for result in results], default=json_util.default)

        return json_response(results)









