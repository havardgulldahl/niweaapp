<?xml version="1.0" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:pp="http://www.nrk.no/polopoly/export"
    exclude-result-prefixes="pp">
  <xsl:output 
    method="xml"
    encoding="utf-8"
    omit-xml-declaration="no"
    indent="yes"/>

  <xsl:strip-space elements="pp:div"/>

  <xsl:template match="/pp:content">
     <content>
        <title><xsl:value-of select='@name'/></title>
        <id><xsl:value-of select='@id'/></id>
        <uri><xsl:value-of select='@www-url'/></uri>
        <published><xsl:value-of select='pp:metadata/pp:nrk-meta/published-time'/></published>
        <publishedEpoch><xsl:value-of select='pp:components/pp:published_time'/></publishedEpoch>
        <updated><xsl:value-of select='pp:metadata/pp:nrk-meta/updated-time'/></updated>
        <updatedEpoch><xsl:value-of select='pp:components/pp:updated_time'/></updatedEpoch>
        <issued><xsl:value-of select='pp:metadata/pp:nrk-meta/issued-time'/></issued>
        <longTitle><xsl:value-of select='pp:components/pp:long-title/pp:text'/></longTitle>
        <department><xsl:value-of select='pp:department-references/pp:department/@name'/></department>
        <xsl:choose>
          <xsl:when test="pp:metadata/pp:contentid/@input-template = 'nrk.input.articleelement.picturegallery'">
            <template>picturegallery</template>
            <images>
              <div id="picturegallery">
                <div id="galleryimages">
                  <xsl:apply-templates 
                    select="pp:content-references/pp:content-reference[@input-template='nrk.input.article.imagecrop']"/>
                </div>
                <div id="gallerycontrol">
                  <button id="playpause">play</button>
                  <button id="prev">prev</button>
                  <button id="next">next</button>
                  <span id="gallerystatus"></span>
                </div>
              </div>
            </images>
          </xsl:when>
          <xsl:when test="pp:metadata/pp:contentid/@input-template = 'nrk.input.article.newsandsport'">
            <template>article</template>
            <lead><xsl:apply-templates select='pp:components/pp:intro/pp:text'/></lead>
            <leadImage><xsl:apply-templates
            select='pp:components/pp:intro/pp:component-references/pp:component-ref[@input-template="nrk.input.article.imagecrop"]'
             /></leadImage>
            <text>
                <div id="text">
                    <xsl:call-template name="body">
                    <xsl:with-param name="ref" select="pp:components/pp:body1"/>
                    </xsl:call-template>
                    <xsl:call-template name="body">
                    <xsl:with-param name="ref" select="pp:components/pp:body2"/>
                    </xsl:call-template>
                </div>
            </text>
          </xsl:when>
        </xsl:choose>
     </content>
  </xsl:template>

  <xsl:template match="pp:text">
    <xsl:copy-of select="child::*"/>
  </xsl:template>

  <xsl:template match="pp:content-reference">
       <xsl:variable name="cropdef"
           select="pp:sub-components/pp:sub-component[@group='cropdef']"/>
       <xsl:variable name="aspect"
           select="substring-before($cropdef, 'CropList')"/>
       <xsl:variable name="size"
           select="pp:sub-components/pp:sub-component[@name='SELECTED_LOGICAL_IMAGE_SIZE']"/>
       <xsl:variable name="width">
           <xsl:choose>
              <xsl:when test="$size = 'S'">w100</xsl:when> 
              <xsl:when test="$size = 'L'">w200</xsl:when> 
              <xsl:when test="$size = 'XL'">w450</xsl:when> 
              <xsl:when test="$size = 'XXL'">w900</xsl:when> 
              <xsl:otherwise>w200</xsl:otherwise> 
           </xsl:choose>
       </xsl:variable>
       <xsl:variable name="imgurl"
        select="concat('http://www.nrk.no/contentfile/imagecrop/', @id, '?cropid=', $aspect, $width)"/>
       <xsl:variable name="caption"
        select='pp:sub-components/pp:sub-component[@group="caption"]'/>
        <div>
          <xsl:attribute name="class">galleryimagebox size-<xsl:value-of select="$size"/>
          </xsl:attribute>
           <img alt="{@name}">
             <xsl:attribute name="class">galleryimage aspect-<xsl:value-of select="$aspect"/></xsl:attribute>
             <xsl:attribute name="id"><xsl:value-of select="generate-id()"/></xsl:attribute>
             <xsl:attribute name="src"><xsl:value-of select="$imgurl"/></xsl:attribute>
             <xsl:attribute name="data-size"><xsl:value-of select="$size"/></xsl:attribute>
             <xsl:attribute name="data-cropdef"><xsl:value-of select="$cropdef"/></xsl:attribute>
             <xsl:attribute name="data-ppid"><xsl:value-of select="@id"/></xsl:attribute>
           </img>
           <div class="bodyimage-caption">
            <xsl:if test="string-length($caption) > 0"><xsl:value-of select="$caption"/></xsl:if>
            <xsl:if test="string-length($caption) = 0"><xsl:value-of select="@name"/></xsl:if>
           </div>
       </div>
  </xsl:template>

  <xsl:template match="pp:component-ref">
       <xsl:variable name="imgurl"
        select="concat('http://www.nrk.no/contentfile/imagecrop/', @id, '?cropid=f169w640')"/>
       <xsl:variable name="caption"
        select='pp:sub-components/pp:sub-component[@group="caption"]'/>
        <div class="leadimg">
           <img alt="{@name}">
             <xsl:attribute name="src"><xsl:value-of select="$imgurl"/></xsl:attribute>
           </img>
           <div class="bodyimage-caption">
            <xsl:if test="string-length($caption) > 0"><xsl:value-of select="$caption"/></xsl:if>
            <xsl:if test="string-length($caption) = 0"><xsl:value-of select="@name"/></xsl:if>
           </div>
       </div>
  </xsl:template>

  <xsl:template name="body">
    <xsl:param name="ref"></xsl:param>
    <xsl:apply-templates mode="body" select="$ref/pp:text/pp:*"/>
  </xsl:template>

<xsl:template match="@*|node()" mode="body">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()" mode="body"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="text()" mode="remove-space">
    <xsl:value-of select="normalize-space(.)"/>
</xsl:template>

  <xsl:template mode="body" match="pp:e">
   <xsl:variable name="id" select="substring-before(substring-after(@id, '('), ')')"/>
   <xsl:variable name="ref" 
     select="//pp:component-references/pp:component-ref[@id=$id]"/>
   <xsl:choose>
     <!-- embed internal link --> 
     <xsl:when test="$ref[@input-template='nrk.input.article.newsandsport']">
        <a class="e"> 
         <xsl:attribute name="href"><xsl:value-of select="concat('http://nrk.no/', $id)"/></xsl:attribute>
           <xsl:choose>
             <xsl:when test="$ref/pp:sub-components/pp:sub-component[@group='linktitle']">
               <xsl:value-of
                 select="$ref/pp:sub-components/pp:sub-component[@group='linktitle']"/>
             </xsl:when>
             <xsl:otherwise>
               <xsl:value-of
                 select="$ref/pp:sub-components/pp:sub-component[@name='name']/pp:text"/>
             </xsl:otherwise>
           </xsl:choose>
        </a>
     </xsl:when>
     <!-- embed internal image --> 
     <xsl:when test="$ref[@input-template='nrk.input.article.imagecrop']">
       <xsl:variable name="cropdef"
           select="$ref/pp:sub-components/pp:sub-component[@group='cropdef']"/>
       <xsl:variable name="aspect"
           select="substring-before($cropdef, 'CropList')"/>
       <xsl:variable name="size"
           select="$ref/pp:sub-components/pp:sub-component[@name='SELECTED_LOGICAL_IMAGE_SIZE']"/>
       <xsl:variable name="width">
           <xsl:choose>
              <xsl:when test="$size = 'S'">w100</xsl:when> 
              <xsl:when test="$size = 'L'">w200</xsl:when> 
              <xsl:when test="$size = 'XL'">w450</xsl:when> 
              <xsl:when test="$size = 'XXL'">w900</xsl:when> 
              <xsl:otherwise>w200</xsl:otherwise> 
           </xsl:choose>
       </xsl:variable>
       <xsl:variable name="imgurl"
        select="concat('http://www.nrk.no/contentfile/imagecrop/', $id, '?cropid=', $aspect, $width)"/>
        <div>
          <xsl:attribute name="class">bodyimage align-<xsl:value-of 
            select="$ref/pp:sub-components/pp:sub-component[@group='align']"
            /> size-<xsl:value-of select="$ref/pp:sub-components/pp:sub-component[@name='SELECTED_LOGICAL_IMAGE_SIZE']"/>
            </xsl:attribute>
           <img class="e">
             <xsl:attribute name="alt">Bilde</xsl:attribute>
             <xsl:attribute name="src"><xsl:value-of select="$imgurl"/></xsl:attribute>
             <xsl:attribute name="data-size"><xsl:value-of 
                select="$ref/pp:sub-components/pp:sub-component[@name='SELECTED_LOGICAL_IMAGE_SIZE']"/></xsl:attribute>
             <xsl:attribute name="data-cropdef"><xsl:value-of 
                select="$ref/pp:sub-components/pp:sub-component[@group='cropdef']"/></xsl:attribute>
           </img>
           <div class="bodyimage-caption">
            <xsl:value-of select="$ref/pp:sub-components/pp:sub-component[@name='value']"/>
           </div>
       </div>
     </xsl:when>
     <!-- don't know how to parse these yet
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.quote']">
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.video']">
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.googlemap']">
     <xsl:when test="$ref[@input-template='nrk.input.article.magazine']">
     -->
     <!-- embed internal fact box --> 
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.factbox']">
      <div class="factbox">
          <div class="boxtitle"><strong><xsl:value-of select="$ref/@name"/></strong></div>
         <div class="factbox-contents">
            <xsl:apply-templates 
                mode="body"
                select="$ref/pp:sub-components/pp:sub-component[@group='polopoly.Content']/pp:text/child::*"/>
        </div>
      </div>
     </xsl:when>
     <!-- embed picture gallery --> 
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.picturegallery']">
        <div class="picturegallery">
          <div class="boxtitle"><strong><xsl:value-of select="$ref/@name"/></strong></div>
          <a href="$ref/@www-url" class="link-picturegallery" data-ppid="$ref/@id">
             <xsl:attribute name="href"><xsl:value-of select="$ref/@www-url"/></xsl:attribute>Vis bildeserien
           </a>
        </div>
     </xsl:when>
     <!-- embed external link --> 
     <xsl:when test="$ref[@input-template='nrk.content.externallinktype.http']">
       <a class="link-external">
         <xsl:attribute name="href"><xsl:value-of select="$ref/@www-url"/></xsl:attribute>
           <xsl:choose>
             <xsl:when test="$ref/pp:sub-components/pp:sub-component[@group='linktitle']">
               <xsl:value-of
                 select="$ref/pp:sub-components/pp:sub-component[@group='linktitle']"/>
             </xsl:when>
             <xsl:otherwise>
                 <xsl:value-of select="$ref/@name"/>
             </xsl:otherwise>
           </xsl:choose>
       </a>
     </xsl:when>
     <!-- embed table --> 
     <xsl:when test="$ref[@input-template='nrk.input.articleelement.table']">
      <table>
          <caption><xsl:value-of select="$ref/@name"/></caption>
          <xsl:apply-templates 
                mode="body"
                select="$ref/pp:sub-components/pp:sub-component[@group='polopoly.Content']/pp:text/pp:table/child::*"/>
      </table>
     </xsl:when>
   </xsl:choose>
  </xsl:template>

</xsl:stylesheet>

