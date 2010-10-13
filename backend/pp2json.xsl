<?xml version="1.0" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:pp="http://www.nrk.no/polopoly/export">
  <xsl:output 
    method="xml"
    encoding="utf-8"
    media-type="text/json"
    omit-xml-declaration="yes"
    indent="no"/>

  <xsl:template match="/pp:content">
     {
        
        'title': "<xsl:value-of select='@name'/>",
        'id': "<xsl:value-of select='@id'/>",
        'uri': "<xsl:value-of select='@www-url'/>",
        'published': "<xsl:value-of select='pp:metadata/pp:nrk-meta/published-time'/>",
        'published-epoch': "<xsl:value-of select='pp:components/pp:published_time'/>",
        'updated': "<xsl:value-of select='pp:metadata/pp:nrk-meta/updated-time'/>",
        'updated-epoch': "<xsl:value-of select='pp:components/pp:updated_time'/>",
        'long-title': "<xsl:value-of select='pp:components/pp:long-title/pp:text'/>",
        'lead': "<xsl:apply-templates select='pp:components/pp:intro/pp:text'/>",
        'lead-image': <xsl:apply-templates
        select='pp:components/pp:intro/pp:component-references/pp:component-ref[@input-template="nrk.input.article.imagecrop"]'
         />,
        'text': <xsl:choose>
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
        </xsl:choose>
     };
  </xsl:template>

  <xsl:template match="pp:text">
    <xsl:copy-of select="child::*"/>
  </xsl:template>

  <xsl:template match="pp:component-ref">
    { 'name': "<xsl:value-of select='@name'/>",
      'id': "<xsl:value-of select='@id'/>",
      'title': "<xsl:value-of select='pp:sub-components/pp:sub-component[@name="value"]'/>"
    }
  </xsl:template>

  <xsl:template name="body">
    <xsl:param name="ref"></xsl:param>
    <div id="text">
    <xsl:apply-templates mode="body" select="$ref/pp:text/pp:*"/>
    </div>
  </xsl:template>

  <xsl:template mode="body" match="pp:h2">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template mode="body" match="pp:p">
    <p>
    <xsl:apply-templates select="pp:*" mode="body"/>
    </p>
  </xsl:template>

  <xsl:template mode="body" match="pp:strong">
    <strong><xsl:value-of select="."/></strong>
  </xsl:template>

  <xsl:template mode="body" match="pp:ul">
    <ul>
    <xsl:apply-templates select="pp:*" mode="body"/>
    </ul>
  </xsl:template>

  <xsl:template mode="body" match="pp:li">
    <li>
    <xsl:apply-templates select="child::*" mode="body"/>
    </li>
  </xsl:template>

  <xsl:template mode="body" match="pp:e">
   <xsl:variable name="id" select="substring-before(substring-after(@id, '('), ')')"/>
   <xsl:variable name="text" 
     select="//pp:component-references/pp:component-ref[@id='$id']/pp:sub-components/pp:sub-component[@group='name']/pp:text"/>
   <a> 
     <xsl:attribute name="title"><xsl:value-of select="$text"/></xsl:attribute>
     <xsl:attribute name="href"><xsl:value-of select="concat('http://nrk.no/', $id)"/></xsl:attribute>
     <xsl:value-of select="$text"/>
   </a>
  </xsl:template>

</xsl:stylesheet>

