#!/bin/bash

# This script is used to stop application
# echo "*******Stopped the cloudwatch service*********"
# sudo systemctl stop cloudwatch.service

echo "*******Kill Node Service*********"
lsof -ti tcp:3005 | xargs kill