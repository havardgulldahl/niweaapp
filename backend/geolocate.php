<?php

/* Copyright (C) 2010 havard@gulldahl.no
Released under AGPL Licence
*/


/*

The geo objects that each function is expected to return looks like this:

{ "county": 19, // required field
  "countyname": "Troms",  // required field
  "postalcode": null, // optional field
  "name": null, // PLACE NAME optional field
  "municipality": null, // optional field
  "municipalitycode": null // optional field
}

*/

function countyNameByCode($code) {
    // http://no.wikipedia.org/wiki/ISO_3166-2:NO 
    switch($code) {
        case 1: return "Østfold";
        case 2: return "Akershus";
        case 3: return "Oslo";
        case 4: return "Hedmark";
        case 5: return "Oppland";
        case 6: return "Buskerud";
        case 7: return "Vestfold";
        case 8: return "Telemark";
        case 9: return "Aust-Agder";
        case 10: return "Vest-Agder";
        case 11: return "Rogaland";
        case 12: return "Hordaland";
        case 14: return "Sogn og Fjordane";
        case 15: return "Møre og Romsdal";
        case 16: return "Sør-Trøndelag";
        case 17: return "Nord-Trøndelag";
        case 18: return "Nordland";
        case 19: return "Troms";
        case 20: return "Finnmark";
        case 21: return "Svalbard";
        case 22: return "Jan Mayen";
        case 23: return "Kontinentalsokkelen";
    }
}

function geolookupByPostalcode($code) {
    $url = "http://nrk.no/api/geo/1.0/json/postalcode/" . $code;
    $data = @file_get_contents($url);
    if($data === false)
        return false;

    $obj = json_decode($data);
    if(is_int($obj->county)) {
        // clear up type bug. county is sometimes string, sometimes int
        $obj->county = (string) $obj->county;
    }
    if(strlen($obj->county) == 4 ) {
        // clear up naming bug
        // "county" is in fact "municipalitycode"
        // (the two first digits being the county code)
        $obj->municipalitycode = $obj->county;
        // get the proper county code
        $obj->county = (int) substr($obj->county, 0, 2);
    }
    if(!isset($obj->countyname)) {
        $obj->countyname = countyNameByCode($obj->county);
    }
    return $obj;
}

function haversine($lat1, $lon1, $lat2, $lon2) {
    #$earth_radius = 3960.00; # in miles
    $earth_radius = 6371.00; #in  km 
    $delta_lat = $lat2 - $lat1 ;
    $delta_lon = $lon2 - $lon1 ;
    $alpha    = $delta_lat/2;
    $beta     = $delta_lon/2;
    $a        = sin(deg2rad($alpha)) * sin(deg2rad($alpha)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin(deg2rad($beta)) * sin(deg2rad($beta)) ;
    $c        = asin(min(1, sqrt($a)));
    $distance = 2*$earth_radius * $c;
    $distance = round($distance, 4);
    return $distance;
}

function geolookupByLatLon($lat, $lon) {
    $db = mysql_connect("localhost", "havard", "zo1nk");
    mysql_select_db("nrktilaatapaa");
    //$sql = "SELECT * FROM geolookup WHERE (hp('intval', lat) = 60 AND php('intval', lon) = 7)";
    $sql = "SELECT * FROM geolookup WHERE FLOOR(lat) = ".intval($lat)." AND FLOOR(lon) = ".intval($lon);
    $result = mysql_query($sql);
    $closest = false;
    $dist = -1;
    while($r = mysql_fetch_assoc($result)) {
        #$rdist = haversine($lat, $r["LAT"], $lon, $r["LON"]);
        $rdist = haversine($lat, $lon, $r["LAT"], $r["LON"]);
        #printf("distance is %s to %s\n", $rdist, $r["MUNICIP"]);
        if($rdist < $dist || $dist == -1) {
            $dist = $rdist;
            $closest = $r;
        }
    }
    #var_dump($closest, $dist);
    $c = intval(substr($closest["MUNICIP"], 0, 2));
    return array("municipalitycode" => $closest["MUNICIP"],
                 "lat" => $lat,
                 "lon" => $lon,
                 "county" => $c,
                 "countyname" => countyNameByCode($c)
                 );


}

if(isset($_GET["postalcode"]) && is_numeric($_GET["postalcode"])) {
    header("Content-type: application/json; charset=utf-8");
    print json_encode(geolookupByPostalcode($_GET["postalcode"]));
} elseif(isset($_GET["lat"]) && isset($_GET["lon"])) {
    header("Content-type: application/json; charset=utf-8");
    print json_encode(geolookupByLatLon($_GET["lat"], $_GET["lon"]));

} elseif(isset($_GET["gps"])) {
    header("Content-type: application/json; charset=utf-8");
    $gps = json_decode($_GET["gps"]);
    print json_encode(geolookupByLatLon($gps->coords->latitude, $gps->coords->longitude));
}


?>
