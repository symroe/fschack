from django.views.generic.base import View
from django.shortcuts import HttpResponse

def json_response(res, code=200):
    res = HttpResponse(res, content_type="application/json", )
    res.status_code = code
    return res


class ReportView(View):
    def buildQuery(self, request):
        query = {}
        if 'group' in request.GET:
            query['group_id'] = request.GET['group']
        if 'location.name' in request.GET:
            query['location.name'] = request.GET['location.name']
        if 'experiment_type' in request.GET:
            query['experiment_type'] = request.GET['experiment_type']
        return query
    