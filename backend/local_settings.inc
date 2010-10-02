<?php

/* local settings.

create a class, "localProxy", that extends tagiProxy to customize behavior:

class localProxy extends tagiProxy {

}

*/

$ppdom = false;

class localProxy extends tagiProxy {
    
	protected function getRssById(){
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
            // pull metadata about the story from the cms
            $ppurl = "http://nrk.no/contentfile/xml/" . $this->id;
            // then parse it (ugghh)
            $this->pp2Array($ppurl);
        }
        header("Content-type: application/json");
        echo $this->array2Json();
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
        #$itm["lead"] = $textile->TextileThis((string) $children->components->intro->text->p);
        $itm["lead"] = $textile->TextileThis(strip_tags((string) $children->components->intro->text->p, "<b><i><a><em><strong>"));
        #$itm["text"] = $textile->TextileThis((string) $children->components->body1);
        $t = str_replace("text>", "div>", $children->components->body2->text->asXML());
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
?>

