from django.conf.urls.defaults import patterns, url

import views

urlpatterns = patterns('datastore.views',
    url(r'^example', views.ViewReport.as_view(), name='ViewReport'),
)

