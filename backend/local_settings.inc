<?php

/* local settings.

you can set the following variables:

$categoryfeed;
$storyfeed;
$categoryids;

and the following helper funcions
customfeedgetter($mode, $id)

						<option value="0">Front</option>
						<option value="1">Hos deg</option>
						<option value="2">Verden</option>
						<option value="3">Økonomi</option>
						<option value="4">Sport</option>
						<option value="5">Teknologi</option>
						<option value="6">Kultur</option>
						<option value="7">Super</option>
					</select>
*/

function customfeedgetter($mode, $id) 
{
    if($mode == "story") {
        return "./backend/art2rss.php?id=$id";
    }
    $rss = "http://www.nrk.no/nyheiter/siste.rss";
    switch($id) {
        case 0: $rss = "http://www.nrk.no/nyheiter/siste.rss"; break;
        case 1: $rss = "http://www.nrk.no/norge/siste.rss"; break;
        case 2: $rss = "http://www.nrk.no/verden/siste.rss"; break;
        case 3: $rss = "http://www.nrk.no/nyheiter/okonomi/siste.rss"; break;
        case 4: $rss = "http://www.nrksport.no/siste.rss"; break;
        case 5: $rss = "http://feeds.feedburner.com/nrkbeta?format=xml"; break;
        case 6: $rss = "http://www.nrk.no/kultur-og-underholdning/siste.rss"; break;
        #case 7: $rss = "http://www.nrksuper.no/siste.rss"; break;
    }
    return $rss;
}

class localProxy extends tagiProxy {
    
	protected function getRssById(){		
    var_dump("HEEEI");
		
        if($this->mode == "cat") {
            $rss = "http://www.nrk.no/nyheiter/siste.rss";
            switch($this->id) {
                case 0: $rss = "http://www.nrk.no/nyheiter/siste.rss"; break;
                case 1: $rss = "http://www.nrk.no/norge/siste.rss"; break;
                case 2: $rss = "http://www.nrk.no/verden/siste.rss"; break;
                case 3: $rss = "http://www.nrk.no/nyheiter/okonomi/siste.rss"; break;
                case 4: $rss = "http://www.nrksport.no/siste.rss"; break;
                case 5: $rss = "http://feeds.feedburner.com/nrkbeta?format=xml"; break;
                case 6: $rss = "http://www.nrk.no/kultur-og-underholdning/siste.rss"; break;
            }
            $this->rss = simplexml_load_file($rss);
            $this->rss2Array();
        } elseif($this->mode == "story") {
            $ppurl = "http://nrk.no/contentfile/xml/" . $this->id;
            $this->pp2Array($ppurl);
        }
        header("Content-type: application/json");
        echo $this->array2Json();
    }

    protected function pp2Array($ppurl) {
        $ppdom = simplexml_load_file($ppurl);
        $children = $ppdom->children("http://www.nrk.no/polopoly/export");
        $attrs = $ppdom->attributes("http://www.nrk.no/polopoly/export");
		$textile = new Textile();
        $itm = array();
        $itm["id"] = $attrs->id;
        $itm["title"] = $attrs->name;
        $itm["lead"] = $textile->TextileThis($children->components->intro->text->p);
        $itm["text"] = $textile->TextileThis($children->components->body1);
        $itm["link"] = $attrs->www-url;
        $itm["shorttitle"] = $children->components->short-title;
        #$itm["image_thumbnail"] = $children->
        array_push($this->items, $itm);
        

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

?>

