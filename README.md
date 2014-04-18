# Blob-Bog

Point it at a dir, when it runs it will gather up all the stuffs in that
directory into a json blob (recursively). 

Command line:

`blob dir` outputs a json with all the contents of the directory. 

`blob file file file file` reads the file into a json blob.

`blob dir -I javascript-regex` read all the files in the directory except for
files matching the javascript regex.

`blob dir -O javascript-regex` include only those files matching the javascript
regex.

