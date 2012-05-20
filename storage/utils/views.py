
from django.shortcuts import HttpResponse

def json_response(res, code=200):
    res = HttpResponse(res, content_type="application/json", )
    res.status_code = code
    return res
