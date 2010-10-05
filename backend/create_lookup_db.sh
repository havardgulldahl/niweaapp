#!/bin/bash

# (re)create a mysql db of (lat, lon) -> municipality mapping
# data collected by yr.no, they partially crowdsourced it
# this script (C) havard@gulldahl.no 2010, AGPL licensed

# URL to online flat file, tab separated
FLATFILEURL="http://fil.nrk.no/yr/viktigestader/noreg.txt";
# databasename
DBNAME="nrktilaatapaa";

#########

# look for cached file
B=$(basename "$FLATFILEURL");
[ -f "$B" ] && FLATFILEURL="file://$PWD/$B";

# Create db
mysql -h localhost "$DBNAME" -e "DROP TABLE IF EXISTS geolookup; CREATE TABLE geolookup (ID INTEGER PRIMARY KEY auto_increment, LAT FLOAT, LON FLOAT, MUNICIP INTEGER);";

OLDIFS="$IFS";
MYTAB="	";

# Get the data and push it into the db
# Columns: 
# Kommunenummer    Stadnamn    Prioritet   Stadtype nynorsk    Stadtype bokmål    Stadtype engelsk    Kommune Fylke   Lat Lon Høgd   Nynorsk Bokmål Engelsk
curl -s "$FLATFILEURL" | ( while IFS="$MYTAB" && read knr stnavn pri sttypeny sttypebo sttypeen komm fy lat lon ho ny bo en; do 
    [ "$knr" = "Kommunenummer" ] && continue; 
    echo "INSERT INTO geolookup VALUES ( NULL, $lat, $lon, $knr );"; 
done; ) | cat | mysql -h localhost "$DBNAME";

IFS=$OLDIFS;

C=$(mysql -h localhost "$DBNAME" -e "SELECT COUNT(*) FROM geolookup");
echo "Finished. $C locations in database. "




