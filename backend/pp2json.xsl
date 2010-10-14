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
     <article >
        
        <title><xsl:value-of select='@name'/></title>
        <id><xsl:value-of select='@id'/></id>
        <uri><xsl:value-of select='@www-url'/></uri>
        <published><xsl:value-of select='pp:metadata/pp:nrk-meta/published-time'/></published>
        <publishedEpoch><xsl:value-of select='pp:components/pp:published_time'/></publishedEpoch>
        <updated><xsl:value-of select='pp:metadata/pp:nrk-meta/updated-time'/></updated>
        <updatedEpoch><xsl:value-of select='pp:components/pp:updated_time'/></updatedEpoch>
        <longTitle><xsl:value-of select='pp:components/pp:long-title/pp:text'/></longTitle>
        <lead><xsl:apply-templates select='pp:components/pp:intro/pp:text'/></lead>
        <leadImage><xsl:apply-templates
        select='pp:components/pp:intro/pp:component-references/pp:component-ref[@input-template="nrk.input.article.imagecrop"]'
         /></leadImage>
        <text><xsl:choose>
          <xsl:when test="pp:components/pp:body1">
            <xsl:call-template name="body">
            <xsl:with-param name="ref" select="pp:components/pp:body1"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="pp:components/pp:body2">
            <xsl:call-template name="body">
            <xsl:with-param name="ref" select="pp:components/pp:body2"/>
            </xsl:call-template>
           </xsl:when>
        </xsl:choose></text>
     </article>
  </xsl:template>

  <xsl:template match="pp:text">
    <xsl:copy-of select="child::*"/>
  </xsl:template>

  <xsl:template match="pp:component-ref">
       <xsl:variable name="imgurl"
        select="concat('http://www.nrk.no/contentfile/imagecrop/', @id, '?cropid=f169w640')"/><div class="leadimage">
           <img alt="{@name}">
             <xsl:attribute name="src"><xsl:value-of select="$imgurl"/></xsl:attribute>
           </img>
           <div class="bodyimage-caption">
            <xsl:value-of select='pp:sub-components/pp:sub-component[@name="value"]'/>"
           </div>
       </div>
  </xsl:template>

  <xsl:template name="body">
    <xsl:param name="ref"></xsl:param>
    <div id="text">
    <xsl:apply-templates mode="body" select="$ref/pp:text/pp:*"/>
    </div>
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
              <xsl:otherwise>w200</xsl:otherwise> 
           </xsl:choose>
       </xsl:variable>
       <xsl:variable name="imgurl"
        select="concat('http://www.nrk.no/contentfile/imagecrop/', $id, '?cropid=', $aspect, $width)"/><div class="bodyimage">
           <img class="e">
             <xsl:attribute name="alt"></xsl:attribute>
             <xsl:attribute name="src"><xsl:value-of select="$imgurl"/></xsl:attribute>
             <xsl:attribute name="size"><xsl:value-of 
                select="$ref/pp:sub-components/pp:sub-component[@name='SELECTED_LOGICAL_IMAGE_SIZE']"/></xsl:attribute>
             <xsl:attribute name="align"><xsl:value-of 
                select="$ref/pp:sub-components/pp:sub-component[@group='align']"/></xsl:attribute>
             <xsl:attribute name="cropdef"><xsl:value-of 
                select="$ref/pp:sub-components/pp:sub-component[@group='cropdef']"/></xsl:attribute>
           </img>
           <div class="bodyimage-caption">
            <xsl:value-of select="$ref/pp:sub-components/pp:sub-component[@name='value']"/>
           </div>
       </div>
     </xsl:when>
   </xsl:choose>
  </xsl:template>

</xsl:stylesheet>

