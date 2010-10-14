<?php

/* local settings.

create a class, "localProxy", that extends tagiProxy to customize behavior:

class localProxy extends tagiProxy {

}

*/

$ppdom = false;

class localProxy extends tagiProxy {

    public function getFeedByCounty($countycode) {
        // http://no.wikipedia.org/wiki/ISO_3166-2:NO 
        /*
        {county:"01",dk:"Østfold",feed:"/ostfold/"}
        ^@,{county:"02",dk:"Akershus",feed:"/ostlandssendingen/"}
        ^@,{county:"03",dk:"Oslo",feed:"/ostlandssendingen/"}
        ^@,{county:"04",dk:"Hedmark",feed:"/hedmarkogoppland/"}
        ^@,{county:"05",dk:"Oppland",feed:"/hedmarkogoppland/"}
        ^@,{county:"06",dk:"Buskerud",feed:"/ostafjells/"}
        ^@,{county:"07",dk:"Vestfold",feed:"/ostafjells/"}
        ^@,{county:"08",dk:"Telemark",feed:"/ostafjells/"}
        ^@,{county:"09",dk:"Aust-Agder",feed:"/sorlandet/"}
        ^@,{county:"10",dk:"Vest-Agder",feed:"/sorlandet/"}
        ^@,{county:"11",dk:"Rogaland",feed:"/rogaland/"}
        ^@,{county:"12",dk:"Hordaland",feed:"/hordaland/"}
        ^@,{county:"14",dk:"Sogn og Fjordane",feed:"/sognogfjordane/"}
        ^@,{county:"15",dk:"Møre og Romsdal",feed:"/moreogromsdal/"}
        ^@,{county:"16",dk:"Trøndelag",feed:"/trondelag/"}
        ^@,{county:"17",dk:"Trøndelag",feed:"/trondelag/"}
        ^@,{county:"18",dk:"Nordland",feed:"/nordland/"}
        ^@,{county:"19",dk:"Troms",feed:"/nordnytt/"}
        ^@,{county:"20",dk:"Finnmark",feed:"/nordnytt/"}
        ^@,{county:"21",dk:"Svalbard",feed:"/nordnytt/"}
        ^@,{county:"22",dk:"Jan Mayen",feed:"/nordnytt/"}
        ^@,{county:"22",dk:"Kontinentalsokkelen",feed:"/ostlandssendingen/"}
        */

        switch($countycode) {
            case 1: return "ostfold";
            case 2: return "ostlandssendingen";
            case 3: return "ostlandssendingen";
            case 4: return "hedmarkogoppland";
            case 5: return "hedmarkogoppland";
            case 6: return "ostafjells";
            case 7: return "ostafjells";
            case 8: return "ostafjells";
            case 9: return "sorlandet";
            case 10: return "sorlandet";
            case 11: return "rogaland";
            case 12: return "hordaland";
            case 14: return "sognogfjordane";
            case 15: return "moreogromsdal";
            case 16: return "trondelag";
            case 17: return "trondelag";
            case 18: return "nordland";
            case 19: return "nordnytt";
            case 20: return "nordnytt";
            case 21: return "nordnytt";
            case 22: return "nordnytt";
            case 23: return "ostlandssendingen";
        }
    }

	protected function getRssById(){
        if($this->mode == "cat") {
            $rss = "http://www.nrk.no/toppsaker.rss";
            switch($this->id) {
                case 0: $rss = "http://www.nrk.no/nyheiter/siste.rss"; break;
                case 1: $rss = "http://www.nrk.no/norge/siste.rss"; break;
                case 2: $rss = "http://www.nrk.no/verden/toppsaker.rss"; break;
                case 3: $rss = "http://www.nrk.no/nyheiter/okonomi/toppsaker.rss"; break;
                case 4: $rss = "http://www.nrksport.no/toppsaker.rss"; break;
                case 5: $rss = "http://feeds.feedburner.com/nrkbeta?format=xml"; break;
                case 6: $rss = "http://www.nrk.no/kultur-og-underholdning/toppsaker.rss"; break;
                case 101: $rss = "http://www.nrk.no/ostfold/toppsaker.rss"; break;
                case 102: $rss = "http://www.nrk.no/ostlandssendingen/toppsaker.rss"; break;
                case 103: $rss = "http://www.nrk.no/ostlandssendingen/toppsaker.rss"; break;
                case 104: $rss = "http://www.nrk.no/hedmarkogoppland/toppsaker.rss"; break;
                case 105: $rss = "http://www.nrk.no/hedmarkogoppland/toppsaker.rss"; break;
                case 106: $rss = "http://www.nrk.no/ostafjells/toppsaker.rss"; break;
                case 107: $rss = "http://www.nrk.no/ostafjells/toppsaker.rss"; break;
                case 108: $rss = "http://www.nrk.no/ostafjells/toppsaker.rss"; break;
                case 109: $rss = "http://www.nrk.no/sorlandet/toppsaker.rss"; break;
                case 110: $rss = "http://www.nrk.no/sorlandet/toppsaker.rss"; break;
                case 111: $rss = "http://www.nrk.no/rogaland/toppsaker.rss"; break;
                case 112: $rss = "http://www.nrk.no/hordaland/toppsaker.rss"; break;
                case 114: $rss = "http://www.nrk.no/sognogfjordane/toppsaker.rss"; break;
                case 115: $rss = "http://www.nrk.no/moreogromsdal/toppsaker.rss"; break;
                case 116: $rss = "http://www.nrk.no/trondelag/toppsaker.rss"; break;
                case 117: $rss = "http://www.nrk.no/trondelag/toppsaker.rss"; break;
                case 118: $rss = "http://www.nrk.no/nordland/toppsaker.rss"; break;
                case 119: $rss = "http://www.nrk.no/nordnytt/toppsaker.rss"; break;
                case 120: $rss = "http://www.nrk.no/nordnytt/toppsaker.rss"; break;
                case 121: $rss = "http://www.nrk.no/nordnytt/toppsaker.rss"; break;
                case 122: $rss = "http://www.nrk.no/nordnytt/toppsaker.rss"; break;
                case 123: $rss = "http://www.nrk.no/ostlandssendingen/toppsaker.rss"; break;
            }
            $this->rss = simplexml_load_file($rss);
            $this->rss2Array();
        } elseif($this->mode == "story") {
            // pull metadata about the story from the cms
            $ppurl = "http://nrk.no/contentfile/xml/" . $this->id;
            // then parse it (ugghh)
            // $this->pp2Array($ppurl);
            header("Content-type: application/json; charset=utf-8");
            echo $this->pp2Json($ppurl);
            return;
            
        }
        header("Content-type: application/json; charset=utf-8");
        echo $this->array2Json();
    }

    protected function pp2Json($ppurl) {
        $xsl = new XSLTProcessor(); 
        $xsldoc = new DOMDocument(); 
        $xsldoc->load("pp2json.xsl"); 
        $xsl->importStyleSheet($xsldoc); 

        $opts = array(
            'http' => array(
                'user_agent' => 'PHP libxml agent',
            )
        );

        $context = stream_context_create($opts);
        libxml_set_streams_context($context);

        // request a file through HTTP
        $xmldoc = DOMDocument::load($ppurl);
        #$json["galleries"] = $this->galleries;
        $data = (array) simplexml_load_string(str_replace('xmlns="http://www.nrk.no/polopoly/export"', '', $xsl->transformToXML($xmldoc)));
        $story = array();
        foreach ($data as $k=>$v)  {
            switch($k) {
                case "text": 
                case "lead": 
                case "leadImage": 
                    $s = $v->children();
                    $story[$k] = $s->asXml(); break;
                default: 
                    $story[$k] = $v; break;
            }
        }
        // creating missing info so we don't have to do it client side
        if($story["published"] && !$story["publishedEpoch"]) $story["publishedEpoch"] = strtotime($story["published"]) . "000";
        if($story["updated"] && $story["updatedEpoch"]) $story["updatedEpoch"] = strtotime($story["updated"]) . "000";
        $jsn = array("id" => $this->id,
                     "story" => $story);
        return json_encode($jsn);

    }

    protected function pp2Array($ppurl) {
        //parse nrk metadata ("polopoly") and return something useful(!)
        global $ppdom;
        $ppdom = simplexml_load_file($ppurl);
        $this->ppdom = $ppdom;
        $children = $ppdom->children("http://www.nrk.no/polopoly/export");
        $ppdom->registerXPathNamespace("pp", "http://www.nrk.no/polopoly/export");
        $attrs = $ppdom->attributes();
		$textile = new Textile();
        $itm = array();
        $itm["id"] = (string) $attrs->id;
        $stitl = $ppdom->xpath("/pp:content/pp:components/pp:short-title");
        $itm["shorttitle"] = (string) $stitl;
        $titl = $ppdom->xpath("/pp:content/pp:components/pp:long-title/pp:text");
        $itm["title"] = (string) $titl[0];
        $itm["lead"] = $textile->TextileThis(strip_tags((string) $children->components->intro->text->p, "<b><i><a><em><strong>"));
        #$itm["text"] = $textile->TextileThis((string) $children->components->body1);
        $body = $children->components->body2->text->asXML();
        if(!$body) {
            $body = $children->components->body1->text->asXML();
        }

        var_dump($itm, $body);
        $t = str_replace("text>", "div>", $body);
        #$t = str_replace("<e ", "<a ", $t);
        #$t = preg_replace('#<e[^>]+\ id="ContentId\(([\.\d]+)\)"[^>]+title="([^"]+)"/>#', '<a href="http://nrk.no/${1}">${2}</a>', $t);
        $t = preg_replace_callback('#<e[^>]+\ id="ContentId\(([\.\d]+)\)"\ metaid="ContentId\(([\.\d]+)\)"\ title="([^"]+)"/>#', 
            create_function('$matches', 'return "<a href=\'http://nrk.no/$matches[1]\' title=\'$matches[3]\'>".ppref2title($matches[2])."</a>";'),
            $t);
        $itm["text"] = $textile->TextileThis(strip_tags($t, "<p><div><b><i><a><em><strong><img><table><th><td><tr><h1><h2><h3><h4><h5><ul><ol><li>"));
        $itm["link"] = (string) $attrs['www-url']; #$attrs->www-url;
        $itm["shorttitle"] = (string) $children->components['short-title'];
        #$itm["image_thumbnail"] = $children->
        array_push($this->items, $itm);
        

    }

	protected function rss2Array(){
        // our own rss reformatter, adapted to nrk
		$textile = new Textile();
        $i = 0;
		foreach($this->rss->channel->item as $item){
            ##if($i > 3) break;
			$itm = array();
		
			$itm["lead"] = trim((string) $item->description);
            // check if description is rich text (html)
            $isrichtext = false;
            foreach(array("<p>", "<a>", "<img>") as $el) {
                if(strpos($itm["lead"], $el) !== false) $isrichtext = true;
            }
			foreach(array("pubDate", "title", "link") as $k) {
				$itm[$k] = trim((string)$item->$k);
			}
            if($isrichtext) {
                try {
                    $html = simplexml_load_string("<root>" . $itm["lead"] . "</root>");
                    $img = $html->xpath("/root/p/a/img/@src");
                    $itm["image"] = join("http://nrk.no/", (string) $img[0]);
                    $desc = $html->xpath("/root/p");
                    $itm["lead"] = (string) $desc[1];
                    $flash = $html->xpath("/root/p/object");
                    #var_dump(sizeof($flash));
                    if(sizeof($flash) > 0) {
                        // this is a flash item. should probably skip it as long as iOS chokes on flash
                        continue;
                    }
                } catch(Exception $e) {}
            }
			$itm["shortlead"] = (strlen($itm["lead"]) < 105) ? $itm["lead"] : substr($itm["lead"], 0, 105) . "…";
			$itm['shorttitle'] = ( strlen($itm["title"] < 45) ) ? $itm["title"] : substr($itm["title"], 0, 42) . "…";
            try {
                $d = @date_parse_from_format('D, d M Y H:i:s O', $itm["pubDate"]);
                $itm["epoch"] = @mktime($d["year"], $d["month"], $d["day"], $d["hour"], $d["minute"], $d["second"]);
            } catch(Exception $e) {}
			
            if(!isset($itm['id'])) {
                $itm['id'] = basename($itm['link']);
            }
            if(isset($item->enclosure)) { // get image from feeds that have them
                $itm['image'] = @str_replace("f169w225", "f169w640", (string) $item->enclosure->attributes()->url);
            }
            // get full text body of item (feedburner does this for nrkbeta)
            $content = $item->children("http://purl.org/rss/1.0/modules/content/");
            if(sizeof($content) > 0) {
                $itm["text"] = (string) $content->encoded;
            }
			array_push($this->items, $itm);			
            $i++;
		}
	}
	
    /*
            <id>27270842</id> 
            <spitzmarke><![CDATA[ ]]></spitzmarke> 
            <title><![CDATA[Was Obama auf dem iPod hat ]]></title> 
            <lead><![CDATA[Der US-Präsident steht auf Klassiker von Stevie Wonder, Bob Dylan und den Rolling Stones. Seine Töchter allerdings wollen, dass er hippere Musik
hört. ]]></lead> 
            <text><![CDATA[Rund 2'000 Songs hat US-Präsident Barack Obama nach eigenen Angaben auf seinem iPod, vor allem Klassiker aus seiner Jugend wie Musik von Stevie
        ><img src="http://tagimob.wemfbox.ch/cgi-bin/ivw/CP/iApp/iphone" width="1" height="1" alt="" /> 
    <img src="http://newsnetz.wemfbox.ch/cgi-bin/ivw/CP/tagesanz/iApp/iphone" width="1" height="1" alt="" /> 
                                                     <img src="http://tagesanz.wemfbox.ch/cgi-bin/ivw/CP/iApp/iphone" width="1" height="1" alt="" /> ]]></text> 
            <link><![CDATA[http://tagesanzeiger.ch/digital/multimedia/Was-Obama-auf-dem-iPod-hat/story/27270842 ]]></link> 
            <pubDate><![CDATA[Tue, 28 Sep 2010 18:53:04 ]]></pubDate> 
            <autor><![CDATA[ ]]></autor> 
            <quelle><![CDATA[ ]]></quelle> 
            <image_thumbnail><![CDATA[http://files.newsnetz.ch/story/2/7/2/27270842/21/teaser_iapp.jpg?t=1285701843 ]]></image_thumbnail> 
            <image_thumbnail_ipad><![CDATA[http://files.newsnetz.ch/story/2/7/2/27270842/21/teaser_iapp.jpg?t=1285701843 ]]></image_thumbnail_ipad> 
            <sportbox><![CDATA[ ]]></sportbox> 
            <image_big><![CDATA[http://files.newsnetz.ch/story/2/7/2/27270842/21/topelement300.jpg?t=1285701843 ]]></image_big> 
            <image_big_ipad><![CDATA[http://files.newsnetz.ch/story/2/7/2/27270842/21/topelement.jpg?t=1285701843 ]]></image_big_ipad> 
            <regieid></regieid> 
            <topelement_image_legend><![CDATA[ ]]></topelement_image_legend> 
            <topelement_video_id>0</topelement_video_id> 
            <topelement_filename></topelement_filename> 
            <topelement_diashow_id>0</topelement_diashow_id> 
            <topelement_diashow_url></topelement_diashow_url> 
            <category><![CDATA[Digital ]]></category> 
            <category_xml><![CDATA[http:///mobile/feed.html?pw=Iatgof100&type=category&category_id=6 ]]></category_xml> 
            <mobiletv><![CDATA[]]></mobiletv> 
            
            
             
            <context_stories> 
                
                <context>              
            <context_id>20458083</context_id> 
            <context_title><![CDATA[Obama brüskiert Apple-Fangemeinde]]></context_title> 
            <context_url><![CDATA[http://tagesanzeiger.ch/mobile/feed.html?pw=Iatgof100&type=story&story_id=20458083]]></context_url> 
          </context> 
          
                <context>              
            <context_id>24581611</context_id> 
            <context_title><![CDATA[Bill Gates' Abneigung gegenüber dem iPad]]></context_title> 
            <context_url><![CDATA[http://tagesanzeiger.ch/mobile/feed.html?pw=Iatgof100&type=story&story_id=24581611]]></context_url> 
          </context> 
          
            </context_stories> 
            
            <recent_stories> 
                
                
                    
                    
                
            </recent_stories> 
        </item> 
        
    


    */
}
function ppref2title($metaid) {
    global $ppdom;
    #$res = $ppdom->xpath("/pp:content/pp:components/pp:long-title/pp:text");
    $res = $ppdom->xpath("//pp:body2/pp:component-references/pp:component-ref[@metaid='$metaid']/pp:sub-components/pp:sub-component[@group='linktitle']");
    $retun = "";
    while(list($el, $val) = each($res)) {
        var_dump($el, $val);
    }
    #var_dump($res);
    return $retun;
}
function unserialize_xml($input, $callback = null, $recurse = false)
/* bool/array unserialize_xml ( string $input [ , callback $callback ] )
 * Unserializes an XML string, returning a multi-dimensional associative array, optionally runs a callback on all non-array data
 * Returns false on all failure
 * Notes:
    * Root XML tags are stripped
    * Due to its recursive nature, unserialize_xml() will also support SimpleXMLElement objects and arrays as input
    * Uses simplexml_load_string() for XML parsing, see SimpleXML documentation for more info
 */
{
    // Get input, loading an xml string with simplexml if its the top level of recursion
    $data = ((!$recurse) && is_string($input))? simplexml_load_string($input): $input;
    // Convert SimpleXMLElements to array
    if ($data instanceof SimpleXMLElement) $data = (array) $data;
    // Recurse into arrays
    if (is_array($data)) foreach ($data as &$item) $item = unserialize_xml($item, $callback, true);
    // Run callback and return
    return (!is_array($data) && is_callable($callback))? call_user_func($callback, $data): $data;
}
?>

