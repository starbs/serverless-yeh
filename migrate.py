#!/usr/bin/env python
import MySQLdb
from hashids import Hashids
import boto3
import sys
hashids = Hashids(salt='yeh', min_length=4)
client = boto3.client('s3')

db=MySQLdb.connect(host="localhost",user="root",passwd="",db=sys.argv[0])
c=db.cursor()
c.execute("""SELECT * FROM images""")
myresults = c.fetchall()

for data in myresults:
 print('ID:' + str(data[0]))
 try:
   hashid = hashids.encode(int(data[0]))
   print('Writing ' + hashid)
   if data[2] is not None:
     client.put_object(
       ACL='public-read',
       Bucket=sys.argv[1],
       Body=data[2],
       ContentType=str(data[3]),
       Key=hashid)
 except Exception as e:
   print(e)
