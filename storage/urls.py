from django.conf.urls.defaults import *
from django.conf.urls.static import static
from django.views.generic import TemplateView

from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    (r'^data/', include('datastore.urls')),
    (r'^reports/rivers/', include('rivers.urls')),
    (r'', TemplateView.as_view(template_name="index.html")),
    # Uncomment the admin/doc line below to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/', include(admin.site.urls)),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
