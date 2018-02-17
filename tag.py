#Python Program to get the last commit.
import datetime
import os
import sys
from subprocess import check_output

content = check_output(['git', 'rev-parse', '--short', 'HEAD'])  #This will store the output of the command to 'content'
wd = os.getcwd()
f=open("docs/image-version.md",'w')
f.write("---\nid: version\ntitle: Docker Image\n---\nVersion: " + content[:6] + "\n") #Commit is written to file 
now = datetime.datetime.now()
f.write(str("\n" + now.strftime("%c"))) #Date is written to file.
f.close()
