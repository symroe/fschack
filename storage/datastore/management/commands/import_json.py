import sys
import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

reports = settings.DB.reports

class Command(BaseCommand):
    
    def add_doc(self, doc):
        reports.save(doc)
    
    def handle(self, **options):
        infile = sys.stdin.read()
        data = json.loads(infile)
        if isinstance(data, list):
            for doc in data:
                self.add_doc(doc)
        else:
            self.add_doc(data)
        