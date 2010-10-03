<?php

function geolocateByPostalcode($code) {
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
        $obj->county = substr($obj->county, 0, 2);
    }
    return $obj;
}

if(isset($_GET["postalcode"]) && is_numeric($_GET["postalcode"])) {
    header("Content-type: application/json; charset=utf-8");
    print json_encode(geolocateByPostalcode($_GET["postalcode"]));
}


?>
