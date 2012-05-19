from django.conf.urls.defaults import patterns, url

import views

urlpatterns = patterns('datastore.views',
    url(r'^$', 'example', name='example'),
    url(r'^add/', views.AddReport.as_view(), name='AddReport'),
)