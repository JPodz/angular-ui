define('views',[],{init:function($templateCache){  'use strict';

  $templateCache.put('ui/hamburger-menu/hamburger-menu.html',
    "<div class=jp-hamburger-menu><button class=jp-hamburger-menu__button><div class=jp-hamburger-menu__line></div><div class=jp-hamburger-menu__line></div><div class=jp-hamburger-menu__line></div></button></div>"
  );


  $templateCache.put('ui/video-player/video-player.html',
    "<videogular><vg-video vg-src=config.sources vg-native-controls=true></vg-video></videogular>"
  );
}});
/**
 * @license AngularJS v1.4.7
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {'use strict';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var $sanitizeMinErr = angular.$$minErr('$sanitize');

/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */

/*
 * HTML Parser By Misko Hevery (misko@hevery.com)
 * based on:  HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 */


/**
 * @ngdoc service
 * @name $sanitize
 * @kind function
 *
 * @description
 *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string, however, since our parser is more strict than a typical browser
 *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
 *   browser, won't make it through the sanitizer. The input may also contain SVG markup.
 *   The whitelist is configured using the functions `aHrefSanitizationWhitelist` and
 *   `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider `$compileProvider`}.
 *
 * @param {string} html HTML input.
 * @returns {string} Sanitized HTML.
 *
 * @example
   <example module="sanitizeExample" deps="angular-sanitize.js">
   <file name="index.html">
     <script>
         angular.module('sanitizeExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
     </script>
     <div ng-controller="ExampleController">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getInnerHtml()).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */
function $SanitizeProvider() {
  this.$get = ['$$sanitizeUri', function($$sanitizeUri) {
    return function(html) {
      var buf = [];
      htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
        return !/^unsafe/.test($$sanitizeUri(uri, isImage));
      }));
      return buf.join('');
    };
  }];
}

function sanitizeText(chars) {
  var buf = [];
  var writer = htmlSanitizeWriter(buf, angular.noop);
  writer.chars(chars);
  return buf.join('');
}


// Regular Expressions for parsing tags and attributes
var START_TAG_REGEXP =
       /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/,
  END_TAG_REGEXP = /^<\/\s*([\w:-]+)[^>]*>/,
  ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
  BEGIN_TAG_REGEXP = /^</,
  BEGING_END_TAGE_REGEXP = /^<\//,
  COMMENT_REGEXP = /<!--(.*?)-->/g,
  DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i,
  CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
  SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  // Match everything outside of normal chars and " (quote character)
  NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;


// Good source of info about elements and attributes
// http://dev.w3.org/html5/spec/Overview.html#semantics
// http://simon.html5.org/html-elements

// Safe Void Elements - HTML5
// http://dev.w3.org/html5/spec/Overview.html#void-elements
var voidElements = makeMap("area,br,col,hr,img,wbr");

// Elements that you can, intentionally, leave open (and which close themselves)
// http://dev.w3.org/html5/spec/Overview.html#optional-tags
var optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
    optionalEndTagInlineElements = makeMap("rp,rt"),
    optionalEndTagElements = angular.extend({},
                                            optionalEndTagInlineElements,
                                            optionalEndTagBlockElements);

// Safe Block Elements - HTML5
var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article," +
        "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
        "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul"));

// Inline Elements - HTML5
var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b," +
        "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
        "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));

// SVG Elements
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Elements
// Note: the elements animate,animateColor,animateMotion,animateTransform,set are intentionally omitted.
// They can potentially allow for arbitrary javascript to be executed. See #11290
var svgElements = makeMap("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph," +
        "hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline," +
        "radialGradient,rect,stop,svg,switch,text,title,tspan,use");

// Special Elements (can contain anything)
var specialElements = makeMap("script,style");

var validElements = angular.extend({},
                                   voidElements,
                                   blockElements,
                                   inlineElements,
                                   optionalEndTagElements,
                                   svgElements);

//Attributes that have href and hence need to be sanitized
var uriAttrs = makeMap("background,cite,href,longdesc,src,usemap,xlink:href");

var htmlAttrs = makeMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
    'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
    'valign,value,vspace,width');

// SVG attributes (without "id" and "name" attributes)
// https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Attributes
var svgAttrs = makeMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
    'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
    'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
    'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
    'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
    'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
    'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
    'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
    'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
    'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
    'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
    'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
    'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
    'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
    'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan', true);

var validAttrs = angular.extend({},
                                uriAttrs,
                                svgAttrs,
                                htmlAttrs);

function makeMap(str, lowercaseKeys) {
  var obj = {}, items = str.split(','), i;
  for (i = 0; i < items.length; i++) {
    obj[lowercaseKeys ? angular.lowercase(items[i]) : items[i]] = true;
  }
  return obj;
}


/**
 * @example
 * htmlParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * @param {string} html string
 * @param {object} handler
 */
function htmlParser(html, handler) {
  if (typeof html !== 'string') {
    if (html === null || typeof html === 'undefined') {
      html = '';
    } else {
      html = '' + html;
    }
  }
  var index, chars, match, stack = [], last = html, text;
  stack.last = function() { return stack[stack.length - 1]; };

  while (html) {
    text = '';
    chars = true;

    // Make sure we're not in a script or style element
    if (!stack.last() || !specialElements[stack.last()]) {

      // Comment
      if (html.indexOf("<!--") === 0) {
        // comments containing -- are not allowed unless they terminate the comment
        index = html.indexOf("--", 4);

        if (index >= 0 && html.lastIndexOf("-->", index) === index) {
          if (handler.comment) handler.comment(html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }
      // DOCTYPE
      } else if (DOCTYPE_REGEXP.test(html)) {
        match = html.match(DOCTYPE_REGEXP);

        if (match) {
          html = html.replace(match[0], '');
          chars = false;
        }
      // end tag
      } else if (BEGING_END_TAGE_REGEXP.test(html)) {
        match = html.match(END_TAG_REGEXP);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(END_TAG_REGEXP, parseEndTag);
          chars = false;
        }

      // start tag
      } else if (BEGIN_TAG_REGEXP.test(html)) {
        match = html.match(START_TAG_REGEXP);

        if (match) {
          // We only have a valid start-tag if there is a '>'.
          if (match[4]) {
            html = html.substring(match[0].length);
            match[0].replace(START_TAG_REGEXP, parseStartTag);
          }
          chars = false;
        } else {
          // no ending tag found --- this piece should be encoded as an entity.
          text += '<';
          html = html.substring(1);
        }
      }

      if (chars) {
        index = html.indexOf("<");

        text += index < 0 ? html : html.substring(0, index);
        html = index < 0 ? "" : html.substring(index);

        if (handler.chars) handler.chars(decodeEntities(text));
      }

    } else {
      // IE versions 9 and 10 do not understand the regex '[^]', so using a workaround with [\W\w].
      html = html.replace(new RegExp("([\\W\\w]*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'),
        function(all, text) {
          text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1");

          if (handler.chars) handler.chars(decodeEntities(text));

          return "";
      });

      parseEndTag("", stack.last());
    }

    if (html == last) {
      throw $sanitizeMinErr('badparse', "The sanitizer was unable to parse the following block " +
                                        "of html: {0}", html);
    }
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag(tag, tagName, rest, unary) {
    tagName = angular.lowercase(tagName);
    if (blockElements[tagName]) {
      while (stack.last() && inlineElements[stack.last()]) {
        parseEndTag("", stack.last());
      }
    }

    if (optionalEndTagElements[tagName] && stack.last() == tagName) {
      parseEndTag("", tagName);
    }

    unary = voidElements[tagName] || !!unary;

    if (!unary) {
      stack.push(tagName);
    }

    var attrs = {};

    rest.replace(ATTR_REGEXP,
      function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
        var value = doubleQuotedValue
          || singleQuotedValue
          || unquotedValue
          || '';

        attrs[name] = decodeEntities(value);
    });
    if (handler.start) handler.start(tagName, attrs, unary);
  }

  function parseEndTag(tag, tagName) {
    var pos = 0, i;
    tagName = angular.lowercase(tagName);
    if (tagName) {
      // Find the closest opened tag of the same type
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos] == tagName) break;
      }
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (i = stack.length - 1; i >= pos; i--)
        if (handler.end) handler.end(stack[i]);

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
}

var hiddenPre=document.createElement("pre");
/**
 * decodes all entities into regular string
 * @param value
 * @returns {string} A string with decoded entities.
 */
function decodeEntities(value) {
  if (!value) { return ''; }

  hiddenPre.innerHTML = value.replace(/</g,"&lt;");
  // innerText depends on styling as it doesn't display hidden elements.
  // Therefore, it's better to use textContent not to cause unnecessary reflows.
  return hiddenPre.textContent;
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
  return value.
    replace(/&/g, '&amp;').
    replace(SURROGATE_PAIR_REGEXP, function(value) {
      var hi = value.charCodeAt(0);
      var low = value.charCodeAt(1);
      return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
    }).
    replace(NON_ALPHANUMERIC_REGEXP, function(value) {
      return '&#' + value.charCodeAt(0) + ';';
    }).
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;');
}

/**
 * create an HTML/XML writer which writes to buffer
 * @param {Array} buf use buf.jain('') to get out sanitized html string
 * @returns {object} in the form of {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * }
 */
function htmlSanitizeWriter(buf, uriValidator) {
  var ignore = false;
  var out = angular.bind(buf, buf.push);
  return {
    start: function(tag, attrs, unary) {
      tag = angular.lowercase(tag);
      if (!ignore && specialElements[tag]) {
        ignore = tag;
      }
      if (!ignore && validElements[tag] === true) {
        out('<');
        out(tag);
        angular.forEach(attrs, function(value, key) {
          var lkey=angular.lowercase(key);
          var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
          if (validAttrs[lkey] === true &&
            (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
            out(' ');
            out(key);
            out('="');
            out(encodeEntities(value));
            out('"');
          }
        });
        out(unary ? '/>' : '>');
      }
    },
    end: function(tag) {
        tag = angular.lowercase(tag);
        if (!ignore && validElements[tag] === true) {
          out('</');
          out(tag);
          out('>');
        }
        if (tag == ignore) {
          ignore = false;
        }
      },
    chars: function(chars) {
        if (!ignore) {
          out(encodeEntities(chars));
        }
      }
  };
}


// define ngSanitize module and register $sanitize service
angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

/* global sanitizeText: false */

/**
 * @ngdoc filter
 * @name linky
 * @kind function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (_blank|_self|_parent|_top) or named frame to open links in.
 * @returns {string} Html-linkified text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="linkyExample" deps="angular-sanitize.js">
     <file name="index.html">
       <script>
         angular.module('linkyExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.snippet =
               'Pretty text with some links:\n'+
               'http://angularjs.org/,\n'+
               'mailto:us@somewhere.org,\n'+
               'another@somewhere.org,\n'+
               'and one more: ftp://127.0.0.1/.';
             $scope.snippetWithTarget = 'http://angularjs.org/';
           }]);
       </script>
       <div ng-controller="ExampleController">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Filter</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithTarget | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithTarget | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithTarget | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });
     </file>
   </example>
 */
angular.module('ngSanitize').filter('linky', ['$sanitize', function($sanitize) {
  var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
      MAILTO_REGEXP = /^mailto:/i;

  return function(text, target) {
    if (!text) return text;
    var match;
    var raw = text;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
      // We can not end in these as they are sometimes found at the end of the sentence
      url = match[0];
      // if we did not match ftp/http/www/mailto then assume mailto
      if (!match[2] && !match[4]) {
        url = (match[3] ? 'http://' : 'mailto:') + url;
      }
      i = match.index;
      addText(raw.substr(0, i));
      addLink(url, match[0].replace(MAILTO_REGEXP, ''));
      raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return $sanitize(html.join(''));

    function addText(text) {
      if (!text) {
        return;
      }
      html.push(sanitizeText(text));
    }

    function addLink(url, text) {
      html.push('<a ');
      if (angular.isDefined(target)) {
        html.push('target="',
                  target,
                  '" ');
      }
      html.push('href="',
                url.replace(/"/g, '&quot;'),
                '">');
      addText(text);
      html.push('</a>');
    }
  };
}]);


})(window, window.angular);

define("angular-sanitize", function(){});

/**
 * @license videogular v1.3.2 http://videogular.com
 * Two Fucking Developers http://twofuckingdevelopers.com
 * License: MIT
 */

angular.module("com.2fdevs.videogular", ["ngSanitize"])
    .run(
    ["$templateCache", function ($templateCache) {
        $templateCache.put("vg-templates/vg-media-video", "<video></video>");
        $templateCache.put("vg-templates/vg-media-audio", "<audio></audio>");

        // Support for browsers that doesn't have .bind()
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== 'function') {
                    // closest thing possible to the ECMAScript 5
                    // internal IsCallable function
                    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {
                    },
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP
                                ? this
                                : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }
    }]
);

/**
 * @ngdoc service
 * @name com.2fdevs.videogular.constant:VG_STATES
 *
 * @description
 * Possible video states:
 *  - VG_STATES.PLAY: "play"
 *  - VG_STATES.PAUSE: "pause"
 *  - VG_STATES.STOP: "stop"
 **/
/**
 * @ngdoc service
 * @name com.2fdevs.videogular.constant:VG_VOLUME_KEY
 *
 * @description localStorage key name for persistent video play volume on a domain.
 **/

angular.module("com.2fdevs.videogular")
    .constant("VG_STATES", {
        PLAY: "play",
        PAUSE: "pause",
        STOP: "stop"
    })
    .constant("VG_VOLUME_KEY", "videogularVolume");


/**
 * @ngdoc controller
 * @name com.2fdevs.videogular.controller:vgController
 * @description
 * Videogular controller.
 * This controller offers a public API:
 *
 * Methods
 * - play(): Plays media.
 * - pause(): Pause media.
 * - stop(): Stops media.
 * - playPause(): Toggles play and pause.
 * - seekTime(value, byPercent): Seeks to a specified time position. Param value must be an integer representing the target position in seconds or a percentage. By default seekTime seeks by seconds, if you want to seek by percentage just pass byPercent to true.
 * - setVolume(volume): Sets volume. Param volume must be an integer with a value between 0 and 1.
 * - setPlayback(playback): Sets playback. Param plaback must be an integer with a value between 0 and 2.
 * - setState(state): Sets a new state. Param state mus be an string with 'play', 'pause' or 'stop'. This method only changes the state of the player, but doesn't plays, pauses or stops the media file.
 * - toggleFullScreen(): Toggles between fullscreen and normal mode.
 * - updateTheme(css-url): Removes previous CSS theme and sets a new one.
 * - clearMedia(): Cleans the current media file.
 * - changeSource(array): Updates current media source. Param `array` must be an array of media source objects.
 * A media source is an object with two properties `src` and `type`. The `src` property must contains a trustful url resource.
 * <pre>{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"}</pre>
 *
 * Properties
 * - config: String with a url to JSON config file.
 * - isReady: Boolean value with current player initialization state.
 * - isBuffering: Boolean value to know if player is buffering media.
 * - isCompleted: Boolean value to know if current media file has been completed.
 * - isLive: Boolean value to know if current media file is a Live Streaming.
 * - playsInline: Boolean value to know if Videogular is using inline playing or not.
 * - nativeFullscreen: Boolean value to know if Videogular if fullscreen mode will use native mode or emulated mode.
 * - mediaElement: Reference to video/audio object.
 * - videogularElement: Reference to videogular tag.
 * - sources: Array with current sources.
 * - tracks: Array with current tracks.
 * - cuePoints: Object containing a list of timelines with cue points. Each property in the object represents a timeline, which is an Array of objects with the next definition:
 * <pre>{
 *    timeLapse:{
 *      start: 0,
 *      end: 10
 *    },
 *    onEnter: callback(currentTime, timeLapse, params),
 *    onLeave: callback(currentTime, timeLapse, params),
 *    onUpdate: callback(currentTime, timeLapse, params),
 *    onComplete: callback(currentTime, timeLapse, params),
 *    params: {
 *      // Custom object with desired structure and data
 *    }
 * }</pre>
 *
 *    * **timeLapse:** Object with start and end properties to define in seconds when this timeline is active.\n
 *    * **onEnter:** Callback function that will be called when progress reaches a cue point or being outside a cue point user seeks to a cue point manually.
 *    * **onLeave:** Callback function that will be called when user seeks and the new time doesn't reach to the timeLapse.start property.
 *    * **onUpdate:** Callback function that will be called when the progress is in the middle of timeLapse.start and timeLapse.end.
 *    * **onComplete:** Callback function that will be called when the progress is bigger than timeLapse.end.
 *    * **params:** Custom object with data to pass to the callbacks.
 *
 * - isFullScreen: Boolean value to know if we’re in fullscreen mode.
 * - currentState: String value with “play”, “pause” or “stop”.
 * - currentTime: Number value with current media time progress.
 * - totalTime: Number value with total media time.
 * - timeLeft: Number value with current media time left.
 * - volume: Number value with current volume between 0 and 1.
 * - playback: Number value with current playback between 0 and 2.
 * - bufferEnd: Number value with latest buffer point in milliseconds.
 * - buffered: Array of TimeRanges objects that represents current buffer state.
 *
 */
angular.module("com.2fdevs.videogular")
    .controller("vgController",
    ['$scope', '$window', 'vgConfigLoader', 'vgFullscreen', 'VG_UTILS', 'VG_STATES', 'VG_VOLUME_KEY', function ($scope, $window, vgConfigLoader, vgFullscreen, VG_UTILS, VG_STATES, VG_VOLUME_KEY) {
        var currentTheme = null;
        var isFullScreenPressed = false;
        var isMetaDataLoaded = false;

        // PUBLIC $API
        this.videogularElement = null;

        this.clearMedia = function () {
            this.mediaElement[0].src = '';
        };

        this.onRouteChange = function() {
            if (this.clearMediaOnNavigate === undefined || this.clearMediaOnNavigate === true) {
                this.clearMedia();
            }
        };

        this.onCanPlay = function (evt) {
            this.isBuffering = false;
            $scope.$apply($scope.vgCanPlay({$event: evt}));
        };

        this.onVideoReady = function () {
            this.isReady = true;
            this.autoPlay = $scope.vgAutoPlay;
            this.playsInline = $scope.vgPlaysInline;
            this.nativeFullscreen = $scope.vgNativeFullscreen || true;
            this.cuePoints = $scope.vgCuePoints;
            this.clearMediaOnNavigate = $scope.vgClearMediaOnNavigate || true;
            this.currentState = VG_STATES.STOP;

            isMetaDataLoaded = true;

            //Set media volume from localStorage if available
            if (VG_UTILS.supportsLocalStorage()) {
                //Default to 100% volume if local storage setting does not exist.
                this.setVolume(parseFloat($window.localStorage.getItem(VG_VOLUME_KEY) || '1'));
            }

            if ($scope.vgConfig) {
                vgConfigLoader.loadConfig($scope.vgConfig).then(
                    this.onLoadConfig.bind(this)
                );
            }
            else {
                $scope.vgPlayerReady({$API: this});
            }
        };

        this.onLoadConfig = function (config) {
            this.config = config;

            $scope.vgTheme = this.config.theme;
            $scope.vgAutoPlay = this.config.autoPlay;
            $scope.vgPlaysInline = this.config.playsInline;
            $scope.vgNativeFullscreen = this.config.nativeFullscreen;
            $scope.vgCuePoints = this.config.cuePoints;
            $scope.vgClearMediaOnNavigate = this.config.clearMediaOnNavigate;

            $scope.vgPlayerReady({$API: this});
        };

        this.onLoadMetaData = function (evt) {
            this.isBuffering = false;
            this.onUpdateTime(evt);
        };

        this.onProgress = function (event) {
            if (event.target.buffered.length) {
                this.buffered = event.target.buffered;
                this.bufferEnd = 1000 * event.target.buffered.end(event.target.buffered.length - 1);
            }

            $scope.$apply();
        };

        this.onUpdateTime = function (event) {
            this.currentTime = 1000 * event.target.currentTime;

            if (event.target.buffered.length) {
                this.buffered = event.target.buffered;
                this.bufferEnd = 1000 * event.target.buffered.end(event.target.buffered.length - 1);
            }

            if (event.target.duration != Infinity) {
                this.totalTime = 1000 * event.target.duration;
                this.timeLeft = 1000 * (event.target.duration - event.target.currentTime);
                this.isLive = false;
            }
            else {
                // It's a live streaming without and end
                this.isLive = true;
            }

            if (this.cuePoints) {
                this.checkCuePoints(event.target.currentTime);
            }

            $scope.vgUpdateTime({$currentTime: event.target.currentTime, $duration: event.target.duration});

            $scope.$apply();
        };

        this.checkCuePoints = function checkCuePoints(currentTime) {
            for (var tl in this.cuePoints) {
                for (var i = 0, l = this.cuePoints[tl].length; i < l; i++) {
                    var cp = this.cuePoints[tl][i];
                    var currentSecond = parseInt(currentTime, 10);
                    var start = parseInt(cp.timeLapse.start, 10);

                    // If timeLapse.end is not defined we set it as 1 second length
                    if (!cp.timeLapse.end) cp.timeLapse.end = cp.timeLapse.start + 1;

                    if (currentTime < cp.timeLapse.end) cp.$$isCompleted = false;

                    // Fire the onEnter event once reach to the cue point
                    if(!cp.$$isDirty && currentSecond === start && (typeof cp.onEnter == 'function')) {
                        cp.onEnter(currentTime, cp.timeLapse, cp.params);
                        cp.$$isDirty = true;
                    }

                    // Check if we've been reached to the cue point
                    if (currentTime > cp.timeLapse.start) {
                        // We're in the timelapse
                        if (currentTime < cp.timeLapse.end) {
                            // Trigger onUpdate each time we enter here
                            if (cp.onUpdate) cp.onUpdate(currentTime, cp.timeLapse, cp.params);

                            // Trigger onEnter if we enter on the cue point by manually seeking
                            if (!cp.$$isDirty && (typeof cp.onEnter === 'function')) {
                                cp.onEnter(currentTime, cp.timeLapse, cp.params);
                            }
                        }

                        // We've been passed the cue point
                        if (currentTime >= cp.timeLapse.end) {
                            if (cp.onComplete && !cp.$$isCompleted) {
                                cp.$$isCompleted = true;
                                cp.onComplete(currentTime, cp.timeLapse, cp.params);
                            }
                        }

                        cp.$$isDirty = true;
                    }
                    else {
                        if (cp.onLeave && cp.$$isDirty) {
                            cp.onLeave(currentTime, cp.timeLapse, cp.params);
                        }

                        cp.$$isDirty = false;
                    }
                }
            }
        };

        this.onPlay = function () {
            this.setState(VG_STATES.PLAY);
            $scope.$apply();
        };

        this.onPause = function () {
            if (this.mediaElement[0].currentTime == 0) {
                this.setState(VG_STATES.STOP);
            }
            else {
                this.setState(VG_STATES.PAUSE);
            }

            $scope.$apply();
        };

        this.onVolumeChange = function () {
            this.volume = this.mediaElement[0].volume;
            $scope.$apply();
        };

        this.onPlaybackChange = function () {
            this.playback = this.mediaElement[0].playbackRate;
            $scope.$apply();
        };

        this.onSeeking = function (event) {
            $scope.vgSeeking({$currentTime: event.target.currentTime, $duration: event.target.duration});
        };

        this.onSeeked = function (event) {
            $scope.vgSeeked({$currentTime: event.target.currentTime, $duration: event.target.duration});
        };

        this.seekTime = function (value, byPercent) {
            var second;
            if (byPercent) {
                second = value * this.mediaElement[0].duration / 100;
                this.mediaElement[0].currentTime = second;
            }
            else {
                second = value;
                this.mediaElement[0].currentTime = second;
            }

            this.currentTime = 1000 * second;
        };

        this.playPause = function () {
            if (this.mediaElement[0].paused) {
                this.play();
            }
            else {
                this.pause();
            }
        };

        this.setState = function (newState) {
            if (newState && newState != this.currentState) {
                $scope.vgUpdateState({$state: newState});

                this.currentState = newState;
            }

            return this.currentState;
        };

        this.play = function () {
            this.mediaElement[0].play();
            this.setState(VG_STATES.PLAY);
        };

        this.pause = function () {
            this.mediaElement[0].pause();
            this.setState(VG_STATES.PAUSE);
        };

        this.stop = function () {
            try {
                this.mediaElement[0].pause();
                this.mediaElement[0].currentTime = 0;

                this.currentTime = 0;
                this.buffered = [];
                this.bufferEnd = 0;
                this.setState(VG_STATES.STOP);
            }
            catch (e) {
                return e;
            }
        };

        this.toggleFullScreen = function () {
            // There is no native full screen support or we want to play inline
            if (!vgFullscreen.isAvailable || !this.nativeFullscreen) {
                if (this.isFullScreen) {
                    this.videogularElement.removeClass("fullscreen");
                    this.videogularElement.css("z-index", "auto");
                }
                else {
                    this.videogularElement.addClass("fullscreen");
                    this.videogularElement.css("z-index", VG_UTILS.getZIndex());
                }

                this.isFullScreen = !this.isFullScreen;
            }
            // Perform native full screen support
            else {
                if (this.isFullScreen) {
                    if (!VG_UTILS.isMobileDevice()) {
                        vgFullscreen.exit();
                    }
                }
                else {
                    // On mobile devices we should make fullscreen only the video object
                    if (VG_UTILS.isMobileDevice()) {
                        // On iOS we should check if user pressed before fullscreen button
                        // and also if metadata is loaded
                        if (VG_UTILS.isiOSDevice()) {
                            if (isMetaDataLoaded) {
                                this.enterElementInFullScreen(this.mediaElement[0]);
                            }
                            else {
                                isFullScreenPressed = true;
                                this.play();
                            }
                        }
                        else {
                            this.enterElementInFullScreen(this.mediaElement[0]);
                        }
                    }
                    else {
                        this.enterElementInFullScreen(this.videogularElement[0]);
                    }
                }
            }
        };

        this.enterElementInFullScreen = function (element) {
            vgFullscreen.request(element);
        };

        this.changeSource = function (newValue) {
            $scope.vgChangeSource({$source: newValue});
        };

        this.setVolume = function (newVolume) {
            newVolume = Math.max(Math.min(newVolume, 1), 0);
            $scope.vgUpdateVolume({$volume: newVolume});

            this.mediaElement[0].volume = newVolume;
            this.volume = newVolume;

            //Push volume updates to localStorage so that future instances resume volume
            if (VG_UTILS.supportsLocalStorage()) {
                //TODO: Improvement: concat key with current page or "video player id" to create separate stored volumes.
                $window.localStorage.setItem(VG_VOLUME_KEY, newVolume.toString());
            }
        };

        this.setPlayback = function (newPlayback) {
            $scope.vgUpdatePlayback({$playBack: newPlayback});

            this.mediaElement[0].playbackRate = newPlayback;
            this.playback = newPlayback;
        };

        this.updateTheme = function (value) {
            var links = document.getElementsByTagName("link");
            var i;
            var l;

            // Remove previous theme
            if (currentTheme) {
                for (i = 0, l = links.length; i < l; i++) {
                    if (links[i].outerHTML.indexOf(currentTheme) >= 0) {

                        links[i].parentNode.removeChild(links[i]);
                        break;
                    }
                }
            }

            if (value) {
                var headElem = angular.element(document).find("head");
                var exists = false;

                // Look if theme already exists
                for (i = 0, l = links.length; i < l; i++) {
                    exists = (links[i].outerHTML.indexOf(value) >= 0);
                    if (exists) break;
                }

                if (!exists) {
                    headElem.append("<link rel='stylesheet' href='" + value + "'>");
                }

                currentTheme = value;
            }
        };

        this.onStartBuffering = function (event) {
            this.isBuffering = true;
            $scope.$apply();
        };

        this.onStartPlaying = function (event) {
            this.isBuffering = false;
            $scope.$apply();
        };

        this.onComplete = function (event) {
            $scope.vgComplete();

            this.setState(VG_STATES.STOP);
            this.isCompleted = true;
            $scope.$apply();
        };

        this.onVideoError = function (event) {
            $scope.vgError({$event: event});
        };

        this.addListeners = function () {
            this.mediaElement[0].addEventListener("canplay", this.onCanPlay.bind(this), false);
            this.mediaElement[0].addEventListener("loadedmetadata", this.onLoadMetaData.bind(this), false);
            this.mediaElement[0].addEventListener("waiting", this.onStartBuffering.bind(this), false);
            this.mediaElement[0].addEventListener("ended", this.onComplete.bind(this), false);
            this.mediaElement[0].addEventListener("playing", this.onStartPlaying.bind(this), false);
            this.mediaElement[0].addEventListener("play", this.onPlay.bind(this), false);
            this.mediaElement[0].addEventListener("pause", this.onPause.bind(this), false);
            this.mediaElement[0].addEventListener("volumechange", this.onVolumeChange.bind(this), false);
            this.mediaElement[0].addEventListener("playbackchange", this.onPlaybackChange.bind(this), false);
            this.mediaElement[0].addEventListener("timeupdate", this.onUpdateTime.bind(this), false);
            this.mediaElement[0].addEventListener("progress", this.onProgress.bind(this), false);
            this.mediaElement[0].addEventListener("seeking", this.onSeeking.bind(this), false);
            this.mediaElement[0].addEventListener("seeked", this.onSeeked.bind(this), false);
            this.mediaElement[0].addEventListener("error", this.onVideoError.bind(this), false);
        };

        this.init = function () {
            this.isReady = false;
            this.isCompleted = false;
            this.buffered = [];
            this.bufferEnd = 0;
            this.currentTime = 0;
            this.totalTime = 0;
            this.timeLeft = 0;
            this.isLive = false;
            this.isFullScreen = false;
            this.playback = 1;
            this.isConfig = ($scope.vgConfig != undefined);

            if (vgFullscreen.isAvailable) {
                this.isFullScreen = vgFullscreen.isFullScreen();
            }

            this.updateTheme($scope.vgTheme);
            this.addBindings();

            if (vgFullscreen.isAvailable) {
                document.addEventListener(vgFullscreen.onchange, this.onFullScreenChange.bind(this));
            }
        };

        this.onUpdateTheme = function onUpdateTheme(newValue) {
            this.updateTheme(newValue);
        };

        this.onUpdateAutoPlay = function onUpdateAutoPlay(newValue) {
            if (newValue && !this.autoPlay) {
                this.autoPlay = newValue;
                this.play(this);
            }
        };

        this.onUpdatePlaysInline = function onUpdatePlaysInline(newValue) {
            this.playsInline = newValue;
        };

        this.onUpdateNativeFullscreen = function onUpdateNativeFullscreen(newValue) {
            if (newValue == undefined) newValue = true;

            this.nativeFullscreen = newValue;
        };

        this.onUpdateCuePoints = function onUpdateCuePoints(newValue) {
            this.cuePoints = newValue;
            this.checkCuePoints(this.currentTime);
        };

        this.onUpdateClearMediaOnNavigate = function onUpdateClearMediaOnNavigate(newValue) {
            this.clearMediaOnNavigate = newValue;
        };

        this.addBindings = function () {
            $scope.$watch("vgTheme", this.onUpdateTheme.bind(this));

            $scope.$watch("vgAutoPlay", this.onUpdateAutoPlay.bind(this));

            $scope.$watch("vgPlaysInline", this.onUpdatePlaysInline.bind(this));

            $scope.$watch("vgNativeFullscreen", this.onUpdateNativeFullscreen.bind(this));

            $scope.$watch("vgCuePoints", this.onUpdateCuePoints.bind(this));

            $scope.$watch("vgClearMediaOnNavigate", this.onUpdateClearMediaOnNavigate.bind(this));
        };

        this.onFullScreenChange = function (event) {
            this.isFullScreen = vgFullscreen.isFullScreen();
            $scope.$apply();
        };

        // Empty mediaElement on destroy to avoid that Chrome downloads video even when it's not present
        $scope.$on('$destroy', this.clearMedia.bind(this));

        // Empty mediaElement when router changes
        $scope.$on('$routeChangeStart', this.onRouteChange.bind(this));

        this.init();
    }]
);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:vgCrossorigin
 * @restrict A
 * @description
 * Optional directive for `vg-media` to add or remove a crossorigin policy to the video object. Possible values are: "anonymous" and "use-credentials".
 * This feature should be enabled if you want to have your subtitles or video files on a different domain than the video player. Additionally you need
 * to add CORS policies to your video and track files to your server to make it work.
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("vgCrossorigin",
    [function () {
        return {
            restrict: "A",
            require: "^videogular",
            link: {
                pre: function (scope, elem, attr, API) {
                    var crossorigin;

                    scope.setCrossorigin = function setCrossorigin(value) {
                        if (value) {
                            API.mediaElement.attr("crossorigin", value);
                        }
                        else {
                            API.mediaElement.removeAttr("crossorigin");
                        }
                    };

                    if (API.isConfig) {
                        scope.$watch(
                            function () {
                                return API.config;
                            },
                            function () {
                                if (API.config) {
                                    scope.setCrossorigin(API.config.crossorigin);
                                }
                            }
                        );
                    }
                    else {
                        scope.$watch(attr.vgCrossorigin, function (newValue, oldValue) {
                            if ((!crossorigin || newValue != oldValue) && newValue) {
                                crossorigin = newValue;
                                scope.setCrossorigin(crossorigin);
                            }
                            else {
                                scope.setCrossorigin();
                            }
                        });
                    }
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:vgLoop
 * @restrict A
 * @description
 * Optional directive for `vg-media` to add or remove loop in media files. Possible values are: "true" and "false"
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("vgLoop",
    [function () {
        return {
            restrict: "A",
            require: "^videogular",
            link: {
                pre: function (scope, elem, attr, API) {
                    var loop;

                    scope.setLoop = function setLoop(value) {
                        if (value) {
                            API.mediaElement.attr("loop", value);
                        }
                        else {
                            API.mediaElement.removeAttr("loop");
                        }
                    };

                    if (API.isConfig) {
                        scope.$watch(
                            function () {
                                return API.config;
                            },
                            function () {
                                if (API.config) {
                                    scope.setLoop(API.config.loop);
                                }
                            }
                        );
                    }
                    else {
                        scope.$watch(attr.vgLoop, function (newValue, oldValue) {
                            if ((!loop || newValue != oldValue) && newValue) {
                                loop = newValue;
                                scope.setLoop(loop);
                            }
                            else {
                                scope.setLoop();
                            }
                        });
                    }
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.direcitve:vgMedia
 * @restrict E
 * @description
 * Directive to add a source of videos or audios. This directive will create a &lt;video&gt; or &lt;audio&gt; tag and usually will be above plugin tags.
 *
 * @param {array} vgSrc Bindable array with a list of media sources. A media source is an object with two properties `src` and `type`. The `src` property must contains a trustful url resource.
 * @param {string} vgType String with "video" or "audio" values to set a <video> or <audio> tag inside <vg-media>.
 * <pre>
 * {
 *    src: $sce.trustAsResourceUrl("path/to/video/videogular.mp4"),
 *    type: "video/mp4"
 * }
 * </pre>
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("vgMedia",
    ["$timeout", "VG_UTILS", "VG_STATES", function ($timeout, VG_UTILS, VG_STATES) {
        return {
            restrict: "E",
            require: "^videogular",
            templateUrl: function (elem, attrs) {
                var vgType = attrs.vgType || "video";
                return attrs.vgTemplate || "vg-templates/vg-media-" + vgType;
            },
            scope: {
                vgSrc: "=?",
                vgType: "=?"
            },
            link: function (scope, elem, attrs, API) {
                var sources;

                // what type of media do we want? defaults to 'video'
                if (!attrs.vgType || attrs.vgType === "video") {
                    attrs.vgType = "video";
                }
                else {
                    attrs.vgType = "audio";
                }

                // FUNCTIONS
                scope.onChangeSource = function onChangeSource(newValue, oldValue) {
                    if ((!sources || newValue != oldValue) && newValue) {
                        sources = newValue;

                        if (API.currentState !== VG_STATES.PLAY) {
                            API.currentState = VG_STATES.STOP;
                        }

                        API.sources = sources;
                        scope.changeSource();
                    }
                };

                scope.changeSource = function changeSource() {
                    var canPlay = "";

                    // It's a cool browser
                    if (API.mediaElement[0].canPlayType) {
                        for (var i = 0, l = sources.length; i < l; i++) {
                            canPlay = API.mediaElement[0].canPlayType(sources[i].type);

                            if (canPlay == "maybe" || canPlay == "probably") {
                                API.mediaElement.attr("src", sources[i].src);
                                API.mediaElement.attr("type", sources[i].type);
                                //Trigger vgChangeSource($source) API callback in vgController
                                API.changeSource(sources[i]);
                                break;
                            }
                        }
                    }
                    // It's a crappy browser and it doesn't deserve any respect
                    else {
                        // Get H264 or the first one
                        API.mediaElement.attr("src", sources[0].src);
                        API.mediaElement.attr("type", sources[0].type);
                        //Trigger vgChangeSource($source) API callback in vgController
                        API.changeSource(sources[0]);
                    }

                    // Android 2.3 support: https://github.com/2fdevs/videogular/issues/187
                    if (VG_UTILS.isMobileDevice()) API.mediaElement[0].load();

                    $timeout(function () {
                        if (API.autoPlay && !VG_UTILS.isMobileDevice()) {
                            API.play();
                        }
                    });

                    if (canPlay == "") {
                        API.onVideoError();
                    }
                };

                // INIT
                API.mediaElement = elem.find(attrs.vgType);
                API.sources = scope.vgSrc;

                API.addListeners();
                API.onVideoReady();

                scope.$watch("vgSrc", scope.onChangeSource);
                scope.$watch(
                    function() {
                        return API.sources;
                    },
                    scope.onChangeSource
                );

                scope.$watch(
                    function() {
                        return API.playsInline;
                    },
                    function (newValue, oldValue) {
                        if (newValue) API.mediaElement.attr("webkit-playsinline", "");
                        else API.mediaElement.removeAttr("webkit-playsinline");
                    }
                );


                if (API.isConfig) {
                    scope.$watch(
                        function () {
                            return API.config;
                        },
                        function () {
                            if (API.config) {
                                scope.vgSrc = API.config.sources;
                            }
                        }
                    );
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:vgNativeControls
 * @restrict A
 * @description
 * Optional directive for `vg-media` to add or remove the native controls. Possible values are: "true" and "false"
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("vgNativeControls",
    [function () {
        return {
            restrict: "A",
            require: "^videogular",
            link: {
                pre: function (scope, elem, attr, API) {
                    var controls;

                    scope.setControls = function setControls(value) {
                        if (value) {
                            API.mediaElement.attr("controls", value);
                        }
                        else {
                            API.mediaElement.removeAttr("controls");
                        }
                    };

                    if (API.isConfig) {
                        scope.$watch(
                            function () {
                                return API.config;
                            },
                            function () {
                                if (API.config) {
                                    scope.setControls(API.config.controls);
                                }
                            }
                        );
                    }
                    else {
                        scope.$watch(attr.vgNativeControls, function (newValue, oldValue) {
                            if ((!controls || newValue != oldValue) && newValue) {
                                controls = newValue;
                                scope.setControls(controls);
                            }
                            else {
                                scope.setControls();
                            }
                        });
                    }
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:vgPreload
 * @restrict A
 * @description
 * Optional directive for `vg-media` to preload media files. Possible values are: "auto", "none" and "preload"
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("vgPreload",
    [function () {
        return {
            restrict: "A",
            require: "^videogular",
            link: {
                pre: function (scope, elem, attr, API) {
                    var preload;

                    scope.setPreload = function setPreload(value) {
                        if (value) {
                            API.mediaElement.attr("preload", value);
                        }
                        else {
                            API.mediaElement.removeAttr("preload");
                        }
                    };

                    if (API.isConfig) {
                        scope.$watch(
                            function () {
                                return API.config;
                            },
                            function () {
                                if (API.config) {
                                    scope.setPreload(API.config.preload);
                                }
                            }
                        );
                    }
                    else {
                        scope.$watch(attr.vgPreload, function (newValue, oldValue) {
                            if ((!preload || newValue != oldValue) && newValue) {
                                preload = newValue;
                                scope.setPreload(preload);
                            }
                            else {
                                scope.setPreload();
                            }
                        });
                    }
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:vgTracks
 * @restrict A
 * @description
 * Optional directive for `vg-media` to add a list of tracks.
 *
 * vgTracks Bindable array with a list of subtitles sources. A track source is an object with five properties: src, kind, srclang, label and default.
 * <pre>
 * {
 *    src: "assets/subs/pale-blue-dot.vtt",
 *    kind: "subtitles",
 *    srclang: "en",
 *    label: "English",
 *    default: "true/false"
 * }
 * </pre>
 */

angular.module("com.2fdevs.videogular")
    .directive("vgTracks",
    [function () {
        return {
            restrict: "A",
            require: "^videogular",
            link: {
                pre: function (scope, elem, attr, API) {
                    var isMetaDataLoaded = false;
                    var tracks;
                    var i;
                    var l;

                    scope.onLoadMetaData = function() {
                        isMetaDataLoaded = true;
                        scope.updateTracks();
                    };

                    scope.updateTracks = function() {
                        // Remove previous tracks
                        var oldTracks = API.mediaElement.children();

                        for (i = 0, l = oldTracks.length; i < l; i++) {
                            if (oldTracks[i].remove) {
                                oldTracks[i].remove();
                            }
                        }

                        // Add new tracks
                        if (tracks) {
                            for (i = 0, l = tracks.length; i < l; i++) {
                                var track = document.createElement('track');
                                for (var prop in tracks[i]) {
                                    track[prop] = tracks[i][prop];
                                }

                                track.addEventListener('load', scope.onLoadTrack.bind(scope, track));

                                API.mediaElement[0].appendChild(track);
                            }
                        }
                    };

                    scope.onLoadTrack = function(track) {
                        if (track.default) track.mode = 'showing';
                        else track.mode = 'hidden';

                        for (var i=0, l=API.mediaElement[0].textTracks.length; i<l; i++) {
                            if (track.label == API.mediaElement[0].textTracks[i].label) {
                                if (track.default) {
                                    API.mediaElement[0].textTracks[i].mode = 'showing';
                                }
                                else {
                                    API.mediaElement[0].textTracks[i].mode = 'disabled';
                                }
                            }

                        }

                        track.removeEventListener('load', scope.onLoadTrack.bind(scope, track));
                    };

                    scope.setTracks = function setTracks(value) {
                        // Add tracks to the API to have it available for other plugins (like controls)
                        tracks = value;
                        API.tracks = value;

                        if (isMetaDataLoaded) {
                            scope.updateTracks();
                        }
                        else {
                            API.mediaElement[0].addEventListener("loadedmetadata", scope.onLoadMetaData.bind(scope), false);
                        }
                    };

                    if (API.isConfig) {
                        scope.$watch(
                            function () {
                                return API.config;
                            },
                            function () {
                                if (API.config) {
                                    scope.setTracks(API.config.tracks);
                                }
                            }
                        );
                    }
                    else {
                        scope.$watch(attr.vgTracks, function (newValue, oldValue) {
                            if ((!tracks || newValue != oldValue)) {
                                scope.setTracks(newValue);
                            }
                        }, true);
                    }
                }
            }
        }
    }
    ]);

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.directive:videogular
 * @restrict E
 * @description
 * Main directive that must wrap a &lt;vg-media&gt; tag and all plugins.
 *
 * &lt;video&gt; tag usually will be above plugin tags, that's because plugins should be in a layer over the &lt;video&gt;.
 *
 * @param {string} vgTheme String with a scope name variable. This directive will inject a CSS link in the header of your page.
 * **This parameter is required.**
 *
 * @param {boolean} [vgPlaysInline=false] vgPlaysInline Boolean value or a String with a scope name variable to use native fullscreen (default) or set fullscreen inside browser (true).
 *
 * @param {boolean} [vgClearMediaOnNavigate=true] vgClearMediaOnNavigate Boolean value or a String with a scope name variable to reset the video player when user navigates.
 *
 * This is useful to allow continuous playback between different routes.
 *
 * @param {boolean} [vgAutoPlay=false] vgAutoPlay Boolean value or a String with a scope name variable to auto start playing video when it is initialized.
 *
 * **This parameter is disabled in mobile devices** because user must click on content to prevent consuming mobile data plans.
 *
 * @param {object} vgCuePoints Bindable object containing a list of timelines with cue points objects. A timeline is an array of objects with the following properties:
 * - `timeLapse` is an object with two properties `start` and `end` representing in seconds the period for this cue points.
 * - `onEnter` callback called when user enters on a cue point. callback(currentTime, timeLapse, params)
 * - `onLeave` callback called when user seeks backwards and leave the current cue point or a completed cue point. callback(currentTime, timeLapse, params)
 * - `onUpdate` callback called when the current time is between timeLapse.start and timeLapse.end. callback(currentTime, timeLapse, params)
 * - `onComplete` callback called when the user seek forward or the current time passes timeLapse.end property. callback(currentTime, timeLapse, params)
 * - `params` an object with values available to receive in the callback..
 *
 * @param {function} vgConfig String with a url to a config file. Config file's must be a JSON file object with the following structure:
 * <pre>
 {
   "controls": false,
   "loop": false,
   "autoplay": false,
   "preload": "auto",
   "theme": "path/to/videogular.css",
   "sources": [
     {
       "src": "path/to/videogular.mp4",
       "type": "video/mp4"
     },
     {
       "src": "path/to/videogular.webm",
       "type": "video/webm"
     },
     {
       "src": "path/to/videogular.ogg",
       "type": "video/ogg"
     }
   ],
   "tracks": [
     {
       "src": "path/to/pale-blue-dot.vtt",
       "kind": "subtitles",
       "srclang": "en",
       "label": "English",
       "default": ""
     }
   ],
   "plugins": {
     "controls": {
       "autohide": true,
       "autohideTime": 3000
     },
     "poster": {
       "url": "path/to/earth.png"
     },
     "ima-ads": {
       "companion": "companionAd",
       "companionSize": [728, 90],
       "network": "6062",
       "unitPath": "iab_vast_samples",
       "adTagUrl": "http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=%2F3510761%2FadRulesSampleTags&ciu_szs=160x600%2C300x250%2C728x90&cust_params=adrule%3Dpremidpostpodandbumpers&impl=s&gdfp_req=1&env=vp&ad_rule=1&vid=47570401&cmsid=481&output=xml_vast2&unviewed_position_start=1&url=[referrer_url]&correlator=[timestamp]",
       "skipButton": "<div class='skipButton'>skip ad</div>"
     },
     "analytics": {
       "category": "Videogular",
       "label": "Main",
       "events": {
         "ready": true,
         "play": true,
         "pause": true,
         "stop": true,
         "complete": true,
         "progress": 10
       }
     }
   }
 }
 * </pre>
 * @param {function} vgCanPlay Function name in controller's scope to call when video is able to begin playback
 * @param {function} vgComplete Function name in controller's scope to call when video have been completed.
 * @param {function} vgUpdateVolume Function name in controller's scope to call when volume changes. Receives a param with the new volume.
 * @param {function} vgUpdatePlayback Function name in controller's scope to call when playback changes. Receives a param with the new playback rate.
 * @param {function} vgUpdateTime Function name in controller's scope to call when video playback time is updated. Receives two params with current time and duration in milliseconds.
 * @param {function} vgUpdateState Function name in controller's scope to call when video state changes. Receives a param with the new state. Possible values are "play", "stop" or "pause".
 * @param {function} vgPlayerReady Function name in controller's scope to call when video have been initialized. Receives a param with the videogular API.
 * @param {function} vgChangeSource Function name in controller's scope to change current video source. Receives a param with the new video.
 * @param {function} vgPlaysInline Boolean to play video inline. Generally used in mobile devices.
 * @param {function} vgNativeFullscreen Boolean to disable native fullscreen.
 * @param {function} vgSeeking Function name in controller's scope to call when the video has finished jumping to a new time. Receives a param with the seeked time and duration in seconds.
 * @param {function} vgSeeked Function name in controller's scope to call when the video is jumping to a new time. Receives two params with the seeked time and duration in seconds.
 * @param {function} vgError Function name in controller's scope to receive an error from video object. Receives a param with the error event.
 * This is a free parameter and it could be values like "new.mp4", "320" or "sd". This will allow you to use this to change a video or video quality.
 * This callback will not change the video, you should do that by updating your sources scope variable.
 *
 */

angular.module("com.2fdevs.videogular")
    .directive("videogular",
    [function () {
        return {
            restrict: "EA",
            scope: {
                vgTheme: "=?",
                vgAutoPlay: "=?",
                vgPlaysInline: "=?",
                vgNativeFullscreen: "=?",
                vgClearMediaOnNavigate: "=?",
                vgCuePoints: "=?",
                vgConfig: "@",
                vgCanPlay: "&",
                vgComplete: "&",
                vgUpdateVolume: "&",
                vgUpdatePlayback: "&",
                vgUpdateTime: "&",
                vgUpdateState: "&",
                vgPlayerReady: "&",
                vgChangeSource: "&",
                vgSeeking: "&",
                vgSeeked: "&",
                vgError: "&"
            },
            controller: "vgController",
            controllerAs: "API",
            link: {
                pre: function (scope, elem, attr, controller) {
                    controller.videogularElement = angular.element(elem);
                }
            }
        }
    }
    ]);

/**
 * @ngdoc service
 * @name com.2fdevs.videogular.service:vgConfigLoader
 *
 * @description
 * Config loader service:
 *
 * vgConfigLoader.loadConfig(url): Param `url` is a url to a config JSON.
 **/

angular.module("com.2fdevs.videogular")
    .service("vgConfigLoader", ["$http", "$q", "$sce", function ($http, $q, $sce) {
        this.loadConfig = function loadConfig(url) {
            var deferred = $q.defer();

            $http({method: 'GET', url: url}).then(
                function success(response) {
                    var result = response.data;

                    for (var i = 0, l = result.sources.length; i < l; i++) {
                        result.sources[i].src = $sce.trustAsResourceUrl(result.sources[i].src);
                    }

                    deferred.resolve(result);
                },
                function reject() {
                    deferred.reject();
                }
            );

            return deferred.promise;
        };
    }]);

/**
 * @ngdoc service
 * @name com.2fdevs.videogular.service:vgFullscreen
 *
 * @description
 * Native fullscreen polyfill service.
 *
 *    * vgFullscreen.onchange: String with the onchange event name.
 *    * vgFullscreen.onerror: String with the onerror event name.
 *    * vgFullscreen.isAvailable: Boolean with fullscreen availability.
 *    * vgFullscreen.isFullScreen: Boolean with current view mode.
 *    * vgFullscreen.exit: Exit fullscreen function.
 *    * vgFullscreen.request: Request for fullscreen access function.
 **/

angular.module("com.2fdevs.videogular")
    .service("vgFullscreen", ["VG_UTILS", function (VG_UTILS) {
        // Native fullscreen polyfill
        var element;
        var polyfill = null;
        var APIs = {
            w3: {
                enabled: "fullscreenEnabled",
                element: "fullscreenElement",
                request: "requestFullscreen",
                exit: "exitFullscreen",
                onchange: "fullscreenchange",
                onerror: "fullscreenerror"
            },
            newWebkit: {
                enabled: "webkitFullscreenEnabled",
                element: "webkitFullscreenElement",
                request: "webkitRequestFullscreen",
                exit: "webkitExitFullscreen",
                onchange: "webkitfullscreenchange",
                onerror: "webkitfullscreenerror"
            },
            oldWebkit: {
                enabled: "webkitIsFullScreen",
                element: "webkitCurrentFullScreenElement",
                request: "webkitRequestFullScreen",
                exit: "webkitCancelFullScreen",
                onchange: "webkitfullscreenchange",
                onerror: "webkitfullscreenerror"
            },
            moz: {
                enabled: "mozFullScreen",
                element: "mozFullScreenElement",
                request: "mozRequestFullScreen",
                exit: "mozCancelFullScreen",
                onchange: "mozfullscreenchange",
                onerror: "mozfullscreenerror"
            },
            ios: {
                enabled: "webkitFullscreenEnabled",
                element: "webkitFullscreenElement",
                request: "webkitEnterFullscreen",
                exit: "webkitExitFullscreen",
                onchange: "webkitfullscreenchange",
                onerror: "webkitfullscreenerror"
            },
            ms: {
                enabled: "msFullscreenEnabled",
                element: "msFullscreenElement",
                request: "msRequestFullscreen",
                exit: "msExitFullscreen",
                onchange: "MSFullscreenChange",
                onerror: "MSFullscreenError"
            }
        };

        for (var browser in APIs) {
            if (APIs[browser].enabled in document) {
                polyfill = APIs[browser];
                break;
            }
        }

        // Override APIs on iOS
        if (VG_UTILS.isiOSDevice()) {
            polyfill = APIs.ios;
        }

        function isFullScreen() {
            var result = false;

            if (element) {
                result = (document[polyfill.element] != null || element.webkitDisplayingFullscreen)
            }
            else {
                result = (document[polyfill.element] != null)
            }

            return result;
        }

        this.isAvailable = (polyfill != null);

        if (polyfill) {
            this.onchange = polyfill.onchange;
            this.onerror = polyfill.onerror;
            this.isFullScreen = isFullScreen;
            this.exit = function () {
                document[polyfill.exit]();
            };
            this.request = function (elem) {
                element = elem;
                element[polyfill.request]();
            };
        }
    }]);


angular.module("com.2fdevs.videogular")
    .service("VG_UTILS", ["$window", function ($window) {
        this.fixEventOffset = function ($event) {
            /**
             * There's no offsetX in Firefox, so we fix that.
             * Solution provided by Jack Moore in this post:
             * http://www.jacklmoore.com/notes/mouse-position/
             * @param $event
             * @returns {*}
             */
            var matchedFF = navigator.userAgent.match(/Firefox\/(\d+)/i)
            if (matchedFF && Number.parseInt(matchedFF.pop()) < 39) {
                var style = $event.currentTarget.currentStyle || window.getComputedStyle($event.target, null);
                var borderLeftWidth = parseInt(style['borderLeftWidth'], 10);
                var borderTopWidth = parseInt(style['borderTopWidth'], 10);
                var rect = $event.currentTarget.getBoundingClientRect();
                var offsetX = $event.clientX - borderLeftWidth - rect.left;
                var offsetY = $event.clientY - borderTopWidth - rect.top;

                $event.offsetX = offsetX;
                $event.offsetY = offsetY;
            }

            return $event;
        };

        /**
         * Inspired by Paul Irish
         * https://gist.github.com/paulirish/211209
         * @returns {number}
         */
        this.getZIndex = function () {
            var zIndex = 1;
            var elementZIndex;

            var tags = document.getElementsByTagName('*');

            for (var i = 0, l = tags.length; i < l; i++) {
                elementZIndex = parseInt(window.getComputedStyle(tags[i])["z-index"]);

                if (elementZIndex > zIndex) {
                    zIndex = elementZIndex + 1;
                }
            }

            return zIndex;
        };

        // Very simple mobile detection, not 100% reliable
        this.isMobileDevice = function () {
            return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);
        };

        this.isiOSDevice = function () {
            return (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i));
        };

        /**
         * Test the browser's support for HTML5 localStorage.
         * @returns {boolean}
         */
        this.supportsLocalStorage = function () {
            var testKey = 'videogular-test-key';
            var storage = $window.sessionStorage;

            try {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                return 'localStorage' in $window && $window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        };
    }]);

define("videogular", function(){});

/**
 * @license Videogular v0.6.3 http://videogular.com
 * Two Fucking Developers http://twofuckingdevelopers.com
 * License: MIT
 */

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.buffering:vgBuffering
 * @restrict E
 * @description
 * Shows a spinner when Videogular is buffering or preparing the video player.
 *
 * ```html
 * <videogular vg-theme="config.theme.url" vg-autoplay="config.autoPlay">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-buffering></vg-buffering>
 * </videogular>
 * ```
 *
 */
angular.module("com.2fdevs.videogular.plugins.buffering", [])
	.directive(
	"vgBuffering",
	["VG_UTILS", function (VG_UTILS) {
		return {
			restrict: "E",
			require: "^videogular",
			template: "<div class='bufferingContainer'>" +
				"<div ng-class='spinnerClass' class='loadingSpinner'></div>" +
				"</div>",
			link: function (scope, elem, attr, API) {
				function showSpinner() {
					scope.spinnerClass = {stop: API.isBuffering};
					elem.css("display", "block");
				}

				function hideSpinner() {
					scope.spinnerClass = {stop: API.isBuffering};
					elem.css("display", "none");
				}

				function setState(isBuffering) {
					if (isBuffering) {
						showSpinner();
					}
					else {
						hideSpinner();
					}
				}

				function onPlayerReady(isReady) {
					if (isReady) {
						hideSpinner();
					}
				}

				showSpinner();

				// Workaround for issue #16: https://github.com/2fdevs/videogular/issues/16
				if (VG_UTILS.isMobileDevice()) {
					hideSpinner();
				}
				else {
					scope.$watch(
						function () {
							return API.isReady;
						},
						function (newVal, oldVal) {
							if (API.isReady == true || newVal != oldVal) {
								onPlayerReady(newVal);
							}
						}
					);
				}

				scope.$watch(
					function () {
						return API.isBuffering;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							setState(newVal);
						}
					}
				);
			}
		}
	}
	]);

define("videogular-buffering", function(){});

/**
 * @license Videogular v0.6.3 http://videogular.com
 * Two Fucking Developers http://twofuckingdevelopers.com
 * License: MIT
 */
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgControls
 * @restrict E
 * @description
 * This directive acts as a container and you will need other directives to control the media.
 * Inside this directive you can add other directives like vg-play-pause-button and vg-scrubbar.
 *
 * @param {boolean=false} vgAutohide Boolean variable or value to activate autohide.
 * @param {number=2000} vgAutohideTime Number variable or value that represents the time in milliseconds that will wait vgControls until it hides.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'></vg-controls>
 * </videogular>
 * ```
 *
 */

angular.module("com.2fdevs.videogular.plugins.controls", [])
	.directive(
	"vgControls",
	["$timeout", "VG_STATES", function ($timeout, VG_STATES) {
		return {
			restrict: "E",
			require: "^videogular",
			transclude: true,
			template: '<div id="controls-container" ng-mousemove="onMouseMove()" ng-class="animationClass" ng-transclude></div>',
			scope: {
				autoHide: "=vgAutohide",
				autoHideTime: "=vgAutohideTime"
			},
			link: function (scope, elem, attr, API) {
				var w = 0;
				var h = 0;
				var autoHideTime = 2000;
				var hideInterval;

				scope.onMouseMove = function onMouseMove() {
					if (scope.autoHide) showControls();
				};

				function hideControls() {
					scope.animationClass = "hide-animation";
				}

				function showControls() {
					scope.animationClass = "show-animation";
					$timeout.cancel(hideInterval);
					if (scope.autoHide) hideInterval = $timeout(hideControls, autoHideTime);
				}

				// If vg-autohide has been set
				if (scope.autoHide != undefined) {
					scope.$watch("autoHide", function (value) {
						if (value) {
							scope.animationClass = "hide-animation";
						}
						else {
							scope.animationClass = "";
							$timeout.cancel(hideInterval);
							showControls();
						}
					});
				}

				// If vg-autohide-time has been set
				if (scope.autoHideTime != undefined) {
					scope.$watch("autoHideTime", function (value) {
						autoHideTime = value;
					});
				}
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgPlayPauseButton
 * @restrict E
 * @description
 * Adds a button inside vg-controls to play and pause media.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-play-pause-button></vg-play-pause-button>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgPlayPauseButton",
	["VG_STATES", function (VG_STATES) {
		return {
			restrict: "E",
			require: "^videogular",
			template: "<button class='iconButton' ng-click='onClickPlayPause()' ng-class='playPauseIcon' aria-label='Play/Pause'></button>",
			link: function (scope, elem, attr, API) {
				function setState(newState) {
					switch (newState) {
						case VG_STATES.PLAY:
							scope.playPauseIcon = {pause: true};
							break;

						case VG_STATES.PAUSE:
							scope.playPauseIcon = {play: true};
							break;

						case VG_STATES.STOP:
							scope.playPauseIcon = {play: true};
							break;
					}
				}

				scope.onClickPlayPause = function onClickPlayPause() {
					API.playPause();
				};

				scope.playPauseIcon = {play: true};

				scope.$watch(
					function () {
						return API.currentState;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							setState(newVal);
						}
					}
				);
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgTimedisplay
 * @restrict E
 * @description
 * Adds a time display inside vg-controls to play and pause media.
 * You have three scope variables to show current time, time left and total time.
 *
 * Those scope variables are type Date so you can add a date filter to show the time as you wish.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-timedisplay>{{currentTime | date:'hh:mm'}}</vg-timedisplay>
 *        <vg-timedisplay>{{timeLeft | date:'mm:ss'}}</vg-timedisplay>
 *        <vg-timedisplay>{{totalTime | date:'hh:mm:ss'}}</vg-timedisplay>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgTimedisplay",
	[function () {
		return {
			require: "^videogular",
			restrict: "E",
			link: function (scope, elem, attr, API) {
				scope.$watch(
					function () {
						return API.currentTime;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							scope.currentTime = newVal;
						}
					}
				);

				scope.$watch(
					function () {
						return API.timeLeft;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							scope.timeLeft = newVal;
						}
					}
				);

				scope.$watch(
					function () {
						return API.totalTime;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							scope.totalTime = newVal;
						}
					}
				);
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgScrubbar
 * @restrict E
 * @description
 * Directive to control the time and display other information layers about the progress of the media.
 * This directive acts as a container and you can add more layers to display current time, cuepoints, buffer or whatever you need.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-scrubbar></vg-scrubbar>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgScrubbar",
	["VG_STATES", "VG_UTILS", function (VG_STATES, VG_UTILS) {
		return {
			restrict: "AE",
			require: "^videogular",
			transclude: true,
			template: '<div role="slider" aria-valuemax="{{ariaTime(API.totalTime)}}" ' +
					'aria-valuenow="{{ariaTime(API.currentTime)}}" ' +
					'aria-valuemin="0" aria-label="Time scrub bar" tabindex="0" ' +
			        'ng-transclude ng-keydown="onScrubBarKeyDown($event)"></div>',
			link: function (scope, elem, attr, API) {
				var isSeeking = false;
				var isPlaying = false;
				var isPlayingWhenSeeking = false;
				var touchStartX = 0;
				var LEFT = 37;
				var RIGHT = 39;
				var NUM_PERCENT = 1;

				scope.API = API;
				scope.ariaTime = function(time) {
					return (time === 0) ? "0" : Math.round(time.getTime() / 1000);
				};

				function onScrubBarTouchStart($event) {
					var event = $event.originalEvent || $event;
					var touches = event.touches;
					var touchX;

					if (VG_UTILS.isiOSDevice()) {
						touchStartX = (touches[0].clientX - event.layerX) * -1;
					}
					else {
						touchStartX = event.layerX;
					}

					touchX = touches[0].clientX + touchStartX - touches[0].target.offsetLeft;

					isSeeking = true;
					if (isPlaying) isPlayingWhenSeeking = true;
					API.pause();
					seekTime(touchX * API.mediaElement[0].duration / elem[0].scrollWidth);

					scope.$apply();
				}

				function onScrubBarTouchMove($event) {
					var event = $event.originalEvent || $event;
					if (isPlayingWhenSeeking) {
						isPlayingWhenSeeking = false;
						API.play();
					}
					isSeeking = false;

					scope.$apply();
				}

				function onScrubBarTouchMove($event) {
					var event = $event.originalEvent || $event;
					var touches = event.touches;
					var touchX;

					if (isSeeking) {
						touchX = touches[0].clientX + touchStartX - touches[0].target.offsetLeft;
						seekTime(touchX * API.mediaElement[0].duration / elem[0].scrollWidth);
					}

					scope.$apply();
				}

				function onScrubBarTouchLeave(event) {
					isSeeking = false;

					scope.$apply();
				}

				function onScrubBarMouseDown(event) {
					event = VG_UTILS.fixEventOffset(event);

					isSeeking = true;
					if (isPlaying) isPlayingWhenSeeking = true;
					API.pause();
					seekTime(event.offsetX * API.mediaElement[0].duration / elem[0].scrollWidth);

					scope.$apply();
				}

				function onScrubBarMouseUp(event) {
					event = VG_UTILS.fixEventOffset(event);

					if (isPlayingWhenSeeking) {
						isPlayingWhenSeeking = false;
						API.play();
					}
					isSeeking = false;
					seekTime(event.offsetX * API.mediaElement[0].duration / elem[0].scrollWidth);

					scope.$apply();
				}

				function onScrubBarMouseMove(event) {
					if (isSeeking) {
						event = VG_UTILS.fixEventOffset(event);
						seekTime(event.offsetX * API.mediaElement[0].duration / elem[0].scrollWidth);
					}

					scope.$apply();
				}

				function onScrubBarMouseLeave(event) {
					isSeeking = false;

					scope.$apply();
				}

				scope.onScrubBarKeyDown = function(event) {
					var currentPercent = API.currentTime.getTime() / API.totalTime.getTime() * 100;

					if (event.which === LEFT || event.keyCode === LEFT) {
						API.seekTime(currentPercent - NUM_PERCENT, true);
						event.preventDefault();
					}
					else if (event.which === RIGHT || event.keyCode === RIGHT) {
						API.seekTime(currentPercent + NUM_PERCENT, true);
						event.preventDefault();
					}
				};

				function seekTime(time) {
					API.seekTime(time, false);
				}

				function setState(newState) {
					if (!isSeeking) {
						switch (newState) {
							case VG_STATES.PLAY:
								isPlaying = true;
								break;

							case VG_STATES.PAUSE:
								isPlaying = false;
								break;

							case VG_STATES.STOP:
								isPlaying = false;
								break;
						}
					}
				}

				scope.$watch(
					function () {
						return API.currentState;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							setState(newVal);
						}
					}
				);

				// Touch move is really buggy in Chrome for Android, maybe we could use mouse move that works ok
				if (VG_UTILS.isMobileDevice()) {
					elem.bind("touchstart", onScrubBarTouchStart);
					elem.bind("touchend", onScrubBarTouchEnd);
					elem.bind("touchmove", onScrubBarTouchMove);
					elem.bind("touchleave", onScrubBarTouchLeave);
				}
				else {
					elem.bind("mousedown", onScrubBarMouseDown);
					elem.bind("mouseup", onScrubBarMouseUp);
					elem.bind("mousemove", onScrubBarMouseMove);
					elem.bind("mouseleave", onScrubBarMouseLeave);
				}
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgScrubbarcurrenttime
 * @restrict E
 * @description
 * Layer inside vg-scrubbar to display the current time.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-scrubbar>
 *            <vg-scrubbarcurrenttime></vg-scrubbarcurrenttime>
 *        </vg-scrubbar>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgScrubbarcurrenttime",
	[function () {
		return {
			restrict: "E",
			require: "^videogular",
			link: function (scope, elem, attr, API) {
				var percentTime = 0;

				function onUpdateTime(newCurrentTime) {
					if (newCurrentTime && API.totalTime) {
						percentTime = (newCurrentTime.getTime() * -1 / 1000) * 100 / (API.totalTime.getTime() * -1 / 1000);
						elem.css("width", percentTime + "%");
					}
				}

				function onComplete() {
					percentTime = 0;
					elem.css("width", percentTime + "%");
				}

				scope.$watch(
					function () {
						return API.currentTime;
					},
					function (newVal, oldVal) {
						onUpdateTime(newVal);
					}
				);

				scope.$watch(
					function () {
						return API.isCompleted;
					},
					function (newVal, oldVal) {
						onComplete(newVal);
					}
				);
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgVolume
 * @restrict E
 * @description
 * Directive to control the volume.
 * This directive acts as a container and you will need other directives like vg-mutebutton and vg-volumebar to control the volume.
 * In mobile will be hided since volume API is disabled for mobile devices.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-volume></vg-volume>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgVolume",
	["VG_UTILS", function (VG_UTILS) {
		return {
			restrict: "E",
			link: function (scope, elem, attr) {
				function onMouseOverVolume() {
					scope.volumeVisibility = "visible";
					scope.$apply();
				}

				function onMouseLeaveVolume() {
					scope.volumeVisibility = "hidden";
					scope.$apply();
				}

				// We hide volume controls on mobile devices
				if (VG_UTILS.isMobileDevice()) {
					elem.css("display", "none");
				}
				else {
					scope.volumeVisibility = "hidden";

					elem.bind("mouseover", onMouseOverVolume);
					elem.bind("mouseleave", onMouseLeaveVolume);
				}
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgVolumebar
 * @restrict E
 * @description
 * Directive to display a vertical volume bar to control the volume.
 * This directive must be inside vg-volume directive and requires vg-mutebutton to be displayed.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-volume>
 *            <vg-mutebutton><vg-mutebutton>
 *            <vg-volumebar><vg-volumebar>
 *        </vg-volume>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgVolumebar",
	["VG_UTILS", function (VG_UTILS) {
		return {
			restrict: "E",
			require: "^videogular",
			template: "<div class='verticalVolumeBar'>" +
				"<div class='volumeBackground' ng-click='onClickVolume($event)' ng-mousedown='onMouseDownVolume()' ng-mouseup='onMouseUpVolume()' ng-mousemove='onMouseMoveVolume($event)' ng-mouseleave='onMouseLeaveVolume()'>" +
				"<div class='volumeValue'></div>" +
				"<div class='volumeClickArea'></div>" +
				"</div>" +
				"</div>",
			link: function (scope, elem, attr, API) {
				var isChangingVolume = false;
				var volumeBackElem = angular.element(elem[0].getElementsByClassName("volumeBackground"));
				var volumeValueElem = angular.element(elem[0].getElementsByClassName("volumeValue"));

				scope.onClickVolume = function onClickVolume(event) {
					event = VG_UTILS.fixEventOffset(event);
					var volumeHeight = parseInt(volumeBackElem.prop("offsetHeight"));
					var value = event.offsetY * 100 / volumeHeight;
					var volValue = 1 - (value / 100);

					API.setVolume(volValue);
				};

				scope.onMouseDownVolume = function onMouseDownVolume() {
					isChangingVolume = true;
				};

				scope.onMouseUpVolume = function onMouseUpVolume() {
					isChangingVolume = false;
				};

				scope.onMouseLeaveVolume = function onMouseLeaveVolume() {
					isChangingVolume = false;
				};

				scope.onMouseMoveVolume = function onMouseMoveVolume(event) {
					if (isChangingVolume) {
						event = VG_UTILS.fixEventOffset(event);
						var volumeHeight = parseInt(volumeBackElem.prop("offsetHeight"));
						var value = event.offsetY * 100 / volumeHeight;
						var volValue = 1 - (value / 100);

						API.setVolume(volValue);
					}
				};

				function updateVolumeView(value) {
					value = value * 100;
					volumeValueElem.css("height", value + "%");
					volumeValueElem.css("top", (100 - value) + "%");
				}

				function onChangeVisibility(value) {
					elem.css("visibility", value);
				}

				elem.css("visibility", scope.volumeVisibility);

				scope.$watch("volumeVisibility", onChangeVisibility);

				scope.$watch(
					function () {
						return API.volume;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							updateVolumeView(newVal);
						}
					}
				);
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgMutebutton
 * @restrict E
 * @description
 * Directive to display a button to mute volume.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-volume>
 *            <vg-mutebutton><vg-mutebutton>
 *        </vg-volume>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgMutebutton",
	[function () {
		return {
			restrict: "E",
			require: "^videogular",
			template: "<button class='iconButton' ng-class='muteIcon'" +
				" ng-click='onClickMute()' ng-focus='onMuteButtonFocus()' ng-blur='onMuteButtonLoseFocus()' ng-keydown='onMuteButtonKeyDown($event)'" +
				" aria-label='Mute'></button>",
			link: function (scope, elem, attr, API) {
				var isMuted = false;
				var UP = 38;
				var DOWN = 40;
				var CHANGE_PER_PRESS = 0.05;

				scope.onClickMute = function onClickMute() {
					if (isMuted) {
						scope.currentVolume = scope.defaultVolume;
					}
					else {
						scope.currentVolume = 0;
						scope.muteIcon = {mute: true};
					}

					isMuted = !isMuted;

					API.setVolume(scope.currentVolume);
				};

				scope.onMuteButtonFocus = function() {
					scope.volumeVisibility = 'visible';
				};

				scope.onMuteButtonLoseFocus = function() {
					scope.volumeVisibility = 'hidden';
				};

				scope.onMuteButtonKeyDown = function(event) {
					var currentVolume = (API.volume != null) ? API.volume : 1;
          var newVolume;

					if (event.which === UP || event.keyCode === UP) {
            newVolume = currentVolume + CHANGE_PER_PRESS;
            if (newVolume > 1) newVolume = 1;

						API.setVolume(newVolume);
						event.preventDefault();
					}
					else if (event.which === DOWN || event.keyCode === DOWN) {
            newVolume = currentVolume - CHANGE_PER_PRESS;
            if (newVolume < 0) newVolume = 0;

						API.setVolume(newVolume);
						event.preventDefault();
					}
				};

				function onSetVolume(newVolume) {
          scope.currentVolume = newVolume;

					// TODO: Save volume with LocalStorage
					// if it's not muted we save the default volume
					if (!isMuted) {
						scope.defaultVolume = newVolume;
					}
					else {
						// if was muted but the user changed the volume
						if (newVolume > 0) {
							scope.defaultVolume = newVolume;
						}
					}

					var percentValue = Math.round(newVolume * 100);
					if (percentValue == 0) {
						scope.muteIcon = {mute: true};
					}
					else if (percentValue > 0 && percentValue < 25) {
						scope.muteIcon = {level0: true};
					}
					else if (percentValue >= 25 && percentValue < 50) {
						scope.muteIcon = {level1: true};
					}
					else if (percentValue >= 50 && percentValue < 75) {
						scope.muteIcon = {level2: true};
					}
					else if (percentValue >= 75) {
						scope.muteIcon = {level3: true};
					}
				}

				scope.defaultVolume = 1;
				scope.currentVolume = scope.defaultVolume;
				scope.muteIcon = {level3: true};

				//TODO: get volume from localStorage

				scope.$watch(
					function () {
						return API.volume;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							onSetVolume(newVal);
						}
					}
				);
			}
		}
	}
	])
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.controls:vgFullscreenbutton
 * @restrict E
 * @description
 * Directive to switch between fullscreen and normal mode.
 *
 * ```html
 * <videogular vg-theme="config.theme.url">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-controls vg-autohide='config.autohide' vg-autohide-time='config.autohideTime'>
 *        <vg-fullscreenbutton></vg-fullscreenbutton>
 *    </vg-controls>
 * </videogular>
 * ```
 *
 */
	.directive(
	"vgFullscreenbutton",
	[function () {
		return {
			restrict: "AE",
			require: "^videogular",
			scope: {
				vgEnterFullScreenIcon: "=",
				vgExitFullScreenIcon: "="
			},
			template: "<button class='iconButton' ng-click='onClickFullScreen()' ng-class='fullscreenIcon' aria-label='Toggle full screen'></button>",
			link: function (scope, elem, attr, API) {
				function onChangeFullScreen(isFullScreen) {
					scope.fullscreenIcon = {enter: !isFullScreen, exit: isFullScreen};
				}

				scope.onClickFullScreen = function onClickFullScreen() {
					API.toggleFullScreen();
				};

				scope.fullscreenIcon = {exit: false};
				scope.fullscreenIcon = {enter: true};

				scope.$watch(
					function () {
						return API.isFullScreen;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							onChangeFullScreen(newVal);
						}
					}
				);
			}
		}
	}
	]);

define("videogular-controls", function(){});

/**
 * @license Videogular v0.6.3 http://videogular.com
 * Two Fucking Developers http://twofuckingdevelopers.com
 * License: MIT
 */

/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.overlayplay:vgOverlayPlay
 * @restrict E
 * @description
 * Shows a big play button centered when player is paused or stopped.
 *
 * ```html
 * <videogular vg-theme="config.theme.url" vg-autoplay="config.autoPlay">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-overlay-play></vg-overlay-play>
 * </videogular>
 * ```
 *
 */
angular.module("com.2fdevs.videogular.plugins.overlayplay", [])
	.directive(
	"vgOverlayPlay",
	["VG_STATES", function (VG_STATES) {
		return {
			restrict: "E",
			require: "^videogular",
			template: "<div class='overlayPlayContainer' ng-click='onClickOverlayPlay()'>" +
				"<div class='iconButton' ng-class='overlayPlayIcon'></div>" +
				"</div>",
			link: function (scope, elem, attr, API) {
				function onComplete(target, params) {
					scope.overlayPlayIcon = {play: true};
				}

				function onPlay(target, params) {
					scope.overlayPlayIcon = {};
				}

				function onChangeState(newState) {
					switch (newState) {
						case VG_STATES.PLAY:
							scope.overlayPlayIcon = {};
							break;

						case VG_STATES.PAUSE:
							scope.overlayPlayIcon = {play: true};
							break;

						case VG_STATES.STOP:
							scope.overlayPlayIcon = {play: true};
							break;
					}
				}

				scope.onClickOverlayPlay = function onClickOverlayPlay(event) {
					API.playPause();
				};

				scope.overlayPlayIcon = {play: true};

				scope.$watch(
					function () {
						return API.currentState;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							onChangeState(newVal);
						}
					}
				);
			}
		}
	}
	]);


define("videogular-overlay-play", function(){});

/**
 * @license Videogular v0.6.3 http://videogular.com
 * Two Fucking Developers http://twofuckingdevelopers.com
 * License: MIT
 */
/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.poster:vgPoster
 * @restrict E
 * @description
 * Shows an image when player hasn't been played or has been completed a video.
 *
 * @param {string} vgUrl String with a scope name variable. URL to an image supported by the img tag.
 * **This parameter is required.**
 *
 * ```html
 * <videogular vg-theme="config.theme.url" vg-autoplay="config.autoPlay">
 *    <vg-video vg-src="sources"></vg-video>
 *
 *    <vg-poster-image vg-url='config.plugins.poster.url'></vg-poster-image>
 * </videogular>
 * ```
 *
 */

angular.module("com.2fdevs.videogular.plugins.poster", [])
	.directive(
	"vgPosterImage",
	["VG_STATES", function (VG_STATES) {
		return {
			restrict: "E",
			require: "^videogular",
			scope: {
				vgUrl: "="
			},
			template: '<img ng-src="{{vgUrl}}">',
			link: function (scope, elem, attr, API) {
				function onUpdateState(newState) {
					switch (newState) {
						case VG_STATES.PLAY:
							elem.css("display", "none");
							break;

						case VG_STATES.STOP:
							elem.css("display", "block");
							break;
					}
				}

				scope.$watch(
					function () {
						return API.currentState;
					},
					function (newVal, oldVal) {
						if (newVal != oldVal) {
							onUpdateState(newVal);
						}
					}
				);
			}
		}
	}
	]);

define("videogular-poster", function(){});

define(
    'ui/module',[
        'views',
        'angular-sanitize',
        'videogular',
        'videogular-buffering',
        'videogular-controls',
        'videogular-overlay-play',
        'videogular-poster'
    ],
    function (views) {
        var module = angular
            .module('jp.angular.ui', [
                'ngSanitize',
                'com.2fdevs.videogular',
                'com.2fdevs.videogular.plugins.controls',
                'com.2fdevs.videogular.plugins.overlayplay',
                'com.2fdevs.videogular.plugins.buffering',
                'com.2fdevs.videogular.plugins.poster'
            ])
            .run(['$templateCache', views.init]);
        return module;
    }
);
define(
    'ui/hamburger-menu/hamburger-menu',[
        'ui/module'
    ],
    function defineHamburgerMenu(module) {
        module.controller('HamburgerMenuController', [
            function defineHamburgerMenuController() {
                
            }
        ]);

        return module.directive('jpHamburgerMenu', [
            function defineHamburgerMenuDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/hamburger-menu/hamburger-menu.html',
                    controller: 'HamburgerMenuController'
                }
            }
        ]);
    }
);
define(
    'ui/video-player/video-player',[
        'ui/module'
    ],
    function defineVideoPlayer(module) {
        module.controller('VideoPlayerController', [
            '$scope',
            '$sce',
            function defineVideoPlayerController($scope, $sce) {
                $scope.config = {
                    sources: [
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
                    ],
                    tracks: [
                        {
                            src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                            kind: "subtitles",
                            srclang: "en",
                            label: "English",
                            default: ""
                        }
                    ],
                    plugins: {
                        poster: "http://www.videogular.com/assets/images/videogular.png"
                    }
                };
            }
        ]);
        return module.directive('jpVideoPlayer', [
            function defineVideoPlayerDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/video-player/video-player.html',
                    controller: 'VideoPlayerController'
                }
            }
        ]);
    }
);
define(
    'jp-angular-ui',[
        'ui/hamburger-menu/hamburger-menu',
        'ui/video-player/video-player'
    ],
    function defineBuild() {
        return true;
    }
);


//# sourceMappingURL=main.js.map