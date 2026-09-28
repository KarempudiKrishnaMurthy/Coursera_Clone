@echo off
if exist "C:\Users\91949\.m2\apache-maven-3.9.9\bin\mvn.cmd" (
    "C:\Users\91949\.m2\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
