'''
Python Program to get the last commit.
'''
import datetime
import os
import sys
from subprocess import check_output

# This will store the output of the command to 'content'
content = check_output(['git', 'rev-parse', '--short', 'HEAD'])  
wd = os.getcwd()
with open("docs/image-version.md",'w') as f:
    
    # Commit is written to file
    f.write("---\nid: version\ntitle: Docker Image\n---\nVersion: " + content[:6] + "\n") 
    now = datetime.datetime.now()
    # Date is written to file.
    f.write(str("\n" + now.strftime("%c"))) 
