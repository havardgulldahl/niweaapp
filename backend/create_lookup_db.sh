#!/bin/bash

# (re)create a simpe sqlite db of (lat, lon) -> municipality mapping
# data collected by yr.no, partially crowdsourced.
# this script (C) havard@gulldahl.no 2010, AGPL licensed

# URL to online flat file, tab separated
FLATFILEURL="http://fil.nrk.no/yr/viktigestader/noreg.txt";

# Path to sqlite db
DBPATH="geolookup.db";

# Create db
[ -f "$DBPATH" ] && rm -f "$DBPATH";
sqlite3 "$DBPATH" "CREATE TABLE geolookup (ID INTEGER PRIMARY KEY, LAT FLOAT, LON FLOAT, MUNICIP INTEGER);";

OLDIFS="$IFS";
MYTAB="	";

# Get the data and push it into the db
# Columns: 
# Kommunenummer    Stadnamn    Prioritet   Stadtype nynorsk    Stadtype bokmål    Stadtype engelsk    Kommune Fylke   Lat Lon Høgd   Nynorsk Bokmål Engelsk
curl -s "$FLATFILEURL" | ( while IFS="$MYTAB" && read knr stnavn pri sttypeny sttypebo sttypeen komm fy lat lon ho ny bo en; do 
    echo "$lat $lon - $knr"; 
    sqlite3 "$DBPATH" "INSERT INTO geolookup VALUES ( NULL, $lat, $lon, $knr );"; 
done; )

IFS=$OLDIFS;

C=$(sqlite3 "$DBPATH" "SELECT COUNT(*) FROM geolookup");
echo "Finished. $C locations in database. "




