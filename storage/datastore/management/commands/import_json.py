import sys
import json
import glob

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

reports = settings.DB.reports

class Command(BaseCommand):
    
    def add_doc(self, doc):
        reports.save(doc)
    
    def handle(self, path, **options):
        in_path = "%s*.json" % path
        for f in glob.glob(in_path):
            data = json.loads(open(f).read())
            if isinstance(data, list):
                for doc in data:
                    self.add_doc(doc)
            else:
                self.add_doc(data)
        