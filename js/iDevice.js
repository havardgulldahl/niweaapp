/*jslint white: false, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*global $, PhoneGap, history, window, device, localStorage, navigator, alert, setTimeout, event*/
"use strict";

// define console.log, if it doesn't exist to avoid errors 
//please leave this at the beginning and don't put any console.log before this definition
/*
if (!window.console || !console.firebug)
{
	var names = ["log", "debug", "info", "warn", "error"];
	
	window.console = {};
	for (var i = 0; i < names.length; ++i) {
		window.console[names[i]] = function() {};
	}
}
*/

(function () {
	var modules, application, Storage;
	
	modules = {};

    strmax = function(s, len) {
        if(!s || s.length < len)
            return s;

        return s.substr(0, len) + ' ...';
    };
	
	application = (function () {
	
		var initialized, that, serverName, apiPath, // private properties
		initializeTabbar, request, showButton, hasTouchSupport; // methods
		
		hasTouchSupport = (function(){
			// Not ideal, but seems like there's no foolproof way of detecting touch support without snagging Chrome too.
			return navigator.userAgent.indexOf('iPhone') !== -1 ||
				navigator.userAgent.indexOf('iPod') !== -1 ||
				navigator.userAgent.indexOf('iPad') !== -1 ||
				navigator.userAgent.indexOf('Android') !== -1;
			}());

		
		request = function (requester, url, data, callback) {
	
			if ('function' === typeof data) {
				// no data was given
				callback = data;
				data = {};
			}
			
			if (!apiPath) {
				// this is the dev environment
				// let's use a mock object
				callback({mock: 'object'});
				return;
			}
	
			that.setProgressBar();
			
			
			requester(
				apiPath + url,
				data, 
				function (response) {
					that.removeProgressBar();
					callback(response);
				},
				'json'
			);
		};
	
		that = {
	
			reload: function () {
				window.scroll(0, 0);
				that.processURI($.address.value());
			},
			init: function () {
				// we don't want this function to be called twice
				that.init = function () {};
				
				$('#logo').click(function() {application.setAddress('page/category?id=0');});
				
				modules.category.initCategories();
				
				$.address.value(localStorage.getItem('xxcurrentPage') || 'category');
				
				// we set the onAddressChange handler only after
				// the address init event has been thrown, that way
				// the onAddressChange handler will not be called twice.
				$.address.init(
					function () {
						$.address.change(application.processURI);
					}
				);
			},
	
			processURI: function (address) {
				var module, parameters;
				
				application.removeProgressBar();
								
				if ('string' === typeof address) {
					// parse the string URIs
					address = address.split('?');
					parameters = {};
					if (1 < address.length) {
						// parse out the parameters, if any
						(function () {
							var i, ii, query, queries;
							queries = address[1].split('&');
							for (i = 0, ii = queries.length; i < ii; i += 1) {
								query = queries[i].split('=');
								if (2 === query.length) {
									parameters[query[0]] = query[1];
								}
							}
						}());
					}
					
					module = address[0].split('/').join('');
				} else {
										
					// parse the event sent from $.address
					if (!address.pathNames) {
						return;
					}
					
					parameters = address.parameters || {};
					module = address.pathNames.join('');
				}
				
				if ('' === module) {
					// if no module is chosen,
					// we send them to the front page
					module = 'category';
					parameters = {};
				}
	
				if (!modules[module]) {
					// we fallback to index
					// this might be a good place for a 404
					module = '404';
				}
	
				if (modules[module].stub) {
					$('#content').html($(modules[module].stub));
				}
	
				if ('function' === typeof modules[module].init) {
					modules[module].init(parameters);
				}
			},
			
			setAddress: function (uri) {
				var type, parts;
				
				window.scroll(0, 0);
				
				parts = uri.split('/');
				type = parts[0];
				uri = parts[1];
	
				if ('action' === type) {
					this.processURI(uri);
					return;
				}
				
				if ('page' === type) {
					try {
						localStorage.removeItem('currentPage');
						//localStorage.setItem('currentPage', uri);
					} catch (e) {
						alert(e.message);
					}
					$.address.value(uri);
				}
			},
			setProgressBar: function () {
                console.log("Setprogressbar");
				if (0 === $('#progress').size()) {
                    $("#content").html('<div class="spinner"><p id="spinner"></p></div>');
                    $('body').addClass("working");
					//$('body').append('<div id="progress"><img src="img/ajax-loader.gif"/> Loading…</div>');
				}
			},
			removeProgressBar: function () {
                console.log("removeprogressbar");
				$('div.spinner').remove();
                $('body').removeClass("working");
			},
			get: function (url, data, callback) {
				request($.get, url, data, callback);
			},
			post: function (url, data, callback) {
				request($.post, url, data, callback);
			}
		};
		return that;
	}());
	
	
	modules.category = (function () {
		var that, next, previous, slideTo, selected_category, goTo;
		
		next = function () {
			if (selected_category < 10) {
				goTo(selected_category + 1);
			} else {
				slideTo(selected_category);
			}
		};
		previous = function () {
			if (selected_category > 0) {
				goTo(selected_category - 1);
			} else {
				slideTo(selected_category);
			}
		};
		goTo = function (id) {
            if(id==1) id+=100;
            console.log("Goto cat " + id);
			application.setAddress('page/category?id=' + id);
		};
		
		slideTo = function (direction, duration) {
            console.log("sliteDo dir " + direction);
			var position;
			
			if ('number' !== typeof duration) {
				duration = 300;
			}
			
			if ('undefined' === typeof selected_category) {
				selected_category = 0;
			}
			
			if ('number' === typeof direction) {
				position = $('#cat-' + direction).position();
				if (position) {
					position = position.left;
					selected_category = direction;
				}
			} else {
				if ('next' === direction) {
					position = $('#cat-' + (selected_category + 1)).position();
					if (position) {
						position = position.left;
						selected_category += 1;
					} 
				} else {
					position = $('#cat-' + (selected_category - 1)).position();
					if (position) {
						position = position.left;
						selected_category -= 1;
					}
				}
			}
			
			if (!position) {
				// there is no next/previous element
				position = $('#cat-' + selected_category).position().left;
			}
	
			// TODO: use WebKitTransitionEvent
			if (0 === duration) {
				$('#pages').css('left', -position);
			} else {
				$('#pages').animate({left: - position}, duration, function() {});
			}
			
			//application.setAddress('page/category?id=' + selected_category);
	
			$('#pager').attr('class', 'page-' + selected_category);
            // set magic class to the current category shortcut
            var _found = false;
			$('#category a').each(function(index) { 
                var i = $(this).attr("id").split("-")[2];
                if(i == selected_category) {
                    $(this).addClass("current");
                    _found = true;
                } else {
                    $(this).removeClass("current");
                }
            });
            if(!_found && parseInt(selected_category, 10) > 100) {
                // geolocal category
                $("#category-link-99").addClass("current");
            }
		};
		
		
		that = {
			initCategories: function () {
				var i, container, containercount;
				
				container = $('#categories');
				
				if (0 !== container.children('div').size()) {
					// categories have already been initialized
					return;
				}
				container.hide();
                containercount = $('#category a.category-link').length;

				for (i = 0; i < containercount; i += 1) {
					container.append('<div/>')
						.children(':last')
						.attr('id', 'cat-' + i)
						.addClass('category')
						.width($('body').width());
					Storage.drawCategory(i);
				}
	
				Storage.init();

				container.width((i * $('body').width()) + 100);
			},
			hide: function () {
				var categories;
				
				categories = $('#categories');
				if (categories.is(':visible')) {
					$('body').unbind('touchstart', this.handleTouch);
					categories.hide();
				}
				$('#pager').hide();
			},
			init: function (parameters) {
	
				var categories, duration, id, logo;
				
				$('#content').text('');
				
				id = parseInt(parameters.id, 10);
				
				categories = $('#categories');
	
				if (!categories.is(':visible')) {
					$('#pages div:visible').hide();
					categories.show();
					$('body').bind('touchstart', this.handleTouch);
				}
				$('#pager').show();
				
				if ('number' === typeof selected_category && 1 === Math.pow(selected_category - id, 2)) {
					// the back button has been used, we want a sliding effect...
					duration = null;
				} else {
					// most likely the page has been reloaded or we come back from
					// a story page using the back button.
					duration = 0;
				}
				
				logo = $('#logo');
				logo.unbind("click");
				logo.click(function() {application.setAddress('page/category?id=' + parameters.id);});

				$(window).bind('orientationchange', this.handleRotate);
				
				slideTo(id, duration);
			},
			handleTouch: function(e) {
				var $el, startX, startY, startTime, deltaX, deltaY, deltaT, touchMove, touchEnd, updateTouch, foo;
				
				$el = $(e.target);
				foo = $('#pages').position().left;
				
				touchMove = function (e) {
					
					// prevent scroll
					e.preventDefault();
					
					updateTouch();
					
					$('#pages').css('left', foo + deltaX);
				};
	
				touchEnd = function () {
					var absX, absY, swipeLength;
					
					updateTouch();
					
					absX = Math.abs(deltaX);
					absY = Math.abs(deltaY);
					
					// User must swipe 1/9 the width of the screen to move on.
					swipeLength = $(document).width() / 9;
	
					// Check for swipe
					if (absX > swipeLength) {
						if (deltaX < 0) {
							// Left swipe.
							next();
						} else {
							// Right swipe.
							previous();
						}
					} else {
						slideTo(selected_category);
					}
					
					$el.unbind('touchmove touchend');
				};
	
				updateTouch = function () {
					var first = event.changedTouches[0] || null;
					deltaX = first.pageX - startX;
					deltaY = first.pageY - startY;
					deltaT = (new Date()).getTime() - startTime;
				};
	
				if (event) {
					startX = event.changedTouches[0].clientX;
					startY = event.changedTouches[0].clientY;
					startTime = (new Date()).getTime();
					deltaX = 0;
					deltaY = 0;
					deltaT = 0;
	
					// Let's bind these after the fact, so we can keep some internal values.
					$el.bind('touchmove', touchMove).bind('touchend', touchEnd);
				}
	
			},
			handleRotate: function(e) {
				var container;
				
				// resize container and categories to new document with
				$('#categories').width((11 * $('body').width()) + 100);
				$('#categories > div').width($('body').width());
				
				// instant switch to category
				slideTo(selected_category, 0);
			}
		};
		return that;
	}());
	
	modules['404'] = {
		stub: '<h1>404</h1>'
	};
	
	
	Storage = (function () {
		//"private" variables:
		var categoryCount = 6,
			categories = {},
			stories = [],
			getJsonFromServer, handleJsonFromServer, getJsonFromStorage, initContent, showStoryClick,
			drawStory, getStory, putJsonToStorage, putToStorage, refreshContent, that;
		
		getJsonFromServer = function (id) {
			
			$.getJSON( './backend/index.php?mode=cat&id='+id, handleJsonFromServer );
		};
		
		handleJsonFromServer = function(data, status) {
			
			if (status === 'success' && data) {
				var id = parseInt(data.id, 10);
                if (id > 100) { // special localized hack
                    id = data.id = 1;
                }
				if (id === 0) {
				  data.category ="Front";	
				} else if (data.items[0]) {
					 data.category = data.items[0].category;
				}
				
				
				//console.log('<option value="'+id+'">'+data.category+'</option>');
				/*for (var i = 0; i <  data.items.length; i++) {
					cat.items[i] =  data.items[i];
				}*/
				putJsonToStorage(data,id);
			}
		};

        getGeoJsonFromStorage = function() {
            var data;
            try {
                return JSON.parse(localStorage.getItem("geo"));
            } catch (e) {
                return null;
            }
        };
		
		getJsonFromStorage = function(id) {
			var data, i, item;
			try {
				data = JSON.parse(localStorage.getItem("category"+id));
			} catch (e) {
				data = null;
			}
			if (data && data.items) {
				for(i = 0; i < data.items.length; i += 1) {
					item = data.items[i];
					stories[item.id] = item;
				}
			}
			
			return data;
		};
		
		initContent = function() {
			refreshContent();
		};
		
		showStoryClick = function() {
			application.setAddress("page/story?id="+$(this).attr("id"));
		};

        drawStory = function(id) {
            var item;
            item = getStory(id);
			if (!item) {
				alert('Die Story konnt nicht gefunden werden.');
				return;
			}
            if (!item.text) {
                console.debug("Getting story from server");
                //$('body').addClass("working");
                //drawWaitSpinner();
                $.getJSON( './backend/index.php?mode=story&id='+id, function(data) {
                    //$('body').removeClass("working");
                    var item = data.items[0];
                    console.debug(data);
                    drawStoryItem(item);
                });
            } else {
                drawStoryItem(item);
            }

        };
		
		drawStoryItem = function(item) {
			var content, i, ii, context;
			
			content = $('#content');
			
			content.html('<div class="long story"><div class="img"><img /><span class="legend"> </span></div><h2 class="title"></h2><p class="lead"/><div class="text"/><div class="context_stories"></div>');
			
			content.find('h2').text(item.title);
			content.find('p.lead').html(item.lead);
			content.find('div.text').html(item.text);
			content.find('.legend').html("<br/>"+item.topelement_image_legend);
			if (item.image_big_ipad) {
				// ADD AN IMAGE, IF ONE IS GIVEN
				content.find('img')
					.attr('src', item.image);
			}
			
			//// TODO: add congtext stories, once we are sure we can provide the content
			//context = content.find('div.context_stories')
			//for (i = 0, ii = item.context_stories.length; i < ii; i += 1) {
			//	context.append('<a/>')
			//		.children(':last')
			//		.text(item.context_stories[i].context_title);
			//}
			Hyphenator.config({
				classname : 'long',
				donthyphenateclassname: 'title',
				remoteloading : false
				
			});
			Hyphenator.run();


		};

        drawWaitSpinner = function() {
            var content;
            content = $('#content');
            content.html('<div class="spinner"><p id="spinner"></p></div>');
        };
		
		getStory = function(id) {
			if (stories[id]) {
				return stories[id];
			} else {
				return null;
			}
		};

        getStoryFromServer = function(id) {
			$.getJSON( './backend/index.php?mode=story&id='+id, function(data) {
                stories[id] = data[0];
                //drawStory(id);
            });
        };
		
		
		putJsonToStorage = function(data, id) {
            /*
			try {
				// one does not get the "Quota exceeded" exceptions
				// when removing the item before overwriting it...
				// c.f. http://stackoverflow.com/questions/2603682/
				localStorage.removeItem("category"+id);
				localStorage.setItem("category"+id,JSON.stringify(data));
			} catch (e) {
				if (e === 'QUOTA_EXCEEDED_ERR') {
					alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
				}
			}
            */
            putToStorage("category"+id, data);
			that.drawCategory(id);
		};

        putGeoJsonToStorage = function(data) {
            console.log("putgeostorage: %o", data) 
            getJsonFromServer(data.county+100);
            return putToStorage("geo", data); 
        };

        putToStorage = function(key, data) {
			try {
				// one does not get the "Quota exceeded" exceptions
				// when removing the item before overwriting it...
				// c.f. http://stackoverflow.com/questions/2603682/
				localStorage.removeItem(key);
				localStorage.setItem(key, JSON.stringify(data));
			} catch (e) {
				if (e === 'QUOTA_EXCEEDED_ERR') {
					alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
				}
			}
        };
		
		refreshContent = function() {
            var categoryId; 
			for (var i = 0;i <= categoryCount;  i += 1) {
                categoryId = i;
                if(i == 1) { // special category for geoloclalized content
                    var geo = window.getGeoJsonFromStorage();
                    console.log("getting spzeal: %o", geo);
                    try {
                        if(geo.county)
                            categoryId = geo.county + 100;
                    } catch(e) {}
                }
                console.log("getting category %o", categoryId);        
				getJsonFromServer(categoryId);
			}
		};

		that = {
			init: function () {
				initContent();
			},
			
			updateStory: function(id) {
				drawStory(id);
			},
			
			updateCategory: function(id) {
				//drawCategory(id);
			},
			
			drawCategory: function (id) {
				var data, displayStories, div, item, 
                    i, leadStory, smallStory, storyClass, 
                    title, getCallback;
				
				getCallback = function (item) { 
					return function () {
						application.setAddress('page/story?id=' + item.id);
					};
				};
				
				div = $('#cat-' + id);
				
				if (0 === div.size()) {
					return;
				}
				
				data = getJsonFromStorage(id);
				if (!data || !data.items) {
					return;
				}
				
				
				title = div.find('h2').first();
				if (title.size() && data.items[0].title === title.text()) {
					// we only rerender if there are no changes.
					// if the title of the first story didn't change, then the
					// content didn't change... makes sense, right? right?
                    // TODO: fix this fallacy
					return;
				}
				
				div.text('');


                leadStory = $('<div class="story big"><div class="storyimg"><img/></div><h2 class="title"/><p class="lead"/></div>');

				item = data.items[0];
                $("img", leadStory).attr("src", item.image);
                $("h2", leadStory).text(item.title).click(getCallback(item));
                $("p", leadStory).text(item.lead);

                div.addClass('content').append(leadStory);
				
                // sanity check no. of stories
                var displayStories = Math.min(5, data.items.length); // 5 is default

                smallStory = $('<div class="story small"><h2 class="title"/><p class="lead"/></div>');

                // create the "small" stories
				for (i = 1; i < displayStories; i += 1) {
					item = data.items[i];
					title = item.shorttitle ? item.shorttitle : item.title;
                    itemStory = smallStory.clone();
                    $("h2", itemStory).text(item.title).click(getCallback(item));
                    $("p", itemStory).text(strmax(item.lead));
                    div.append(itemStory);
				}
			}
		};
		
		return that;
		
	}());
	
	modules.story = {
	    init: function(data) {
			modules.category.hide();
			
			Storage.updateStory(data.id.replace(/story_/,''));
		}
	
	};
	
	$(application.init);
	
	$('#content').ajaxError(function(event, XMLHttpRequest, ajaxOptions, thrownError) {
	  $(this).text(thrownError.message);
	});
}());


$(document).ready(function() {
    var hasGeoSupport = geo_position_js.init();
    if(!hasGeoSupport) {
        $('#category-99-settings-gps').hide();
        $('#category-99-settings-gps-retry').show();
    }

    function formatGeo(geo) {
        $('#category-99-current').html(
            $('<em>').attr("title", "Getting news feed from "+geo.feed).text("Current position is "+geo.countyname)
            ).show()
        $('#category-99-select').val(parseInt(geo.county, 10) +100);
        $('#category-99-postalcode').val(geo.postalcode || '');
    };
    $('#category-99-toggle-menu').toggle(function(ev) {
        // show menu
        var geo = JSON.parse(localStorage.getItem("geo"));
        console.log( "formatgeo: %o", geo);
        if(geo != null) {
            // have previous geo setting
            formatGeo(geo);
        }
        $('#category-99-settings').css({"top": ev.target.top, "left": ev.target.left}).slideDown();
    }, function(ev) {
        // hide menu
        $('#category-99-settings').slideUp();
    });
    $('#category-99-settings-gps-activate').click(function(ev) {
        // activate gps
        console.log("geting geo from gps");
        geo_position_js.getCurrentPosition(function(gpsobj) {
            console.log("gpsinfo: %o", gpsobj);
            $('body').addClass("working");
            $.get("backend/geolocate.php?gps=" + JSON.stringify(gpsobj), function(geodata) {
                $('body').removeClass("working");
                formatGeo(geodata);
                window.putGeoJsonToStorage(geodata);
            });
        });
    });
    $('#category-99-postalcode').keyup(function(ev) {
        // geolocalize from postal code
        var t,v;
        t = $(this);
        try {
            v = parseInt(t.val(), 10);
            if(v < 999) return; // we need 4 digits
        } catch (e) {
            return;
        }
        console.log("geting geo from postalcode %s"+v);
        $('body').addClass("working");
        $.get("backend/geolocate.php?postalcode=" + v, function(geodata) {
            $('body').removeClass("working");
            formatGeo(geodata);
            console.debug(geodata);
            window.putGeoJsonToStorage(geodata);
        });
    });
    var selectTimeout;
    $('#category-99-select').change(function(ev) {
        // geolocalize from select list, after a short wait
        console.log("geting geo from select list");
        window.clearTimeout(selectTimeout);
        selectTimeout = window.setTimeout(function() {
            // create a minimal geo object (look to backend/geolocalize.php for details
            var geo = {county: parseInt($('#category-99-select').val(), 10) - 100,
                       countyname: $('#category-99-select :selected').text()};
                formatGeo(geo);
                window.putGeoJsonToStorage(geo);
            },
            500);
    });
});


Hyphenator.languages.de = {
	leftmin : 2,
	rightmin : 2,
	shortestPattern : 2,
	longestPattern : 12,
	specialChars : "äöüß",
	patterns : {
		3 : "2aaa1äa1ba1da1g2aia1j2aoa1öa1p2aqa1ßa2ua1xä1aä1bä1dä1gä1jä1k1äqä1ßä1v1äxä1z1bibl21cac4h1cic4k3co2cs3cu1cy1de1did1ö1due1be1d2eee1fe1ge1ke1me1pe1ße1te1üe1wey1e1z1fa1fä1fe1fi1fo1fö1fu1fü1fy2gd1geg1lh1j4hl2hnh1q2hr4hsh2ü2hwh1zi1a2iä2ici1d2ifi1ji1si1ßi1üi1x1ka1käkl21ko1kök1q1ku1kü1le1li4ln1lo1lö1ly1ma3mä1me1mi1mo1mö1mu1mü1my1na1nä1ne1nin1j1noo1b2oco1d2oi2ol2omo1qo1vo1xö1cö1dö1e1öfö1k2önöo1ö1ßö1tö1vö1wö1z1pä1php1j1po1puqu42rc1re1ri4rnr1q1ru1rür1x1ry1sa1sä1sc1se1si1so1sös1t1su1sü1ße1ßiß1j1ta1tä1tet1h1ti1to2tö2ts1tu2tü2ua4ucu1h2uiu1ju1lun1u1q2usu1wu1x1üb2üc2üdü1gü1ß2ütü1zve2v2r2vsw2a2wnw2rw2ux1a1xe1xix1jx1q2xyx1zy1by1dy1ey1gy1hy1jy1ly1py1ry1vy1wy1yza2zä2zu1zw2",
		4 : "_ax2_äm3_en1_eu1_gd2_he2_in3_oa3_öd2_pf4_ph4_ps2_st4_th4_ts4_um3_ur1_xe1a1aba3au2abaab1ä1abd1abf3abg1abh2abi1abkab1l1abnab3r1abs2abü1abw2aby1abz2ac_2aca2acca1cr2acu4ad_1add5adjae2ca2eka2etae2xaf1a2afe2afia2föaf1u2ag_2agaagd12agmag2n2agt2ah_2ahsa1huah1wa1hyaib3ai1eaif2a2ilai3o2ak_2akb2akc2akd2ako2aks2aku1akza1laa1lä2ale2ali2aloa1lu4aly2am_2amäam4ea2mö2amu1anb2ane1anf1anh2anj1anl2ann2anoa1nö1anra1nü1anwa1nyao1ia1opa1or2apea2pfap3lap2n2apra3pu2ar_a1raa1rä1arb2are2arf2arh2ari2arr2arua2rü2arv2ary2asc4asea2söaße22a1tata1at2cat2h3atmat1ö4atra3tü4atz2au_2aub4auc2aue2aug2auj4aum2aunau1oaup22aux2a1ü2a1vav4a4avia2vr2a1wax2e2a1zaz2oäb2sä1ckä2daä2dräd2s2ä1eäf3läf3räf2säg2näh1aä3hi2ähm2ähsä1huäh1wä1imä1la2äleä1lu2ämläm2s2än_2äne2änsä1onä1paär1aär1äär1c2äreä1rö2ärtä2saä3suät2häu1cä2uf1äug4äulä2un2äur1äuß3bah3bal3basb2ärb2äs4b1bb3bebb2sbbu12b1cbch21be_3bebbe1c3bek3bel1bem3bet3bew1bezbge3bib2biz24b1j2bl_b2leb2lo3blü2b3mbni2bo4abo2cboe1b1op2böf2b1qb2r43brä3brü4b1sb3säb5scb4slb2söbss2bs2t4b3tb5teb4thbt4rbtü1bu2fbü1c2b1v2b1w3by1by3pca1h3camc4an2c1c2cec2cefce1i2cek1cen1cerce1s1cetce1u4ch_2chb2chc2chd2chf2chg2chh2chj2chk2chp4chs2cht4chü2chv4chw2chzci2s4ck_ck1ack1ä2ckb2ckc2ckd1cke2ckf2ckg2ckh1cki4ckk2ckm2ckp2cks4ckt1cku2ckw1cky2ckzco2cco2dco4rcos4co2u2c1qc2r2cre2cst24c1tcti43da_da1ad1afd1ag2d1cd3dhd5dodeb4de1cd1ei3demdes1det2dga2d3gld3hedi2e2d1j2d1ld3ladni23do_d1obdo2o2d1qd2r4d3rid3rö2d1s4dsb4dsld2södss4dst42d1td2thd3tidto2d3tödt3rd3tüdu2fdu1idu1odur2dus33düf3dün3dür2d1wdwa22e1aea2ce2ade2ape1ä22eba2ebl2ebre3bue3cae1ce2eclec1s2ected2eed2öe3dyee1ce2edee1eeeg2e1eie1ene2ete2ew2ef_2efa2efe2efi2eflefs22efue3gee2gn2egue1hee1hi2ehme1hoehs2e1hue1hüeh1we1hy4eibe4idei1ee2ilei1p2eire2it2e1jek4a1ekdek4nek2oek4r2ektek2ue1lae1lä2eloe1lü2elz2ema2eme2emm2emüen1aen3f2enie4nre4nten1ue1nüe1ny2e1oe2odeo2ve1ö22epee3pu2e1qer1ae1räer1c2ereer3h2eri2eru2esbes2c2esfes3l2esmes2ö2esp2esres3ze3teet2he3ti2etoe3tö2etre3tü2etz1euke1um2euneu1p2eut2eux2e1ve3vo2ewae3wä2eweew2s2ex_3exp2exu1exzey4neys4ez2wfab43facf4ahf2alf2arf3atfä1cf1äu2f1cfe2c3fet3fewf1ex3fez2f1fff2efff4ff3lff2sfid2fi2r3fis2f1jf2l22fl_1fläf3löf4lü2föf2f1qf2r2f3ruf3rü4f1sf3scf3sifs2tf2süf3sy4f1tf2thf3tö3fugf1umf2ur3fut2fübfü2r2f1v2f1w2f1zfz2afz2öfzu33ga_ga1cga1kgäs5gä4ugbi22g1cg1dag1dog1dögd3rgdt4gd1uge1cged4gef4g2el3gen4g1ggg3lgg4r2g1hgh2egh1lg2hugh1wgi2m2g1j2gl_g2lag2lä2gls2glug2lyg1n22gn_g2nag2no2gns2gnug2nüg2nygo4a2goggo1igo1y2g1qg2r4gse2g4slgso2gsp4g4swg3syg3tegt3hg3tigt4rgt3tg3tügu1cgu2egu2sgu2t2gübgür1güs32g1v2g3w3haah1ahh1aph2as2h1c2heahe3x2hi_h1ia2hikhi2n2hio2hiph2ishlb4hld4hlg4h2lohlt22h1mh2moh3möhm2sh2muh2nähn2eh1nu2ho_2hodhoe22hoih2on2hoo3hov1h2öhö2ch4örhr1chr3dhrg2h2rih3rührz2hss24h1tht1ah2thhto2htt2h3tühu1chu2n2hurhüs32h1vhvi23hyg3hyphz2ahz2o2ia_i2ab2iaci2afi2ahi2aj2ial2iani2apia1qi3aui1ämiär2i1ät2i1bib2oib1ridt4id2ui2dyie1ci1eiieo2i1exif3lif3rif2s2i1gi2gl4i1hi3heih3nih3rih1wi3i2ii4gii4s2i1ki2kni1la6ilbilf22ilo2im_2imo2imt2imu2inein3fi1nö2inpin1ui1ny2i1oio1cio2dion2i2ori2oui2ovio2x2ip_i1pai1pei1pr2ips2ipu2i1qi1räir1cir2e2irki1ro2is_2isei2sü4itäi3töi3tüi3u2ium12i1v2i1wi2xaix2eix3t2i1zi2zöja1c2jatje2aje1cje2gjit3joa3jo2iju2kjus33ka_ka1ck2adka2o3kaskär2kby42k3c2keoki1ckik4ki3o3kir2kiz2k1jk2lek1lu2k1mk2n4k3nek3nu3knü3komk2onk2osko2wkö2fk1ölk2r42k1skst42k1tk2thktt2k3tüku1ckuh12kübkü1c2k1v2k1w3la_laa21lad2laf2lawlä1c3läd2läf1läs4lät1läu2l1blb2slb2u2l1c4l1dld3rl4dsldt4l2dü3le_2lec3ledle2e3leh2leple2u3lev2l1f2l1gl3goli1clid2l2ie3lig2limli2o2lir3liu4l3j2l1klk2llk2s2l1lllb4llg4llk4ll3t2l1mlm3plm3tlnd2l1nul1nü3loe3lok2löd4lög4löß2l1plp2fl3pu2l1q4l1sl2st4l1tl2thl3til4tsltt2l3tü1luf4luo2lur3lux2lüb5lüd2l1v2l3wly3cly1u2l1zl2zöm1abma1f3mas3maßm4aym3br2m3c2m1dmd1ameb43mehme3o3mesmeu12m1h3migmi2o3mit2m1jmk4n2m1lm3lam3li4m1mmmd2mmm2mm3pmm2sm3ni3mohmom2m2on3mos3motmo2umo1ymö2c4mökm1öl2m1pm2pf2m1q2m1sm3säm3scm3semss2m2süm3sy2m1tm2thm3tömts1mtt2m3tümt3zmu1a3mun2müb3mün3müt2m1v2m1wmwa2my1amy4s2m1z3na_n2acn2ag3nas3näs2näu4n1cn2ck2n1dn2dön2dü3ne_2necn1efne2l3nenne2one2un2ew3nez2n1fnf2änff4n3finf4lnf4rnf3s4n1gngg4ng3mn2gnn3hän3hen3hu3nian4ie3niknin1n2ip2nitni3v3nix2n1k4n1nnn3fn3ni3no_no1cn1of3nov3noz2nödn2öt2n1q4n1snsp4n3sy2n1tn3tin3ton3tön4tsn3tü1nud3nuenuf21nug1nuinu2n2nup2nur1nut1nuu1nuz3nü_3nüs1nüt4n1w1nyh1nyr1nys1nyw2n1znz3so4aco4adoa4go4aho2aro2aso4ato5au2obbob2e1objob1l2obüo1ceo1ck2odrodt42o1eoe2bo2ecoe2doe2hoe2lo2eso2etoe2x2ofa2ofiof3l2ofo2oft2o1go3ghog4nogs2o1häo1heo3hio1hooh1soh3to1huoh1wo3ieo1imo1inoi4roi1t2o1j2o1kokt2o1lao1läol2io3loo1luoms22ona2onä2onc2oneong2o1nuon3v1onyon3zoof2o1opo1or2opho1pi2oplo1pr2or_or1aor1c2ore2orf2orh2orm2orq2orr2orso3ruo2rü2orw2osios1po3sy2o1t4oteot2hot2i4otoo3tüo1uh2oulo1um2our2ouv2o1ü2o1wo3wiox2aox2eo2xuo1yoo3ziö1b2öbs3ödi3öf3lög3lög3rö1heö1huök2s3öl_öl3söm2sön2eö3niön2sö1nuö1peör1cör1oöru4ö2sa2öseö2spö3suöt2höze31paa1pacpag41pak1papp2ar2paß1pat1pau3päd3pär3päs2p1b2p3cpda41pe_pe2a1pedpei11pel1pem1pen3pet4pf_pff4pf3r2p1g4ph_ph2a2phä2phb2phf2phgph2iph2l2phmph2n2phöph4r2phs2phzpid23pik1pilpi2o3pip3pispku22pl_3pläp4lo2p1npo1c3podpo2i3pok3polp2oppo2wpo3xpö2c2p1ppp3lppt2p2r2p4rä2p1s4ps_p3sep2söps2pp2st2p1tpt1ap3tep2thp3tiptt2ptü4pt3zpu1apub42puc2pur3put1püf2pülpün22p1v2p1w3py1pys4py3t2p1zr1abr2afr2alr2apr1arr2as2raß1rat1raür2ax4räf4räg2räh2rämrä2u2r1brbb2rb2orb2srb2urby4r1cer2ckr1cr2r1dr2dördt43re_2reäre1e3regre2u2reür1ew3rez2r1frf2är3ferf2u2r1grgt4r1h22rh_2rha2rhä2rhö2rhsr2ie3rigr2isr2it2r1j2r1krk4n4r1lr3lar3lerl2or3lörl3t4r1mrm2urnd4r3nern3frng2r3nirn1ör1nur1nür1nyro1c3roir2on4roßr1ök1röl4röpr1örrp4arp4erpf4r3por3pu2r1rrrb2rr1cr3ru4r1sr3sorss24r1tr3tir3tör4tsr3türt3zru1a3ruf2rumru2n3rut4ruz2rüb2r1v2r1wry2c2r1zrz2ö3sa_s1an3sats1aus3av3säls2ci4scl2sco3see3seq3set2s1hsh2as3häsh3ns3hösh4rsib43sig3sio2s3j4sk_sk4a4skbs3kesk4lsk4n4skö4skss3läsl3bs3les3li4sna4snö3so_so1c3sogso2h3somso3o3sos3sov3sowsö2csö2fs1öks1ös1sp2s2pä2spl2spt4spy2s1q6s1ss3sessp46st_s2ta2stb2stdst2e2stf2stg2stj2stk2stl2stm2stns2to3stö2stp2stqs2tr3stü2stv2stwsu2nsu2s3süc3sün4s3v2s3w1s4ysyl12s1zs3zü2ß1c2ß1d2ß1f2ß1h2ß1l2ß1mß1o2ßst22ß1tß3ti2ß1ü2ß1v2ß1w2ß1z3ta_4taatah22tam3tav3tax4täbtä1c4täd3täe3täg2täh4tämt1äptä2st2ät2täx4t1ct3cr3te_t2ef2teh3ten3testet22th_2thcth2eth2i2thk4thö2thp2ths2thü2thvt2hy3tig3tik2tim3tio3tip3tis3tiv2t1jtl4e4t3m3to_to1c3tod3ton3too4toß3tow4töftö4l3tön4tößtpf42t1q2tr_try1ts1ot2söt3sy4t1tt3tit3tot3töt3tut3tü2tub3tuc2tud3tue4tuf2tuh2tuk3tus4tüb3tüf3tüm4t3v4t3wtwa21ty13typtys44t1ztz1äu1amu1auu1ayu1ämu1äu2u1bub2lub1r2u1dud2s2u1eue2cu2eguen1u2ep2uffuf3luf3r2u1gu2glugo3u2göu2güu3heuh1wu1ieu3iguk4au1keu1kiuk4nuk2öu1krulg4u2lü1umf1umg1umk1uml4ummum3n1umr1umz2un_u3ne2ung2unku3no1unruns21unt1unw2unzu3ofu1pau1piu1pr2ur_u1raurd2u1rou1röur3purt2u3ruurü2u2sü2u1ß2u1tu3teuto1u3töu3tüu1ü2u3v4ux2eux3tu1ya2u1zuz2e2übc2übdübe2üb3lüb3rüd3rüf3lü2gnüg3süh1aü1heüh1iüh1sü1huüh1wü1k2ül1aül2cül4eü1luün2sünt2ü1nuü1peü1piür1aürr2ür2süs2ava1cvas2v4at2v1b2v1dve3bve3cve3dve3hve4ive3over1ves3ve3v2v1g2v1hvi2cvig22v1k2v1l2v1m3vol2v1pvs2e2v3t2v1v2v1w2v1z1waa1wag1wah1walwa2p3was1wäh1wäl3wäswbu22w1c2w1d1weg1wehwe2i1wet2w1g2w3h1widwi2ewik21wil2w1k2w1l2w1mwn3s1wohwot21wöc2w1pw3ro2w1sws2t2w3twti21wucwul4wus21wühwül4wün32w1w1xa_1xaexa2m2x1b2x1cx1emxen33xes2x1f2x1g2x1hxib4xi1cxi3gxil12x1l2x1m2x1nx1or4x1p2x1r4x1txt1äxts21xu12x1v2x1w3xy_3xys1yacy1ary1äty1c2yd4ry2efye2ty1f2ygi2yg2ly1i4y1k2yl3cynt2y1nuy1ofy1ouypa2ype2y2pfy3phypo3y3riy3royrr2ys2cyse1ys2py1t2yu2ry1z2za3cz1ad3zahz1anz1arz1asz1är2z3czdä13ze_zem22z1hzi2o2z1jz3la3zolzo2oz1orz1öl2z1qz3saz3shz3skz3sz2z1tz3tiz3töz3tüzu3azub4zud4zu3kzuz22züb2z1v4z1zz3zizz2ö",
		5 : "_ab1a_ab3l_abo2_ack2_ag4n_ag4r_ag2u_ai2s_al2e_ang2_an3s_aps2_as3t_au3d_ät2s_bik2_by4t_dab4_de1i_de1s_eke2_enn2_epi1_er1e_erf4_er1i_ers2_es1p_et2s_eu3t_exa4_ext4_fe2i_fi2s_ga4t_ge3u_im3s_inn2_jor3_ka2i_ki2e_kus2_mäu2_ne2s_ni4e_nob4_nus4_ob1a_obe2_om2a_or2a_ort2_ozo2_pro1_ro4a_ro3m_rü1b_sch4_sha2_te2e_te2f_te2s_ti2a_ti2s_tit2_to2w_umo2_un3d_un3e_un3g_un3s_ur2i_ut2a_ut3r_übe4_vol2_vo4r_wa2s_wi4e_zi2e_zwe23aa1caa2gr4a1an4a2araa3reaart4ab2äuab1ebabe1eabei32abel2abew3abfiab1irab1it2ableab3liab4loa2bo_ab2ofa2bona4bräa2bre2abs_abs2aabst4ab3sz2a3buab1uraby4ta1cem2ach_ach1a2achba1che4achfa1chiach3lach3ma1choach3öach3ra4chtach3ü2achv2ada_ad2agad1an3adap4adav1a2dä2ade_2aden4a3diad2obad3ru2ads2ad3stad3szad2t1ad4tead4tiad4tr2a1e1a3e2da3e2ia3el_a2eliae2o3a2faka2fana3faraf4ata2faua2fexaf2fl2af3la3f2oafo1saf3raaf3räaf3reaf3röaf2spag1araga3sag1auag2daag2diag2duage1i2ages1aggr2a2glag4laa4glöag3naago2b2agorag4roag3säags3p2a1ha2a1heahe1sa1h2iahin3ah2löa1hom1ahorah1osa2h3öahr1aah3riaht3said2sa3ik_a1indain4ea1ingai2saais2iais2pais3saive3a3ivla3ivs2akalak4at4a1kea2kes2a1ki2ak3lak4li2a1kr3akroak3sh2akta2aktba2kun4a3kü2ala_al1abal1afal1ama2larala4s2alatal1aual1ämalb3sal2däal2drald3sal3dualen1ale2pale4t3algialk3s3almba2l1öal3öfal2ös1alphal2ufa2lumal1ur2am2aamab4ama3gama1s2ame_a2meba3meta2mew2amir4amml2am2sam3saam3sp3amt_am4tö2anaba3nad2anam2anana3natan1äs4and_2andua3nee2anfian3fu4ang_2angf2angoang1r2ank_an3klank1ran2ky2anmu3annäan1oda3nolan1ora3nos2anshant2i2anto1antr3antw2a3nu2anzb2anzg2anzs1anzü2anzwa1os32a3paa3pela3phäapo1sa2pot3appla3ra_ar2abarad22arb_2arbiar2bl2arbr2arbt2arbu1ar1card2ia2reaa4rega2reha3renare3uar2ewarf1rar2glar2gnarks4arm2äarms4arn2e2a1roar1oba3rolar1opar2rh2arsa2arsi2artoart3r2artsar1uhar1umarwa2ar2zä4arzeas3aua2s1äa2scaa2sebas2era3ses2asisa2s1pas2phas2pia3spuas2stas3teas3tias3to2astraßen3at1adat4agata3la3tamat1aua2t1ä4ate_a2tebate1cat2ei4atena2tep4atesat3haathe13athl4a3tiat3räat3reat2saat2siat2soat3taat2tha3tubat2zoatz3tau1a2au2draue2bau2faauff41aufnau3ha4au1iau2isau3lüaums2aun2eau1nu2ausc1ausd1ausg1auslau2so1ausü1ausz2aut_2aute1autoauz2wawi3eax2am2a1yaa1yeuaz2a3ä2b3lä1cheä1chiäch3lä2chrä1chuäck2eäf2fläge1iäge3sä2g3lä2g3räg4ra1ä2gy2ä3heähl1aähl2eäh3neäh3riä3is_ä1iskä2k3lä2k3rälbe2äl2bläl2p3ämt2eän2dräne1sän2f5än2glän2gr2ä3niänk2eän2kränk2säp2pläp2präp4stäre2när2grärk2sär3meärm2sär4spär2stär2thä5s4eäse3tä2s1päs4tr2ä3teätma3ät1obä2t3rät2saät2säät2siät2trät2zwäu2bräude1äuf2eäug3läu2maäun2eäu1nuä3us_äu3seä3usnäu2trba2bl2babsba2da2b1afba2kabak1r2b1amb1ang2banlban3tb1anzbar3bbard2bar3nbarz2ba2scbau3gbau1sba1yobben3bbe4pbb2läbb2lö2b3d4bde1sbe3arb2ebebedi4be1eh3bef4be3g2beib4beil2be3libel3t1ben_ben2iben3nbe1ra3be1sbes2pbe1ur2b1ex2b5f4bfal22b1g22b5h2bhut2bibe2bie2sbik2abil2abi2lubi3nabin2ebi2o1bio3dbi3onbiri1bi3seb1isob2it_bi2tu2b1k4b3lad3blatb3leb3blem3blenb3leub2lie2bligb2linb3lisb2litb4locb3los2blun3blut2b3n2bnis1bo5asb1ob3bo2blbo2brbo3d2bo2ei2b1ofbo3febo1isbond1bo2nebor2sb1ortbo2scbo3thbo2xibö2b32b1p2bpa2gb4ra_b4rahb4ralbrä4u2bre_3brea2bregb3rekb4rer2brigb4rilb4riob3rohb4ronbru4sbs3arbsat2b4särbs2äubs2cabs4cub3se_bse2bbsi4tbs2kubso2rbs2plb3stobtal3b4ts2bu2e3bu3libung4b2urgbu2sabwel32b3z22c1abca3g2ca2pece1nuce3sh2ceta2chac3chaoch1äs1chef4chei2chic2chil2chl2ch2lech2lu2ch2m2chn22chobcho2fch1ohch2r22chra2chrech3rh2chuf2chuh2chum1cka_2ckac2ckal2ckehck1im4ck3l2ck3nck1o22ck3r3c4l2clet4co3dictur6cu2p32d1ab2d1acdagi4da1inda1isda3löd1altd2an_dan2cd1ang2danh2danwd1anz2d1apd2aph2darbda2rod3arrda2rud2arwda1s2da3shdas4t4datmdat2s2dauk2d1äh2d1äpdä3us2d1b4dbe2edbu2c2d1d2ddar2de3brde4cade1e2de3g2deh2ad2eic2deinde2löd2en_de2nadend2de2nide1nu2deolde3osd4er_de1rode3rude2spdes3sde2sude1unde3usd1exi2dexp2d1f42d1g2d2ge_d3gem2d1h2d2hisdi2amdi1cedik2adi2obdi2spdist2di2tadit3sdi2tu3di5v2d1k4d3l2edli2f2d3m22d3n2dob4ld2obrdo3na2dope2dopfd2opp2dorc2dord2dorgd2orp2dortdot4hdö2l13d2ördös1c2d3p2d3rai2drädd4räh4dre_2dreg4drem2d3rhd4ri_d4ried4rifd4rikd4rild3robd3rocd4roidrom2d3roud5rubdrü1bd2sandsch4d3seids2had4shed4shidso2rd2späds2peds2pods2puds3std3stad3stod3strd2sundta2dd5teadt3hodt5s2du1ar2d1uhd1um1d2um_2dumb2dumd2dumf2dumg2dumld2ump2dumr2dumvdung42dunr2duntdus4c2dü4b2d1v22d1z2e3a2beab3lea2g4ea3gaea4geea3gleakt2ea2lae2ameeam1oea2nae3ar_ea2rae3arre3arveas3se3atheau2fe3augebe2i2ebeleb2en2ebeteb2läeb3loeb2lö2eb2oebot2ebö2seb4rueb2s1ebse2ech1äech3lech3mech3ne1chuech1weci2ae3d2aed2dre3deiede2red2gee3d2oeds3tedu2see3a2eeb2lee2ceeede3e1effeef4leef3seeh2aee1imeel2ee1empeena2e2enäe2enbe2ence2enoeen3se2enwee1rae1erde1erke1erlee1roeert2e1erzee3taee2the1e2xe2fate2fäuef1emef2er2eff_1effief2flefi2s1efkuef4rüef3soe3funeg1d4ege1ue2gloeg3nieg2thegus32e1hae3hal2e1häeh2eceh2ele3hereh1läeh3loeh3mueh3naeh3rieh3sheh3übei2blei3de2eidn1eifrei3gl2eigt2eiguei2kl2eil_eil3de1impei4näeink4ei3o2eip2fei3ree1irr2eitäei3teei2theitt4e3ke_e3kene3kese3keye3k2le3k2wela2cel1afela2sel2da2ele_elea2ele2c2eleh2elei1eleke3lepe3let2elev1elf_el3feelf4l1elfm1elftel3leel3naelö2selto22e1luel1urelu2se2lyaema2kem2daeme2ieme2se3mone2mop3empfem2saem2stem3t21emul4ena_2enac4enahe4nake2nap2ene_ene2c2enem2enen2enesenf2aenf2uen2gl1engpe3nice3niee3nioe3nite2nofen1ohe3noteno2w2e1nö4enpuen3sp1entb1entd1entnen3tu2entü1entw1entz2enut4enwüeo2b1eo2fee3on_e3onfe3onle3onre3onse3opfeop4te3orbe2o1se3os_eo1ulepa2gep3leep2paep4plep2prept2aepu2se1ra_era2ge1raie2rake1rale1rape2rare1rasera2ße1rawe1razer1äher1ämerb2eer3brer3da1erdber3de4ere_ere2le3rem4ereserf4rerg2lerg3s2erhüe3ribe3rio2erk_erk3t2ernie1ro_er3oae1roge1roke1role1rome3rone1rose1rouer1oxe1rozerö2de1röh4eröker1öser3p4er3rä2erru2errüer3sker3sner3sz2ertier3uzerü4bes3abe3safes3akesa2vesch2e3se_es2eles2hue2siles3kae4skees3kles3kue3spiess2aess2e2essoes2spe1stre1stues1umetab4et4ag3etapet4atet2auet1ähet2ene3thaet3hüeti2met2inet4riet4shet2stet2thetwa4et2zäet2zweu1a2eu2gaeugs4euil4eu1ine3um_e3umle3umseun2eeu1o23euroeu3speust4eut2heu3toeu2zw4everewä2se2we_e3wirewi2se3witex3atex1er2exie1exis2e3xye3z2aezi2sfab5sfa2dafa2drfaib4fa2ke2fanb2fanf2fanlf1anp2fanrfan3s2fanw2f1apfa3shfa2tof3aug3f4avfa2xa2f1b22f3d4f2echfe2drfe2eife1emfef4lf4eiefel3tf2em_fem4m2fempfe2nafe2näfen3gfe2nof1entf2er_fe1raf2ernfe1rof2ertf1erwfe2st2fexpff3arff1auffe2eff3eiffe2mff4enf2fexff4laff4lof3fluf3flüff3roffs3t4f3g2fge3s2f1h2fi4dsfien3fi2krfil3dfilg4fi3lif2inafi3nifin2sfi3olfi3rafis2afi3sofis2pfi3tu4f1k4f3ladf3lapf4läcf3länf4leef3lerf4limf3lonflo2wf4luc2f3m22f3n2fni2s2f1ob2f1offo2nafo2nu2f1op3form2f1ölför2s4f1p2f4racf5radf5rap2fre_f3rec2fregf4reufri2e2frig1frisf3rocfro2sf3rotf2sanfs3arfse2tfs3olfs1prfs3s4fst2af3tabft1afft1anft1arf3tatft3hoft1opft2s1ft3scftse4ft3stf2tumf3tü1ftü2bftwa4ft3z23f2uhfung42funm2funt2gabfgab4r2gabz2gadlga1flga3gega2kagal2a2ganbgan3d2ganh2ganlgans2g2ant2garb2garcga3ruga2sag3ascga2siga3spgas3sgat3h2gatmgau1cg2aukg1aus2g1äp2g3b2gber2gby4tgd2eng2dergd2esgd3s2ge3a2geb2age1e2ge1imge1irge3lege3lüge3migem2uge3nagen3ggenk4gen3ngeo2rge3p4ge1ragerm4ge1roge3siget2aget3sge1ul2g1f4gga4tgg4log2g3n3gh2rgie3bgie3ggi2elgi2gugi3negi3tigi3tugi4us4g3k2g3lacg2l4e2gle_3gleag3lecg3leg2glehg3len2glesg2lia2glibg2lik4gling2lio2glisg2lizglo3gg2lomglu2t3g2lü2g1m2g4na_2gnacg4nat3g2näg3nehg3ner2gneug2nieg2nifgno1r2gn3t2g1ob2g1ofgol2ago1rago2s1go3th2g1p2g3räng4rebg4remg4rerg3revg3ridgri2e2grig2grohgron2g4rosgro2ug4ruf2grut4g2s1gsa4gg3salgs3angs3arg3säug3s2cg4scagsch4g4scogsen1gs3ergse4tgsi2dg3silg3solgs3plgsrü2gs5s2gs3thg3stogs3trg3stugs3tügs3un2g1t2gti2mguet42g1uhgu1isgus3agu3segu4stgut1a2g3z2hab2ahab2eh2absh1akahaki3ha1kl2haleh1alph1amth2an_ha3nah1ansha2prh2ardhasi1h1äffh1ärz2h3b22h3d4he3behe2blhe3brhe1chhe3fehe3guhe3heh1eieh1eifh1eighe2im2heiohe3lihe3lohe2lö3hemdhe3mi3hemmh2en_he4nahe2nähen3z4he2ohe3onhe3ph2hera2hermhe3roh1eröhert2he3thh2e2uheu3g2h1f4hfi2s2h3g22h1h2hi2achi2anhi1ce2hi3dh2i2ehi2krhimä3h1infh1inhhi3nihi4onhi3oshi2phh2i2rhi3rehi3rihirn1hi3rohir2shis2ahi2sehis2ihis2phi4sthi1th2h1k4h2lach1lash3lawhl1ärh3lebhle3eh3lerh3lesh3lexh2lieh2lifh2liph2lish2lith3lochl1ofhl1oph4lorh3löch3lufh1lüfh3magh3manh4mäch4mähh4mälh4mäuhme1ehm3sahms1ph2n2ahn3adh3namhn3anhn1ärhn3d4h2nelh3nerhn3exh2nich2niehn1imh2niphn3k4h2norhnts2h2nuch2nulho2blho2efho4fahok4l3hole4holo3holzhom2eho2piho1ra2horeh1orgho4saho3slho2spho4st2hot_ho1y2hö3ckhö2s12h3p2hr1achr3adh1raih3rath3räuh2rech3redh3refh3rephre4th3revh3richri4eh3rinh2robh2rofh3rohh3rolh4ronh3rouhr3r4hrs3khr2suhr4swhrs3zhr2thhr2toh3ruhh4rübh2sanh2sauh1stah1stoh1strh1stüh2s1uh2tabh2takht2alh2tarht2ash2tauht1ehh3teth2toph3töpht4riht2soht2sphtti2ht1unht3z2hu2bahu2buhuko5hu2lähu2lohu3mah1umsh1unah1up_h1upshurg2hu3sahut2th4übsh3übuhvil4h2wälhwe1c2hy2thzug4iab4liaf4li3ak_ia2läial3bial3dialk2i5allia2luia2nai3anni3anziap2fi3ar_ia2rai3as_i2asiias3siast4i3at_i4atei3ath1iatri3atsi1är_i1ärsibe2nibi2ki3blai3blei2b1öib3rai4bräich1aich1äi1chei1chiich3lich3mi1choi1chuich1wi3dami2deei2deii2dioidni3i2d3rie3a4ie2bäie2ckie2drie1e2ie2fuie2gaie3heiel3di2elii1elli2elsielt42i1eni3en_ie2näi3endi2enei3enfi3enhi3enji3enki3enpi3enrien2sie1nui3enwi3enzi4eriier3ki1ernie2röies2pi1ettieu2eie1unif1arif4atif1auife2iif2enif2flif4läi1flui1flüif4rai1freif4rüif3seif3spif2taiga3iig3läig4noi3g2oig4raig3säig4seig3soihe4ni4is_i4i3tik1arik1ini3klaik3leiko5si2kölik3räik3reik3soiks2tikum4i2kunil1aui1lä1il2dail2drile2hill2ei1lu2i2lumi3lusil3v4im4ati2meji3men1immo1impoimp4s1impuim2sti4nabin2afina4sin1äs2indri2nedin3eiine2x2ingain2gl2ings2inig2inis2inn_2innlin1odin1orin3suint2hi2odaio3e4iof4li2o3hio3k4i3ol_i3om_i3omsi3on_io3nai2onyi2o1pio2pfi3opsi3or_i3orci3orpi3orsi3orti3os_i3ot_i3oz_i1ö2ki1ös_ipen3i3per2i1piipi2si3p4lip2plip3pui1r2ai3radirat2ir2bli5reeir2glirg4sir2heir4mäir2no1ironiro2sir3seir3shir2stiru3si3saci2scaise3eise2nisi2ais1inis1opis1pais1peis3sais2sti2s3tis4töis4tüi3takit1ani3tatität22itelite2ni2tex1itiii2tobit3rei3truit2sait2säit2soit1uhit2zäitz2iiu3seive4niwur2iz1apiz1auize2niz2eri2z1wja3nejani1ja1stjet3tjo2b1joni1jord2jo2scjou4lju2blju3nijur2ojute1k3a2aka3ar2kabh2kabska1frka1inka3kak1allk3ama3kampka3nakand4kan2e2kanlk1anskanu32kanw2karbk2ardk2argk2ark2karnk2arskar3tkaru2k2arwka3sekasi1kas3t2katt2k1ähkäse3kä1th2k3b2kbo4n2k1d2kdrü3k1effkege2ke2glk1einkei3skeit2ke2läk4eltke2nake2noke2plk2er_ke1rak2erck2erlk1erokerz2k6es_ket3sketz22k1ex2k3f42k1g22k1h4kho3mki3a4ki2elki3liki3lok2imik2in_2kinhk2inik2innkin3skio4skis2pkist2ki3zi2k1k44kla_4kle_4klehkle2ik3les2klic2kligk2link3lip4klizk4lopklö2sk2lötk4neiko2al2kobjkoff4ko1i4ko3leko4muko3nu2kop_ko1pe2kops2kopzko3riko2spko4stko3tako3ti2k1ouk1o2x2k1p2k4raz2kre_2kreg2k3rh2krib3krit2krufkrü1bk2sank2sauk3senk3shok3sofks2puks3s2ks2tik2s1uks3unkt1amktä3skte3ek2texkt3hok3topkt4rokt3s2kts4tkt3z2kul2a4kulpkung42kuntku2roku2spkus3tku2sukür4s2k1z2la3ba2labb2labf2labg2labh3labu2labwla1celad2i2ladm3ladula2falaf3sla2gala2gn2laho1lai12l1al3lalil2amil2ampla2na2lanb2lanf2lanll1anp2lans2larclar3sla2rula2sala3se2lash2lasila2so2laspla4stlat2ala3telat2ilat2s1laug3ländl1ärzlä2sc2läuc2läue3läufl3baclben1l3blälb3lel3blolb4rülb3salb3selb4sklb3splbs4tlch2ald3ablda4gld1all3daml3datld1auld1ärl2deil2dexld2ö2l2dreld4rüld3sald4shld3thl2dumle2asle2bl4leddle3dele3eilef2ale2gäle2gl4lehs4lehtl2eicl2eidl2eitlel3s4lemplem3sl2en_le2nale2näl2enfl2enk3lepa3lepf3leprl2er_lerb4lerk2le1rol1errler3tl1erzle3shlesi1le3sk4lesw2lesyle3th2leto4leudleu2k3leut2lexe2lexzlfe1elf3lolf2trlfur1lga3tlg1d4lg3rel3grolgs3t2l3h2li3acli3arlia1slibi34lickli3da3lie_lig4nli3keli2krli3l2l1imb3limol2in_4lishli2spli3teli3tulk3lolk4nelk4ralk3salk3sälk3sclk3shl3k2ül3lapll3d4ll2esl2lexll3l2l2lopl5lowll3shllt4rllts2llu2fll1urll3z2l2möllmpf4lms2tlm3szl3n4e3lobb2lobjlob2slo1f4lo2fe3lophlo1ralo4räl1ord3lorq3los_lo4sa3loselo2talö2b3l2ö2fl1öhrl1ö4l2lösslp3t42l3r2lre1slrom2lrut4lrü1bl3sexl4shals2pels2pols3s2l3stil3stol3strls1uml2sunlsu3sl2tabltag4lta1ilt1aklt1amlt1ehlt2enlt3hol2toblt1oplto2wlt1öll3törlt1öslt1ötl3trält3sclt2solt1uhlu2drlu2es2lufflu2golu2gu2l1uhlume22lumf2lumll2umpl1umw1lu2n2lunt2lunwl1urnl1urt2luselu2splu2tälüh1l2lymp3ly3nlzo2flz3t2l2z1wm2abe2mabk2mabs2mabtma2drm1agoma2kumali12mall2manbm2anfm2anh2manlm4annm1ansmanu12manzm2app3markmar2om3arzmata2ma3unm1ähnmä1i2m1ärg2m1b4mbe2em2d1äm2deimds2em2dumm2e1c2mecom2eil3meldmell2m2ens2meou3mer_me1ra3mersme4sä4mesumete22m1ex2m1f4mfi4l2m1g2mi2admibi1mi3dami2ermie1smi2ki3milcmi3nami3nimi1nu3mir_3miri3mirs3mirwmise1mi2tami3timi2tu4mitz2m1k2m3k4am3ma_m2mabmm1eimm3simm3spm2mummmül22m1n22mobj3m2odmo2dr4mog_mo3ne3mo2o2moptm1o2xmp2flmp3ta2m3r2m4sapms1asm2saumso2rm2späms2poms2pum3stoms4tümt1abmt1akm3tammt1armt3homt1immti2smt1ösmt2samt2semt1um2m3uhmu3la2mulsmu3namu3nim4unk4munzmu3ramu2spmu2sumwa4rmwel42n1abna2bän3abf4nabgna3bina2bln2abo2naddn2adena2dr2n1af3n2ahn3ahnnai2en3air2n1akna2ka3nakon3aktn2al_n4alena2lu4naly3name3namonam4s2nanbn1and2nanh2nani4nank2nanln1anp2nanr2n1ar3nar_n2ard4narg3nari4narmn2arpn3arzn2as_4naspn4ata3nate2natt2n1au4naufn3aug5naui3n2äcn1ähn2n1ännär4sn1ärznä2scn2ässn1äus2n3b4nbes2nbu2sn3cenn3cernch3mnd2agnd1aun2dein2dobnd1opnd1orn2drönd3shnd2stnd3thndt4r2neaune2bl3necane1ckne2de2nee3ne3g43nehm2n1ein2eidne2kenel3bne3lin2em_n4en_n2enbn2encn2enhne2nine2non2envn2enwne3osne1ranere2n1erfn1erh3nerin1erkn2erpn2erv3n2esne2sänes4cnesi1ne4thneu1cneu3g2n1exnexa4nf1aknfe2in4fo_nft2onft4sn2f1ung1adng1d4n3ge_n3gefng2enn3glän2glon2glöng3neng3tsn2gum2n1h2n3hann3harn3haunhe2rni3atnib4l2n1idni2deni1elnig2anig3rnik3t3n2ilnim2oni2obni3olni3os3n2is3nita3nitäni2tinit4sni3tun3kalnk2amnke2cnk2lonk2lunk4nank2öfn2kölnk3ti4n3l22n1m4nna2bn3narnn2exnn3g4n2nofnn3senn2thnn1ur2nobm2no2dno3drnol2eno3na3nor_nor2a2norc3norh3norm3norsn1ortno3shno2spno2täno2tr2nö2f2n3p4npa2gnpro1npsy32n3r2nre1sns1ebn3sexn3siln4sphn2sponsrü2ns3s2ns2tunst2ün2styns2umnt2alnt1ämn3tärnte1ent1ehnt2enn3ternteu3nti3cnti1tntmo2nto1snt3sants2onts2pnts2tntum4nt3z21nu3anu4alnubi11nu1cnu2esnu2fe2n1uhnu3k4n2um_2numf2numg1numm2numr2numz2nuna4nuntnurs41nu2snu3scnu3senu3slnus1pnu2ta2nü4bnür1cnürs22n1v2n3ver2nymu2n1yon2zadn2zann2zarn2zärnz1ecn2zornz2öln2zwön2zwu2o3a2oa3deo4a3ioa3keoa4kloa3seob2alo3bar2o3biobi4t2o3boob3roob3skobs2pobu2s2oby4och1ao1cheoch1ioch3loch3moch1ooch3roch1socht2o1chuoch1wo3ckeo3ckio2ckoock3to3d2aod2dro3debode2so3diro2donodo4so2dre2o3duoe2n1o3etsof1amof1auof2eno3ferof2fuof1laof4läof3raof3räof4rüof3thoga3dog2glog2loog3spo1h4aohl1aoh3looh2lu1ohngoh2ni1ohnmoh2noo2h3öohr1aoh1ro2o1hyo1i2do2isco1ismoki4ool2arol4droler2ol2flol2glol2grol2klolk3rol2lu3olymo2mabo2mebome3co2melo2mepom2esom3maomtu3o2naeon1apo3natone2ionen3on3f2ong4rong3son3gu4o3nion3k2onli4on3ne2ono1ons1pon3taont2hont3s2onukoo2k3oo2tr2o1ö22o1paopab4opa5so1peiope2no1pes2opf_o2pfeopf1lop3li2o3poop4plop2pr1opsiop3sz1opt2op3tho1ra_2orakor2amo1raso3r2äor3ätorb2lor2ce4orda1ordnor2do2ordr2ords2ordwore2aore2hor1eror2glor2gn2orgr2oritork2aork2s2o1roor1opor1or2o1röor3rhor3saors2cor2ufo3s2aos3ados4anosa1sos4co2o3seose2no3s2kos2loosmo3os2saos4säost3hot1äro2tebote2so3theotli4ot2oroto1sot3reot3scots1pot2thotz2eou2ceou2geouri22o3vi2o3voo3weco2xidoy1s42o1z2ozon1ö2bleö2b3röch1lö2chröch2söcht4öd2stöf2flöh3leöh3riö2ko5ö2k3röl1a2öl1eiöl1emöl1imöl1inöl3laöl1o2öls2zönn2eön3scön3spöpf3lör3a2ör2drör2glör2klör2trös2stös3teös3tröt2trpa2drpa2elpa3ghpa1ho1pala1paläpa3li2palt2panlpapi23para1parc2parg2parppa4stpat4cpat4epat4rp1auf3pä2cpät3hpä2to2p1d2pea4rpech1pe2en2pef42peicpe1im1peitpena4pen3zpe1ra1perl3perope3sapes3sp2fadpf3aip3fe_p2feipf3lopf3lup2forpf1ra2pfs2pf3slpf3sz2pf3tpgra2p1hopphu4s2p1hüpi2a3pias4pi2elpi4em3pierpi3lepin2epi3oipi2pe4pisopi1thpit2s2pitz2p1k2pkur11p2l23p4lap5la_p5lad2ple_p4legp4lemple3x2pligp4likp4liz2p3lu2p1m22p1ohpo3id2poilpo3li2pondpont2po2plpo3pt2pornpor3spos2epo3ta3potepö2blpöl4sp2p1hp3phopp1läp2plep2pripp3sa1prak1prax1präd1präg3präm3präs4pre_2prec1pred1preipri4e2prig1p4ro2proc3prod3prog3proj1prüfps4anp3s2hps1idp3stapst3rps2tu3p2syps2zept2abpt3atpte4lp2tospto2wp2t3rpt3s2pt1um3p2typu2dr2p1uh4pundpun2s2puntput2spwa4rra2ab2raacr3aalra3ar2rabd2rabfra2br2rabs2rabt2rabw1rabyra1cer2ack1r2ad3radf3radl1ra2era3erra3gera2gn4raht2raicra3ke3raküra3le2ralgr4aliralk2r4alsr3altra2lu3ralyra3mar2amer2amir2amm2ramt4ranc2ranf2ranl2ranr2rans2rapfr2arar2arkr2arpras2ar4at_r3atlrat4r4rau_4raud2rauf2raug3raum3r2äd3rän_3räni3räns2r1ärrä1raräu2s4räutr2bakr3blärb2lörb4rirb3serbs1orb3sprch3lrch3mrch3rrch1wr2dafr4dapr2deir3donrd1osrd4rird3tard3thrdwa4re3adre2amreb1rre2bür2ech4redd3refe4reff3refl3refo5reg_rehl4r1ehrr2ei_2reigr1einre2kere3larel2ere3lorelu2r4em_r2emi4remur4en_re2nir2enz3repe3repo4reppr1erfr1ergr1erkr1erlrer2nr1erör1ertr1erwre2sa2ress3rest3resu2reta2reulre2wi4rezirf4lör3flürf4rurf4rürf2sarf2targ2abr3ge_r3gerr3gesrg3lurg3nar2ha_r3her2rholrhu2sri2amria1sri3at4rickri1elri1euri2frrif3s5rig_5rige5rigjrig3l4rigrrik1l2rimpr2ina2rink3rinn2rins2rintr1inw2rion4r1irris2ari3so3rissrit4r5riturk4amrk4lork2lurk2sprk2umrku2nrle2arle2ir3l2irli2srm3d2rmo1srmt2arna2brna4nr3natrn3drrn2ehrn2eirne2nr5nesr4nexr3nodr1nötrn1ur2robj1robo2robsro3e4roh1lroh3nro1irro3lerol3s2roly4rom_4romm4romt3ronnrons2ro1nyro3phr2oraro2ro1rosero3shros2pro3tu3rout3römir2ös_2r1p2r2plirpro1rps3trr2abrr2arrr1ämr3r2er4rewrr2herrik2rrn3arr2str3r2ürrü1brs2anrs2aursen1r3s2irs2klr4skor4skrrs4nor3stor3strrs2turs4türtal2rt1amrt1ärr2thirto1prt1orrt2sart2sorube2ru2drru2fa3ruinru1isru2mi4rumz2rund4runn2runwru3prrur1eru2strut3hru2toru2zwrü1ch4rümmrves4ry2l3rz2anr2zarr2zasrz1idrz1oprz3terz2thr3zwä3s4aa2s1abs3abbsa2besa2blsa2br4sabss1adm3safasa2fe3sagasa2gr3s4ai2s1aksa2ka3sal_s1all3s2am5samms2an_s2and2s1apsa2po3sapr2s1ar3sar_3saris3arrsat2as4atesat2i4satmsa2trsa3ts3sau_3saue3saum3saurs3auss3ähns1ält2s1äm2s1är3s2ät2säuß4s3b4sba4nsber22scams2cans2cap4s3ce6sch_s4chä4schb4schc2schd2schf2schg2schh2schks4chl2schp2schq6schss2chu3schü2schvsch2w2schz3scor4s3d4sde1sse3adse3ap4sedese2els1effse2glseg4r3s2ehse3heseh1lseh1sseh3ts1ein3s2eks2el_s2elns2elsse3mase2näse2noseo2r3ser_3seraser3gs1erh3seriseru25ses_2s1ex3sex_se2xe4sexpsex3t4s3f4sflo44s3g2sha2k4shals3h2e3shidshi4r3showsi2adsi2am2siat5si1c3s2iesien3si1f4sig4nsi2grsi2klsik3tsi2ku3silos2in_sion43s2issi2sasis3s3s2itsit3rsi3tusive32s1k24skam4skass4keps2kifs2kig4skirski3s3skiz4skom4skor2s1l23slal4slan2s3m21smog2s3n4snab4so3et3softs1oheso3la3s2onsone23sor_s1orc3sorsso4rus4os_3s4oz2spaa4spaks2pan4spap3spaß2spat4spaus2paz3spähs2pee2spel4spet4s3pf2sphas3phe2sphispi2k4spil3spio4spip4spis4spla4splä4sple2spod2spog2spok4spol4spr_3spru2s3ps2spun2spup3spur4sput4s3r4srom2ss1acs5safs3sagss1ajs3sals3s2äss1ecss2erss4ess4s3ls3spiss3s2sst2ass2tis3sto6sta_3staast2ac4stag3stah2stakst1as2stax3s2tä4stäg2st3c4ste_2steas2ted4stees2tegs2tel2stem6stens2tep2ster4stes2stetst3ev2stex4s2ths4thist3ho2stia2stibs2ticsti2e2stig2stiks2til2stio2stip4stiss2tit2stiv2sto_s3tobsto3d1stof4ston4stoo1stop3stoß4stou2stow4stoz4stöns4tör1stub4stuc2stue3stuf3stuhstu2n2stus1stüc1stütsu1ansubs23su1c2s1uhsu1issult2s2ume3summsu4nes1unf4sunt3s2upsup3psu2rasu3sasus1esu3sh2sü2bsü2d1süd3usweh24swie4swilsy4n34s3zas2zes4szets2zis4s3zu2ß1a22ß1b22ß1ec2ß1eiße2naße2niße2noßer3t2ß3g2ßig4s2ß1in2ß1k4ßler32ß1n22ß1p22ß3r22ß1s22ß1um5taan4tab_t1abb4tabf2tabg2tabh2tabkt3abnta2br4tabsta2bü2tabw2tabz2t1ac3tacutadi33taf_t1afgt1afr3t2agta2gat3agotai4r2takzta2latal3d3talo2talt3tameta2mot1amt3tan_4tanb4tandta3ne4tanf2tang3tanit2ank4tanlt1ans2tanwta3or2tapfta2pl4tarb2tarkta2ruta3sa3tasct1aspta2tht3atlt4atm2tattt1auft1auk3taum4tägyt1ämtt2är_2tärm2tärz4tätt4t3b2t3chat3chetch2itch3lt2chutch1w4t3d4tdun2te2a22teakte3alte3an3tebat2ech2teckte1em3teha3tehä3tei_teik43teiltekt23tel_3telg3telk3teln3telp3tels3tem_3tema2temmtem3st6en_te2nät4enbten3gt4enhte2nit4enjtenk2t4enmten3nterd2t4erit4erot3erötert2teru2t2est4tetl3teuf3teumte1unte2vite1xa4texp3text2texz4t1f44t1g2tger22th2at2hag2t3hät4he_2thebt2hec2theit2hen3theot2hest2heut3him4th3l4th3m2th3n1t2hot3hoft3horthou22thub2thylti2adtia2m3tib4ti1ce2tieb2tiehti1elti2er2tießti1etti1euti1fr4tiftti2kl3tilgti2luti3nat1inf2tinkt1insti1nuti1rhti2spti3tutium2tive3ti2za4t3k44t3l26t5litmal22t5n4to4asto5at4tobjtob2l3tok43tole2tomg3topo3tor_to1ra4torct1ord3tore3torsto2ruto3scto3shto4sktos2p4tossto1ßu3totrtots23t4ou3töch4t1ökt1öst4t3p21t2r43trag3trak3tral4traß3träc3träg4träs4träß4trec3tref4tregt4remt4rert4reut3rev2trez2t3rh3trie3triot4rip3triu3tro_3troe3tront4rop3troyt3röc3trös3trua4truktrum2t4rübt4rügt4sabt3sacts1adts1alt2sants1ast2sauts1änts3ehts1emtsen1ts3krt3soltso2rt3sout2spät2spht2spots3s4t1st4ts3thts2tut2s1uts3untt1abtt2actt1akt3tantta1st3telttes1tt3rütt2sotu1antuf2etuff3tul2at2um_2tumf2tumg2tumk2tumr2tumz3tun_2tund3tungtun2i2tuntt1up_tu2rätur1c3turntu2rotu4rutu2satu2sotu3ta3tüch3tür_tür1c3türe3türg4tütztwi4ety2pat2za4tz1agtz1altz1aut3zestz1int2zortz2thtzug4tz1wätz1witz1wuu1a2bu1a2cuad4ru1al_u1alfu1alsual3tua2luu3ar_u1arsua3sauat2iu3b4iu2bopub3räu2bübu1ce2uch1auch1äu1cheu1chiuch3luch3much3nu1chuuch3üuch1wu3d2au2donud3rau3druud3scue2enu2elaue2leueli4ue2miue2naue2näue2nouer3ou3erru2escue2tau3fahuf1akuf3aru3fasuf1auuff4luffs4ufo2ruf3säu2fumug1afug1akuga4sug1auug3d2ug2glug3huug3laug3läug3lou4gluu2g3nug1orug3roug3seug3siuh2auuhe3suh1lauhr1auh3riuhrt4uh2ruuh4rüui2chui1emu4igeu1in_u1insu1k2luku2sul1abul1amula2sul1ämul2drule2nule2tu2lexul5f4uli2kul2knull3sulo2iul1or2ultaul3thult3sum2anum2enum1irumm2aum2suum3t2um2un2una_1unabun3acun2alun3anun3at1unda1undd1undf1undn1undv1undzune2bung5hun2grungs3u2ni_un2idu2nifun2imuni2r2unis3unkuunna2uno4run2osun3se1unsiun3skun3spun3taun3trunt3su1o2bu3or_u3orsu1os_uote2u1pe2uper1up2faup2plup2prupt1oup4tru2rab2u1räur1änurch1ur3diure2turf3tur1imurk2sur3oau3rolur1oruro1sur3teur2zaur2zäur2ziur2zous4eluske2u3sohus1opus1ouu2spou2spuus3tru1stuut1egut2eiut2esut2etu4tevutfi4u2thiu2thuuto3cu3tomuto3nut2orut3rüuts2put3teutts2ut2zo2u3u2uz1weuz3z4über3ü1cheüch3lüd3a4üd1o4üd3s2üdsa1üd3t4ü2f1aüfer2üf2flü2f1iüf2toü2g3lüg4stühl2eüh3moüh3neühn2süh1roühs2püh3teül2laül2loü2n1aün2daün2dründ3sünen3ün2faün2frünn2sün3scün3seün3spüp2plür2flür2frü1ro1ür3scür3seürt2hüse3hüse3lüse1süs2stüt2s1üt2trütz2e2v1abval2s2varbvat3t2v1auve3arveau1ve3lave3leve3love3maven2cve3neve3nive3növer3averd2vere2verf4verg4ve3river3kvers2vert2ver3uve3tavete1ve3trve3x22v1f2vi3arvi2elvima2vi3v22v1obvo3gavo2gu2v1opvo2r1vor3avor3dvo3rivor3kvor3ovors22v3ra2v3re2v3rov1stav3s2zvu2et2vumfwa5gewa2gnwa3gowai2bwa3nawa3sawa3sewa3sh2wängwäs2c2w1b2we2baweb3swe2e4weed3we2flwe3niwerd22wergwe2röwer2swe2spwe4stwet2s3wettwie3l4wing1wi4r3wirtwi2sp1wisswi3th1wo1c3wolfw3s2kwun2s4wur_wur2s2xa2b1x2adxa1fl1x2ag1x2as4x1d2x1e4gx2em_xens4x2er_2x3euxich2xide2xil2axi2loxiso2xis3s2x1k22x3s2x2t1ax2tänxtfi4x2t1ux1u2ny1al_y1a2myan2gy1anky2chiych3ny2es_yes2pygie5yk3s2y4le_yli4nyl3s2y2l1uyma4tym3p4ympi1y2n1oyno4dy1ontyp1any4p3sy3r2eys3t4y3s2zy3to12z3abzab3l2z1afza3geza3gr2z3akzale3za3li2z1amza3noza3ra2zarbza3reza3ri3zaubz3aug3zaun2z1äc3z2äh2z1äm4z3b4zbü1b2z3d2zeik4ze3me5zen_zen3nze2no3zentz1ergzers2ze3sczes3tze2tr2z1ex2z1f42z1g2zger2z2henzhir3zi3arzig4szil2ez2in_zin2ez2ing2zinhz2innzi3opzirk22z3k42z1l22z1m2zme2e2z3n4znei32z1ofzo2gl2z1oh2zopezo2ri2z3ot2zö2f2z3p42z3r24z1s2zt3hozt3s2zu4chzudi4zu2elzu3f4zu3gl2zumf2zumg2zumlzun2ezung42zuntzu3s4zu3t2zür1cz1wac2zwag2zwahz1war4zwäl2zweg2zwet4zwir2z1woz1wörz1wur2z1wüz3z4azze3s",
		6 : "_ab3ol_ab1or_al3br_alt3s_ampe4_an3d2_angs4_ans2p_ans2t_ari1e_ark2a_ar2sc_au2f3_au4s3_be3ra_ber2e_boge2_da4r1_de2al_de3sk_ehe1i_ei3e2_ei2sp_ei4st_ei2tr_el2bi_elb3s_em3m2_en4gl_en2t3_en4tr_er2da_ere3c_es3ta_es3to_es3tr_eu3g4_eve4r_flug1_for2t_fu2sc_ge3ne_ger2e_ges4a_guss3_he3ri_kamp2_kopf1_le3ni_li4tu_lut2h_mi4t1_näs1c_no4th_ohr5s_oper4_oste2_ost3r_poka2_ram3s_reli1_rom2a_rö2s1_sali1_se3ck_sen3s_se2t1_ski1e_ta2to_tehe3_te3no_te4st_ti2d1_ti5ta_tite4_to2ni_to4pl_tu3ra_tu3ri_uf2e2_ufer1_un3a2_uni4t_uns4t_ur3s2_ver3s_vie2r_voll1_wah4laa2r1aaar3f4aat4s3ab1eilabe2laabe2na2a3berab1erkab1errab1erzab1ins1a2blaab5lag1a2bläab4le_3a2blö2absarab3s2iab3s2p2abst_ab3ste1abteia1chalach1eia3cho_ach1ora1chu2ach1uf4ach1wa1ckarack2enack2seack3sla3d2aba2da2mad3amaade2ra4ade1sades4sadi3enad4resa2f1eca2fentaf1erlaf4fluaf3s2aaf2t1aaf2teiaf2t3raf2tura2f3urag1a2bag1a2dage4naage2saage2seage4siag4ne_a2g3rea2g3riag4setag4spoag3staag3stea2gundahl3a2ahl3szah4n3aah3r2eahrta4ain3spai3s2eais4se2a3kam1a2kazaken2nak1ernak3rauak5tan2aktikak2t3rak3tri2aktstal1a2ga3lalaalami5al3ampal1anaal1ansal1anzal2armal3arral1asial1assal2b1lal2bohal2b3ralds2ta4l1eha2l1eia4leina2l1ela2lengal1epoal1etaal1etha2l1eua4leur3a2lexal2glial2imbali4naal1insalk1ar1alkohal2laball1anal3les1allgäal1opeal3sunal2takal3tamal2tatal2trialt2seal1umbama3d2ama3stame2n1a2meriame3rua4mesea4mesh2ammalam2meiam2minam3stram2t1aam2t1äam4telam2t3ram4tream2t1ua3na3canadi3an1algan2dexand2suand1uran1e2can2ei_an1e4kan1erban1ethanft5san2gan1angeb2angie4angs_2a3n2i3a4niman2keian4klö3an3naan3n2ean2seuans1paan3s2z1anteian3t2h2anwet1anzeian2zwiar3abta2r3alar1ans2a2rara2r1auar2bauar2bec2arbenar2brearbrü32arbs2ar2danar2droar1effa2reinar2erfa2reriar2erwa2r1imar1insar1intar2kalar2korar2kriark3saark3shar2nanar1o2da2r1orarre4narr3he2ar2star3t2ear2thear2trear2z1was1alaa3schea3schiasch1la2schma3schua3s2hiaska1sas3panas3s2aass4auas3s2ias2s1pass3tias4stoas3stras3stu2as3taas4tauas4tofast3räas3triaswa2s3a2syla2t1abat1apfa2tausat3eiga2teliater3nati4st4atmusatra4tat3romat2s1pat4takat4tauat2teiatt3s4at2zinat2z1wau2bliau2bloau2briau3en_auer4nauf1an2aufehauf1er3aufga4augehau2m1oaum3p2au3n4a2au3r2au2sanau2sauau2spr2auts4ava3t4äch2späch4stäch3teä2d1iaäft4s32äh3t4äl2l1aämi3enäne2n1äng3seän2k3län2s1cänse3häp2s1cä2r1eiä3ren_är1eneär4s3iär3t4eärt2s3äse3g2äser2iäskop2ä3s2kräs6s1cäs2s3tä4s3t2äß1erkä2t1a2ät2e1iätein2ät2s1pät2s3täum4s1äu2s1pbacks4b1a2drbah2nuba2kerba2k1iba2kraba3l2abal3thba3n2aban2drba3n2eban4klban2kr2b1ansba2reibar2enbar3zwba3s2abaum3sbau3sp3b2ä1cbbens2bb3lerbbru2cbe3a2nbe2delbe1erbbe3etabei1f4bei3labe1indbei3scbeis2ebeit2sbe3lasbe3lecbe3leibe4letbel3label3szbe2nalben3arbe3nei3ben3g2bentbbent4r2bentwben3unben3z2ber3ambe2ranbe3renbere4sber3nab1erntbe3rumbe3s4abe3s4lbe3s4zbe2tapbien3sbi2kesbi2lau2b1inb2b1inf2b1intbi2solbi4s5tb2it2abi4turb2itusbla3b4b2latt2b3lawbläs1c3ble2a2b3legb3leinb3leseble3sz2blich3blickbo3ch2bo2lanbon2debo1r2abo4rigbo4s3p2b3radb4ra3k2b3ref3b4rem2b3repbri2er2b3rolbrust3bru2thb2s1adb3sandbsatz1b3sel_bse2n1b3s2esb2s1ofb3s2pubst3acbs3tätbst3erb4stodb4stübb2s1unbu2chibul2la2b3umkbu3r4ibu2sinbu2s1pbu2s3ucha2ck2ch1ak3chanc4chanz4char_3characha2sc3chatoch1ärmche1er3chef_3chefich1eimch1ess2cheta2chinf2chinhch1insch1int1chiruch1offch1orcchre3s1chron2chunt2ck3ancka4r14ckeffck1ehe4ck1eick1entck1erhck2ern2ckeseck1ind2ck1upcussi4da2b1a3d2abäda2ben3d2abldal3b2d1amma2d1amt2dange3d2ankdan4kl2d1ansd2anze4danzida2r1a3d2arld2ar3s4d3atld3a2to4daush2d1ämt2d1änd2d1äng2d1ärz2d1effdehas5de3he22d1ehrdein2ddein2sdel1ändel1ec2delek2delem2delfmdel2sodel3t4de2mag4d1emp3d2enhden3th2dentwde3onod1epi2de2rapder2bl2derdbde3recderer3de4ruhde4rumde2s3ade3sacdesa4gde4samdes2äcde4sehde2seide2sende4setde2sinde2sorde3spede2sto2d1etwde1urlde2xisdgas3tdge4tedha1s4di2ch1di3enidie2t5dil4s32d1imbdi3n2a2d1ind2d1inf2d1inh2d1ins2d1intdion3sdi4re_di2rendi2ris2d1irl2d1isrdi2t3rdkuri2dle2radmess62d1o2fdo2mard2o3rado2rie3d4ra_2d3rad2drahm3d4ramd3rand2d3räud4rea_d4reas3d4rehdrei3td4reiv4d3ren2d3rep4d3rer4dres_d4resc3d4ria2d5ricd5riegd4rin_2drindd4risc3d4rit4dritu2d3rod2d3rotdrö2s13d4ruc2d3ruh2d5rutd2sau2d2s1änds2eigd2serhds1errd2s1imds2infd3skulds1orids1pasd2sprods3tabd3steid3steld4stemd3s4tid4stodd3s2tuds1umsds2zend4theidtran22d1ufe2du2me2d3umk2d1unfdun3kedun2klduns3t2d1url2dursadwest3eadli4e3aleieat4e2eater3eat3s2eb4leue3blieeb4reaebs3paeb3staebs3thebs3tieb3str2e3cheech1eie2ch3rech3taech1uheck2areck3seede2aledens1ed2s1ped4streed3s2ee3lenee2nagee3n2ie1e2piee3resee1r2öe1ertree3r2ue2e3s2ee4tate2e3u2eewa4re2f1ade2fente3f4lu2e3f2oef3romef2tanege2raeg4saleg4stoegung4eh1anteh1auf1e2hepehe1raeh1inteh1lamehl2e2eh5lerehl2seeh2reieh1ro2ehr1obehr1ofeh1stee2hunt2ei3a2ei2barei2choei2d1aei3dra4eien3ei3g2aeig2er2eigew2eigrueik2arei3kauei2larei2laueil3f41eilzuei2moreim2plei2n1aei4nasein5deein3dr2einfoein3g2e1initei2sa4eis2ineis2peeis4thei3stoei2sumei2tabei2tanei2tarei2troeit3ume2l1akel1ansel1anze2l1apel3ariel1asiel1aspel2ast3elbiseld3s2el1eine2l1el1e2leme3lem_el1empel1erfel1erkel1erle2lerr2eles2el1esse2l1ideli4neel1itael5le_ell3spe4l1ofe2l1orelo2riel2sanel2sumel6tarel4tinel2t3re2l1umel3usee2m1ade2mans3emanze2metie2m1imem1intemma3uem2meiem3pflem2spr4e2namen4ameen3aree3natien3atte3nauee2n1ären4ce_en2dalend3siend3szend2umen1eche2neffe4neine2n1el4ener_e2nerfe4nerhe4nerk1engad3engagen3g2ien3gloeng3rieng3seen1i4me2n1inen2ingen3k2üen1o2be2n1one2n1open3sacen2sebens2el1ensemen2simen3skaens2po2enstoent4agen2thien4tid3entlaen2zwa2e3p2ae3p2f42epist1e2pocep4taler3admeraf4aera1frer3aicer3alle2rampe3ranee2ranher3anoer3apfe3rarie3ratie2ratme1rauber3aueerau2fer3augerb4sper3chlere2cker1effer1eiger1elee3renz4erer_e2rerke4rerl4ererne3reroer1errer1erse2rerter1esser1eul1ergol1erhabe2riat4e5ric4e3riee3rik4er1inber1inker1inser1inter1ita1erklä2erkreer1o2be2r1ofe1r1ohe2r1opers4auer5sener3smoert2akert2auer2thoert4raerts2eeruf4ser1u4mer1underung42erweges4aches3anze3s4ase4satoes3cape3schae2se2bes3ehres3eines3erfes3erzes3evaes2hares3intes2ortes2pekes2sau2es3sces3s2ies2sofess1paess2poes3stu1estase1state1stele1stiles2ture1s4tüet1a2metari1e4teineten3det3halet3heieti2tae2t1ofetons4et3rece2treset2seiet3stuet2t1aett3auet2teiet2t3ret4troett3szetze4seu4neie3un2geu2nioeu1staeu1stoeu1stre2vent1e2xeme2x1inex2tinfa2chof1aderfa3l2afal2klfal3tefalt2sfan2grf1an3zfar2brfarr3s3f4artfa3s4a2f1auff1ausb2f1ärmfä2ßerfeatu42f1eckfe1inifek2tafe2l1afel2drfe2lesfe2l1ofer2anfe2rauferde3fer2erf1erfaf2erl_f2ers_f2f3efffe1inff1rakf3f4räff3shoff3strfid3scfi2kinfik1o2fi2kobfi2lesfi4linfil2ip2f1intfi4s5tfit1o2fi2tor2f5läd2f3läufli4ne1f4lop1f4lot1f4lug2f1orgfo3rinfor4stfor2thfor3tu2f1o2xfra1st1f4ränfreik22f3ricf4risc1f4ronfro4nafs4ammf2s1asfs1e2bf2s1erf2si2df2s1o2f3spanf3s2plfs2porf2sprefs2prifs2pruf2stasf3steifs4tref2s3unft1a4lft1eigft1eisf4theif2t3rof3t4rufts3a4ft4samft4sehfts2tift1url2f1unffun2klfun2kofus2safzu4gaga2b5l2ga2drgal3lo2g1amtgan2gr2g1armga3r2og1arti2g1arzga4spega4sprga3t2a2g1auf2g1aut2g1ärzg3d2adge3g2lge2in_gein2sge2intgein2vgei3shgelb1rge5lehgels2tgel3szge3lumgel3z2ge4narge4natgen1ebge3necgens2egen3th4gentwger2erger3noge1r2öge3r2ug2e1s2ges4amge2serge3sesges4pige3ste2getapge3t2ugge2ne3g2het3g2hiegi3alogi2e1igie1stgi4mes2g1indgin2ga2g1ins2g3lag3glanzgläs1c4gläuf2g3leb4g5lerg3lese3g2lid3g2lie2g3lif4glisc3g2lit3g2loag3loch3g4lok3g4lop3g2lotgoa3ligo3n2a2gonis2g1ope2g1ordgra2bigra2bl2gradl2g3rah2g3rak2g3räu2g5re_2g3rec2g3redg4re2eg3reitg3rese2g3ret2g3ric3g4rif2gring2g3röh2g3rui2g3rumg3run_3gruns3g4rup2g3rücg3s2ahgs3a2kg4saltgs3ambgs3augg4s3crgs5erkgs4piegst2akg3starg4s3täg5stämg3stelg1steugs4thag3stirg4stolgst4ragst4rig4sturgs4tücgu1ant2g1u2f2g1unfg4ung_gunge2g4un4s2gunt2gurt3sgus4stha2choha2delha4dinh1adle2h2al_ha2lauhal2bahal2lahalt3rh4a3rah1arm_har2thh1arti2ha3sa2haufmh1aukthau2schau2trh1echthe3ckehe2e3lheere2heim3phei4muh1einkhe1ismhe1isthe2l3ahel1eche3len4h1emphend2she2nethe2nobhenst2hen3szh1entshe3rasherb4she2relh1erfüh1erkeher3thher2zwhe1stahe2strhe2tapheter2he3t4she1x2ahfell1h1i4dihi3enshier1ihil2frh1induhi3nelhin2enhin3n2hin3s2hl1anzh1lauth5len_hlen3ghle2rahl1erghl1erwh4lerzh4lesihl1indh3listhlo2reh3losihl2sanhl2serhl3skuhl3slohme1inhmen2shme2rahme1sth3nachh3natihn3eighn3einhne4n1hn1unfho2ch3ho2ckaho2f3r4holdyho2leihol3g4ho4lor3hol3sh3o2lyho2medho4sei2ho2w1h1raneh3rechh4rei_h3reich3r2enhr1etah4rinehr1insh4risth4romeh2r1orhr2sanhr2tabhr2tanhrt3rihr2trohrt2sehr1umsh2s1ech3s2exhs2penhs2porh2spräh2sprohst2anh1stech1stelhs3theh1s2tih2storhst3rih1stunht3alth4ta2mh2ta4nht3aneh3tankh2tasyh2t1ärht1e2chte2heh2teifh2temph7ter_h2t1euh2t1exht3henhthe3uh2tolyh2trith2t3ruh2t3rüht2senhts2tihu2b3lhu4b3rhu2h1ahu2h1ihuk3t4hu2l3ahu2lerhu2lethung4shu3ni1hus4sahus2sphu2tabhu3t2hhühne4h3weibi4a3g2i3aleiial3laia2lorial3t4ial3z2i3a4taibela2iben3ai2blisib4stei2bunki2buntibu2s1ich1eii2chini3chloi2ch3ri3ck2eid2ab4i2d1auidel2äiden3gide3soi3d2scid2s1pie2b3lie2b3rieb6scie2choie2fauief3f4ie2f3lie2froie4g5lie2g3riegs3cie3lasiel3auiel3sziel3tai3emeti3e2naiena2bien1ebie3neri3en3gie2nimi3e2noien3scien3siier3a2ie2radie2rapier1ecie3resi3ereuierin3i3ern_ier5niiers2eifens2if1ergif1erhi1f4lai1frauif4reiif2topift3szig1artiga1s4ige4naig1erzi2g1imig3reiig4salig3sprig3staig4stöig3strigung4i2h1umi4i3a4i2k1akik1amtik1anzik3atti2k1aui2k1äri2k1eiike2l1ike2rei2kindikot3ti2k3raik2t3ri2l3abil1a2di2l1akil1ansil1aspil3ausi2lautild2eril2d1oil1e2cil1eheileid4il1einilen1ei2lerrilfe3sil2f3lilf4s3i2l1ipi3lip_i3lipsil3l2ail3lenil3leril3l2iil2makil2mini2l1oril2seril3t2hilung4il2zarim1alli2manwi2melei2melfi4meshi2metiim2meiim1orgim3pseim3staimt3s2imul3tin3a2ci2n1adin2arain2arsin2dalin2dan1indexind4riin3drü1indusi2nehein2erhi2n1euine3un1info_in3gla1inhab2inhar2inhaui3nitzin2nor1inntaino1s2in1ö2dins4aminsch22insenins2id1insta1insuf1integin3t4ri3n2umin3unzinvil4inz2e2io2i3dio4naui3ons3ion4stiore2ni2o3s2ipi3elipi3en1i2rakiral2sir2k3lirli4nir2makir2mumir4narir2nerirpla4irt2stis3arei2sau2i2s1äni3schei2schmis1chyi2s1crise3haise3hiisen3si2serhis2hasi2s1idis3indis3infis2ingi2s1ofis1org3i2soti2sparis1picis2piti2sprois4sacis4sauiss2pois3staiss3tris3stuis2sumis4tabis4tamist2aniste4nistes3is4teuis4tocis5törist4raist3rei3struit1ab_ital1ait1altit1a2mi2t1aui3tauci4taufi4t1axi2t1äsi2t1eii4teigit2eili4teinite2lai4tepoi2t1init2innitmen2i2t1ofit3rafit3rasit3rauit3räuit3ricit3romit4ronit3runit2speit2stoit2tarit2tebit2triitt2spi2t1umi2tunsit1urgit2z1wi2v1aki2v1ani2v1eiiv1elti2v1urizei3ci2z1irjahr4sja3l2ajean2sjek2trje4s3tje2t1aje2t3hje2t3rjet3s2jugen2kab2blka2ben2kabla2kabläka3b4r2k3adaka1f4lkaf3t2kaken42kala_kal2abka3leikal2kakal2krkal4trkan2al2kanda2k1angka2norkan4thk2anz_2k1apf3k2araka3r2i2k1armk2arp3kar2pfka3tanka3t4hka2t3r4kaufr2k1auskau3t22kautok1ä2mikä2s1ckdamp22k1e1cke2he_2k1eic2k1eig2keinhke2lan4keletkell4e2k1empken3au2kenläkens2kken3szk2enteken3thk2entrk2entu2kentwke2radke2ranke2rauker2nak1e2seke4t3ake4t3hki3d4rki1f4lki1f4r2kil2a2k1intkis4tok3leitk3lem_2k3ler2k3leukle3usklit2s2k3locklo2i3klost4klung42k1lüc2k5nerkno4bl2k5norkol2k5ko3n2ekon3s2ko3r2a2k1orckot3s22k3radk3rats2kraum2k3rät2k3rec2k3refk3reick3reihk3ries3k4ronks2allks1e2bks2eink2s1emk4sentks1erlk3s2hik2s1idk2s1ink2s1o2k2s1pak3s2pek2spenks2pork2stork2sträk2stumks2zenk2t1adkt1aktkt1anzkta4rek2t1auk2tempkte3ruk4theik2t1idkt1innk2t1ofkt1opekt4rankt3rask4trefktro1skt3run2k1uhrku3l2eku3l2i2k3umlkum2s1kun4s4kunst3kur2blku2reikur4spkur2stlab4ri2l3absla2ce_2l1advla2giola2k1ila1k4l1lammf2l1amtlamt4sla4nau3l2andlangs42lanhä2l3annl2ant_2lantrlan2zwl3artilast1olau2fol2aufz2lausl2lauss2lauto2l1ähnl4betal2b1idl2b3lil4bre_lbst3elb4stol2b3uflch3lel3d2acl2d1akld1ammld3aril2delel3der_ld1erpl2d1idl2d1imldo2r2l2dranl3d4rule3arilech1ale2gaule3g4r4l1eigl2eindl2eine2leinkl2eint3l2ela3lemeslem2ma2lengll2e2nolen3szl1ents4lentzlen2zil2e1rale2raul1erfol2erfrl2erfül2erkal2erkol4ers_lers2klers2tl2erzales4amle2saule1stolet4tu2leurole2xisl2f1ecl3f4läl3f4lulgen2alge3ral2getili3chili2ckalien3sli2grelik2spli3m2ali3n1a2lindu2l1inflings52l1inhlin2kal2ins_l2insal2insc2linsp2linst2l1int2l1invli3s2a2l1islli3t2ali4talli1t2hlit1s2lit3szlk1alpl3k2anl3kar_lken3tl2k3rol2k3rulk4stüll1abbll1affll1aktl3l2alll3amall2anwll1anzll1armll1arzll3augl2l1ämll1echlle3enl2l1efll1eiml3l2eml3len_llen3al3ler_lle2rall2errl2lerzll1impll1insl2l1ofll1opfl3lor_l3lorel2l1oul2l3öfll3s2kll2sprll3szellti2ml2marclm1indlm1inslm3steln3a4r3l2ob_lo2ckulo2gaulo3h2e2l1ohrlo2n1o2l1orclo3ren2l1orglo4skelo4stelo4thr2l1o2v2l3öfelpe2n3l2p1holrat4sls3ampl3sarel2sau2l2s1emls3erels1ergl2serhls1erlls1erwls2logl3s2pil2sprol3s2pul3st2alstab6ls4tafl3steil3stells2tiel4stitlstro2l3s2tuls2zenlta4lal4tamelt1andlt1angl5tarblt1artlt3atol2t1aul5ten_lter3alt4erölte2thl2t1eul4theiltimo4l2t1ofltra3llt3räul2t3rel2t3rol2t3röl2t1umltur1altu2ri4lu4b32l1ufeluf2trlu2g1alu4g3llu2g3rlug3salug3splu1id_2l1una2l1unf2l1unilu2s1ulu2t1alu4teglu2toplu2t3rlü3ckel2z3acl3z2anlz2erklz1indm2ab4rma2ge_2m1aggma3g4n2m1aktma2lanma2lau2m1aldman3d2ma2netman4nam2ans_2mansc2mantwmanu3s2m3arbmaro3dma3r2uma1strma2tanma2telma2tromat3sp2mausg4m1ändmä2renmee2n12m1eif2m1eigme2lekme2lermelet42melf_mel2semel3t43m2en_mena2bme2nanmen3armen3glme2nimmen4skmen2so2mentnmer2er3merin2me3shmes2stmeste2mien3smi2kar2m1impmin2gaming3smis2sami2t3rmit5s4m2m1akm2m1almm1angm2mansmm1anzmma1stm2m1aumme2namme2samm1inbmm1infmm1inhmm1insmm1intmmi3scmm3stamm3strmmüll1m4nesimo2desmo2g1amo2k1lmon2s32m1opemo1r2a2m1orcmor2drmo2rermos4tampf3limpf1orm2s3anmsch2lm4s1efms1erwms1inims1orim2spedm2spotm2sprom3stelm3s2tim3s2tum3s2zemt3aremt1eltm2t1eum2tinsmtmen2mt2sprmu3cke4m3unfmu4s3amu2s1omut2s3mvoll1mwelt34n3abh4n3abs4n3abtna2ch13nachmnach3s3nachwna1f4rna2gemna2h1ana2letnalmo2na2lopnal2phn2als_nal3t4n2amenna3m4n2n3amtnamt4s2n1an_4n1ang2n1ans4n3anwnap2sina2r1an2arle4n3artna3r2unasyl2na3t4hnat2s1nat4sanat4sc3n2auln2auso4nauss4nauswnau5te2n1ä2m3nä1umnbe2ernbe2innber2en2d1akn2danlnd1annn2danzn5der_nde2sendo1stn2d3ren2drobnd3rolnd3rosn2druind2sornd2spr2n1ebnne2ei4n1e2henehe2r4n1ehr3neigtn3einknek3t42n1ele4nelek4nelemne3lennel4la3ne3lo3ne3lu2n1embn1e2mi2n1emp2n1emsnen1ecnen3einenen14nengb4nengs4nengtnens4enen3sk4nentn5nentrn1ents4nentz2n1epone2pos3n2er_ne2rapne2rau2nerfü3nergrn2erlin1ermän2ern_ne1rös2n1errn2ert_n1ertrne2rup2n1erzne2s1one2s1pne1stanes3tine2tap2n1eupnfalt4nf5linng2absn2g1acn2g1akng1andng1anzn2g1älngen2an3glasn2glicng4setng4stünich1sni3de_nie3b4nie4n3ni3eneni1eroni2grenig4spni2kalni2karni2kleni2k3r4n1imp3n2in_n2in4a4n3ind2n1inf3ning42n1inh2n1ins4n1int2n1invni2s1eni2s1pni3spinis3s4ni2s1uni3tscn2k1aknk4amtnk1anzn2k1ärnk1inhnk3lenn2klienk2lisn2k3ronk3s2znk2taknk2tannkt1itnk4topnk2trunkuri2nmen2sn2nadann1alln2n1annn2ensnn2erhnne2rönner2znne2s1nne4stnn1o2rnn3s2pno2bla2no2feno1rakno3ral3n2os_n2ostenost3rno3tabno2telnot3ha2n1o2x4n1ö4lnräu3snre3szn2salln2sangn2santn2saufn2sausn2s1änns1e2dn2s1epns1ergn2serhns1ersn2sethnsfi4lnsho2fns1i2dnsi4tensi2trns2kaln2s1opn4spatns2peins2penn3s2pins4piens3ponn4sprän4spron3starn3statns2tiens2tinnstü1bn2s1unnt1angn5tarbnt1arkn3tarznt2aufn2t1äunte3aun3t4ebnte3g6n2teignt4enent4entnt4ernnt4ersnt4ertn2t3hon3t4huntini1nt2insntmen2nt3recnt4rign5tropn2t3rünt4saunt2sto3n4tu_2n3umb2n1ums1nung43nung_n3ungl2n1uninu2t3rn2z1aun2z1ännze3rinzi2ganz1inin2z1wäoa3cheo4a3lao4a3mioanne42o3be_ob3einob1iteo2b3li2o3bloob3s2hob2staoche4boch1eioch3ö2och3teoch3toochu2fo2ckarock4shock3szode2n1odene22o3diaof1a2co2f1eiof2f1a1offizof2f5lof2f3r2o1f1rof2s3aof4samof2speof2sprof2s1uof2teio2g1eiohen3soh3lecohl1eioh3lemoh3lenoh3lepohls2eoho2lao2h1opoh4rinoimmu4okale4ok2s1po2l1akol1antolars2ol4damol1ei_ol1eieol1einol1eisol2lakol3lerol3lesol3lusolo3p2ol1ortol4strol2z1aol2zinom2anwom1arto2m1auo2m1eio2meruom1erzomiet1o4munton3arbon3auson3d2aon2e3honens2on1ergon1eröon3g4lo4nikro4n1imon1ingonlo2con1orconsa4gon2sebonse2lon4stüo2p1adop1aktopa3u2op2f3aop3fahopf3laop1flüopi5a4op5lago2p3le2o1ralor4altor3attor3ändor2baror2damor2dauorde2lor2deuor2dumor1eigo2reino2rerfor1ethor3g2a2orget2orgiaorgi1eor3gle2o3rico3rier4o5ril2orin1or1insor5ne_oro5naor2stuor3s2zor2tauor2tefor3teror2theor4tinor2torort3reo4r3uno3scheo2s1eio3s2hio4s3kao3s2pooss3anos4seios2s3oos4sonos2s1pos4s3tost1anosta4sost1auos4teioster1os3tilo2s3toost3räost3reost1ufo3s2zeo2ß1elota2goo3tarko2t1auot3augotei4not4em3otemp2ot3helo2t3hio2t3hoot3i2mot1opfot3rinot4spaot2tauot2t3rou4le_o1undsove1raoviso3owe2r1öl3z2wöp4s3tö2r3ecö2r1eiör2ergö2rerlör2erwör2f3lö2r1imörner2ör3s2kör3t2eö2schlö2s1eiös2s1cöte4n1pa1f4rpa1k4lpala3tpa3neipa2neupan3k43pa2nopan3sl3panz4pa5reg1park_par2klpar2kr1pa2ro1partn1partypar3z2pa3s2ppä3ckepät3s4pekt4spe2l1ape3l2ipeli4npen2alpen3dape4nenpe2n1o3pensiper2an1pere2per4na3pers2perwa4pf1ansp2fa4rpf3arep2f1aupf1eimpf1einp2fentp3fer_pf2erwp3f2esp2f3läpf3leipf3lie2p1heiphen3dphi2ka2ph3t2pi3chlping3s3pinse3pirinpi3t2apla3napo1o2bpo2pakpo1raupor4thpo4stapo4stäpos4trp2p1abppe2n1p2p1f4p2p3rap2p3repre2e13preis2p3rer3p4res1prinz4prosspro1stp3steap3stelp3s2tipt3albp4t3ecp4t1eip4telept1urspu2s3tra2barrab2blra2chura2dan2radapraf3arra2ferra3gle3r2ahmrail4l2r3airr3a2kr2raktira2la2ral3abrala4gr3alar3r4aldral3larall2e2rallgr3alp_ra2merram4muramt4sr4aner1rangirani1eran2kr2r1anmra2nor2r1anpr2ans_r2ansp2rantr2r3anwrar3f4r3asphra2stara2t1arat2serat2st3raub_rau2mi2rausgrau2sprau2taraut5srä2s1c3rätser2b1abrba3rerb1artrb1aufrb1echr4belärber2er3b2larbla2dr2ble_rb3lerrb4seirb3skarb4stärb3strr1che_r1chenrch1s2rch3sprch3tar3d2acr2d1akr2d1alrd1amerdani1rd1antrden3drde3rerde3sprdi3a2rdia4lrd1irir2d1itr2do2brd3ratre2altre3at_re3atsre2b1are2b1lreb3ra2reditrei4blreim2p2reina2reinb2reinf4reing2reinh2reink4reinn4reinr2reins2reint2reinw2reinz2r1elbre3lei2relek2r1elf2r1elt4rempfrena2bre2nanren3drren4glren3sar1ense2rentw3r4er_2r1erbr2erbr2r1erdr4eremr4erenr4erer2rerfo2r1ermr2e1rore2robr2erse2rersp2r1erzrer5zer2erzy3r4es_3resolre1stare2stureu3g2re3uni2r1eurrewa4rrf3licrf3linrf2s1ärf2s3tr2g1ahr2g1akrge4anrge2blr2getor2glanr2gleur2g3nor2gregr2gresrg3rinrg3s2prgs4tr3r4he_3r4henrho2i3ri3am_rib2bl4ri1ceri1chari2danri3elsriene4ri3enirien3srie2nuri1er_ri4ereri2f1ari2ferri2f1ori4kla2r1ind2r1infring3lrin2gr2r1inh2rinitrin5ner1innurin2sp3risikrismu2ri4s1pris4sari3t2ir3klaur2k5nurk3räurk3rinrk2s1erks3tirk2takrk2tinrk2t3rrk3trar2k1uhrk1unirl2s1prl3ster2mansrm1anzrm1a2pr2maphr2m1efrm3starm3umsrn2andrn3anirn3arern3arir4nerkr4n1inrn2ingr2n1opr2n1orrn3s2ärn3s2prn3s2zrn3t2ero2bei3rock_r2o3de3r2ohrro2madro2merro2munro3n2aro2ratro2reiro3s2iro3smoro5starost3rro4tagrote3iro2trirots2orö2b3lrpe2rerr1amtrrer4srre2strro3m2rr3sturs3antr3schersch2lrs2endrse4ners1erörs1ersr3s2hors3insrs2kalrs2kanrs2kiers2kisr4sordr3s2p4r4s3phr2stinrs4tobrs4todr3s2wirs2zenr2t1adrtals1rt1angrt1annrt1antr2t1arrt3attrte1e2rt4eifr2temorte2n1rt1erlrt3holrt2humr4tinsrto2rirt3recr2tresrt1rosrt4samrt2sparts2pert2sprrude2aruf2s32r1uhr4r3uml2r1unar2unde2r1unf2r1unirun2kr2r1unl2r1unm4r3unt4r3u2rrus4stru2t3rrü1benrwun3srz1a4cr5zenerz1engr2zergr3z2ofrzug4usa3blesa2chu2s1ada2s1affsa1f4rsa3i2k4s3aktsal2se2s1alt3s4alz4s3amn2s3anbs2an2c3sang_2s3anh3s4ani2s3anl2s3anp2s3anssan4sk2s3anw3s2ara4s3arb3s2ard3s2ars4sarti4s3ath4s3atlsau2grsauri1s4ause2s1änds2chad2schaksch2al2schaos2chau3sche_sch2en3sches4schexschi4es2chim3schis2schmö2schn_4s4chtscht4rsch2upsda3mese3at_see3igseein2se1er_se2galse2ha4seh1abseh1agse4helse2hinseh3rese2hüb2s1ei_2s1eig2seinb2seing4seinh2seink4seinl2seinn2seinw4s3eis3s2eitsek3tose2l1ase3ladsela4gse3lamsel1ec2self_sel1inse2l3ösel3szsel3tr4s1emp3s2en_se3nacse2nansen3gl3s4eni3s2ens2sentw2sentzse2n3use5refser2ers1erfos3erfüs2ergr2serhös1erklse1rot4seröfs2ers_2sersas1erse3s4ervse2selse2tapse1u2nse2van4sexa4sges4a3s2ha_4s3hoc4s3hof3s2hopsho4resi2achs2ide_2sideosi3dersi3enesi1errsi3gnusig4st2s1imm2s1ind2s1infsin3ghsin2gr4s3inhsin1i13sinn_3sinnl2s1inq2s1ins2s1int2s1invsi2s1esi2s1osi2s1psi2tra3skala4skanz3s2ki_3s2kiks2krip3skulpsler3ssli4tu4s5not2s1o2b4sohng2s1ohrso2leiso2ner2s3ordso2rei4s1ost2s1ö2l2spara4sparo3sparu2sperl4spers3s2pez3s2pli4s3poss2potts2pran2sprax2spräm4spräs2spred2spres2sprob4sprüfsrat2ssre4t3ssa2cks4samts4sangs4sansss3attss3aufsse1e2sse3has5sen_ss3erös4setass1offs2s1opss1oris2spros5stads3steis3stelss2turss1ums2stabb4stabl3s4tad2stafe1staffst1akt2stales3tali2stalkst1almst1alp2stan_sta4na1stand2stani2stans2stanws4tar_4staris4tarss3tat_3statis4tau_2staufs3taug2staum2stauss4tänd5stätts3täus3steckste2gr3s4tehs2te2i4steil4stel_2steln4stels4stem_st4ens6ster_ste2ras3tere4stermste4st3s2teu1steue4steuf2stie_2stien3s2tif3s4tims4tinfst1iso1stitus4toffs4t3om4stopo4stor_4store2storg2storis3tort4stote4stöch4s3töts3trac2strad2strai4strak2stral5straß2sträg4strefstri2k2strua3struk2strup2st3t43s4tudstum2s2stun_4stunn2stuntstu3rest1url4stüch4stür_4stüre4stürg4stürs2st3z23su2b3su4ba2su2cha2s1u2fsu1it_su3l2asu2marsu2mausu2mels3umsa2s1uni2s1urlsüden24s3zeis2zena4szent2ß1e2gßge2bl3tabel2taben3table2t3abt2t1adat1a2drta3d2s3taf2e4ta3gltag4sttah3leta3i2kt1a2kata3kesta2krotak6ta3taktb3t2al_ta3lagta3lakta3lart1alb_t1albk3talbu3t4aletal2enta2mert1a2nat3ankl2t1anm3tans_4tansit2ant_t2anz_t1anzat1anzuta2pes2t1armtar2tat1artitar2to2t1arz3t2as_3t2asttata2bta2tanta2tautat3eita2temtat3heta2tom4tatue2taufwt1ausb3tausct2auset1ausft1auskt1ausrtaxi3s2t1ältte3cha3technteck2ete2ckite2en3te1erwteg3ret3eifr2t1ein4teinzt3eis_t3eisbte2kel3te3le4telemtel1ente4leute2littell2e4tellute2l1ö3telt4tel3tate2marte2min2tempfte4m1ute2n3atena2bte3nactena2dtena4gte4naste4naut6endotend2sten1ecte2neftens2et3entb4tentdt3entzten3zwt3e2pi3t4er_tera2bte2radte1rafter3am4terbs4terbtte2relt4erfrte3riat4erli4terlö2ternct2errat2ers_terst4tesa2ctesä2cte2sprte2s1u3t2et_te2tatte4tik3teur_3t4ha_3thal_4t3hau3t4heat2hein3t2hek3t2hem4themd4themmt4henet4heni3these2t3hoc2t3hoh4tholz2t3hot3th2r2tiden23tief_2tieg43tierati2kamti2karti2kinti2kräti2larti2lauti2leiti2lel4t1imp3t2in_2t1inb4t1indti3n2e2t1injt2ins_4tinse2t1int4t1invti2seiti2solti3stati2velti2v1oti2v3rtnes2s3tochtto4d3ut1o2fetom1e2to2mento2pakto2patto2ranto2rauto4ränto3ren2t1org3tost43to3tetouil44tractt3rad_2trahm3t4rai2trandt3rann3transt3rase3träne4t5re_tre2brt3recht4reck2t3red5t4ree4trefe4trefo4treic2treift3reigt3reint3reist3reiz2t3rek4t3relt4ren_3trendt3rent2trepe2trepot4res_t3rese3t4ret3treuh4trieg4triemtri2ertri1es5trigg2tring3trink3trip_trizi13t4roitro2ke4trom_tro2mi4tromltro1pe3tropf2t3röttrums12trund3t4ruptru2thtrü1betrü1bu2t3rüct2s1aht4s3art3schats2chots4corts1engt2s1erts1init2s1irt3spalts1parts2pedt2spert3s2pits3takts4talts3tept2stitts3tocts3tort2stritta2bet3t2altt2anttt1arttt1ebett1eiftt1eistte2satte2sät2tetit2t3hott3rast3tro1tt2sentt2spett2sprtu1almtu2chitu3fent1u2kr3t2umetum2situm2so2t1umt2t1una3t2une2t1unft3ungatung4s2tuniftu2rantu2re_tu2reitu2resture4tturin1tü3cketück2s3tür3s3tütentze2n1tz2enetz1erltzgel2tz4tinua2lauu3a2louara2bua2t3hu2be2cub3licu2b3luub3ritub2sanub2s1oub2spau1cha_uch1eiu3chesuch1iluch1inu2ch3ruch2souchst4u2ckemuck2eru2ck1iuder2eudi3enuditi4uenge4u3e2niuen2zuue2r3aue2r1äu3erehu3ereru3erexuer3g2uer2neuer3scuer3t2u3erumue4teku2f1äsu2f1eiu2f1emu3fen_u2fentuf2frouf1oriuf4sinuf2spouft3s2u2g1apu2g1eiu3g2löug3rüsug4serug3spaug3spiug4sprug4spuug3staug5stäug3struh2reruh4rinui4s5tukle3iuk2t1auk2tinuk2t3ruld2seu2l1elul1erful1erhul1erwul1etaul1insul2lesul2p1hul4samul5s2eul2tarul2triul3z2wu2m3akum1allum3anzu2mausu2maut1um3d2umer2aum1insum4serum2simu2m1uru3n2am2un2asun4dabun4deiun2dorun2d3r2unds_und3spund3stun2ei_un3einunen2tun4es43unget3ungewung3raung3riung4saun3ideun3islu3n2it1u2nivun2ka2unk1apun2keiun2kneun3n2eunst1runvol2u1or3cu2pf2eu2pf1iupt3a2ura2beur1anaur2anbur1angur2anhu2r1auur3b2aur1effu2releu4r1epur1erhur1etaur2griurg3s4ur1iniur3insur1int1urlauur3sacur2sanur2seiur2serur4sinurst4rur3szeur2z1wu4s1afus4annu2s1ecu2s1efu2s1eiu3seiduse1rau2serpu3spekus1picus2porus4secusse2nus4sezus2sofu1stalus3tauu1stelust2inu2stunu2sturut1altut3a2mu2t1apu2t1aru2t1ärute4geu4tentu4t1exut3heiu2t3hout1opfu2topsuto3s4ut3reaut3s2aut2s1äut5t4lutu4reutu5ruutz2erut2zinut2z1wuve3räüb2s3tücht4eü3ckenück4shü3den_üdwes2ü2f1eiü2h1eiüh3r2eühr3taü2mentün2fliün2g3lün3strü2r1eiü2schlüs2s1cva2teiva2t3hva2t3rvat3s4va2t1uve3li5ve3nalve3radver3b2ve4rinver3teveter2vie3levie2w1vi2l1avi4leh2v1i2m2v1intvi3s2ov1steuwab2blwa3chewaffe2wah2liwal4dawal2tawal2towang4s3war2eware1iwart4ewe2b3lwe2g3lwe2g3rweg3s4wei4blwei2flwei3tawei4trwel2t1wel4trwe2r3awer2bl3werbuwerer2wer2fl3werk_wer2ka3werkewer2klwer2kuwer2tawer2to3wertswest1awest3rwes4tuwett3swi1ckawien2ewim2mawim4muwin2drwi3s2e3witzlwoche4woh2lewo2r1iwo4r1uwört2hwur2fa3wurstwus3te1wu4t1x1i2doxi2l3ux2i2s1xi3s2cxis4täx1i4tux3t2asxtblo4x2t1eix4tentx2t3evx3t2ury3chisy2la2myloni1y2p1iny1s4ty2z1all2z3anf2z3anlzar2trza1st42z3at3z1au2fzbübe32zecho2z1eck2z1effzei3lazeile42z1einzei3s4zeist4zeit1azei2trzel1erzel1inzel3szzel3th2z1empze2nanzent3sze2r3az1erfo2zergäzer3k2z2erl_2zerlözerne22z1erq2z1erz3zerzaz3erziz2e2s1ze3skuzes2stze3sta2zettszi3alozi1erhziers1zi1es_2z1impzin4er2z1infzin1itzin2sa2z1invzi3s2zzi1t2hzor4ne2z1oszz2t1auz4tehez3therzt3reczu3ckezug3un2z1uhr2z1um_zumen22z1umszup2fizu3r2a2z1urk2z1url2z1urs2z1urtzü3ckez1weis2z1wel2z1wen2z1wer2z1weszzi3s4",
		7 : "_al4tei_amt4s3_and4ri_an3gli_angst3_an4tag_ausch3_bo4s3k_ebe2r1_en2d3r_en4tei_er4dan_er4dar_er4dei_er4der_es5t4e_es3t2h_fi3est_fi4len_ge5nar_ge3r2a_haft5s_hau2t1_ho4met_ka2b5l_orts3e_pa4r1e_reb3s2_re3cha_rein4t_reli3e_res4tr_sim3p4_sto4re_to4nin_ul4mei_urin4s_ur3o2m_ur3o2p_wei4ta_wor4tu_zin4stab3essea4chenta4cherka4cheröach1o2bach2t1oa3d2ar3ade3s2p2ad3recaf4t5reage4nebage4ralage2s3pa2h1erhah4l1eiahner4eahre4s3ahr4tria3isch_1a2k4adala5ch2a2l1angalb3einalb3eisal4berha2l1e2b3a2l1efal3endsa2l1erba2l1erfa2l1erhaler3ina2l1erla2l1ert3a2lerza2l1eskal2l1aual3lenda2l1o2balt3eigalt3ricalt4stüalzer4zamer2a1amp2fa2am4schlana4lin2ana1s4an2d3rüan2g1eiang3erfan2g3laan2g3raa4n3insan2k1anan2k3noan2k3raan2k3räan3s2krant3rina3ra3lia2r1anga2r1anza2r3appar2b3unaren4seare3r2aa2r1erhar2f3raari3erdari3ergarin3itar2k5amar2k1arark3aueark3lagark4trear3m2orar2r3adart3erlar4trama4scheca2s1e2ma2s1o2fa2s1o2ras4t3rea2t1aktater3s2ato4mana2t1ortat4schnatt3angat2t3räat4zerkauch3taau4e3reaum3angaup4terau2s1ahau4schmau4schoaus3erp1aus3s4aus4se_au4terkaut2o3fäg3s4trä3isch_äl4schläser4eiäse4renäskopf3ät4schlät4schräu4schmäus2s1cban3g4lban2k1abau3s2k2b1eier2b1eimebe1in2hbei3s4tbe2l1enben3dorbens4eiben4sprber4ei_be4rengber4in_ber3issb3esst_2b1illubis2s1cbjek4to2b3leid3b4litzbor2d1ibor2t3rbra1st42b3riembrü3ckeb6schanb6schefb4s1erfb4s1ersbst1a2bb2s3träbs3treubtast3rbunde4sbu4schlbu4schmbu4schwbu2s1erbügel3ebzei2t1ch3a2bi3charta4chelemche4ler4chents4chentwche4recche3rei2ch1e4x2ch1invch3lein2ch1unf4ckense4ckentw2ck1errck4stro2ck1um32d1al2a2d1ammä2d1a2na3d2anz_2d1au2f2d1aus33d2e1imdelei4gde2l1obdel2s1edel2s1pden4sender3edider4erf4derklä4derneude3stande3stardie4nebdie2s3c2d1i2radi3s4trdi4tengdo1st1r2d3rast2d3rauc3d4reck2d3reicdrü3cked4s3amtd4schefd4seinsd2s1engd2s1entd2s1erfd2s1erkd3s2kan2d1un3de3ak3toe4aler_e3at5t4eb4stätebs3temech1o2bede3n2eeden4seeden4sped2s1eseein4see2f1e2bege4l1äege4streher4anehe3strehl3eineh2r1a2ehr1e2cehr4erleienge44eigeno1ei2g3nei4leineil3ins2e1induei4neng3eingabein4habei2n1o23einsate4inverekt3erfela4bene2l1a2me2l1a2re4leinge4leinh2e3len_e4lensee2l1ente2l1ergel1e4tael3l2an3elternelt3s2kelt3s2pe2m3anfe3m2e2nemen4the2m1erwem2p3leena3l2ien3d2acend4ortend3romend3s2pene4bene4n1enten4entre2n1erd1e2nerge2n1erle2n1erse2n1erte2n3erue2n1erwe4n3esseni3er_enob4lee2n1o2ren4terb3entspr4entweten4zergenz3erherd3erwere4dite2r1e2h4e3rei_4e3ren_e4rensee4rentner4ergee2r1erhe4rerscere4vid3ergebn4ergehäe2r1i2d4e3rin_e2r1ini3erlebnermen4serm3erser2n1ose4r1o2rer4res_erri3erers4tecer4terl3erweckese4lere3s2pore3s4prae4starbe1s2teces3trope2s3umseße3r2eeter4tre4traumet4tangette4n1et4t1umeu3ereieu4genteu3g2ere2u3r2eeve5r2ifa4chebfa2ch1ifan4gerfäh2r3ufeh4lei4f1einhfe2l1erfel4sohfer3erzfest1a2fest3eifet4t3afeuer3ef2f3emifi1er2ffi2l1anfil4auf2f3leinflu4gerfor4teifor2t3r2f3ra2mfrei3n4f4scheff4s1ehrf2s1entf4s1etaf2s1pasf4stechf3s4telf3sternf4t1entf2t1erlf2t1etift4scheft4s3täft4streft4stri2f1u2nifun2k3rfus4serfus2s1pfus2s3tfu2ß1ergan2g1a4gangeb2g1ankugebe4amge4lessgel3stegel3t2agen4auggen2d1rgen3eidgen3ern2g1entfge4renggerin4fger4inngerin4tger4stoges3s2tge4t1ergien2e12g3isel3g4laub2g3lauf4g3lein2gni2s12g3reic2g3rein2g3renng3rieseg4schefg3s2eilg3s2pekg3s2porgs4tellgst3entgst3errg4s3tor4gungew2g3unglgus4serhaf3f4lhalan4chal4beihas4serhau4spahäu2s1chba2r3ahe4b1eihe5ch2eheit4s3h3e2lekhel3ershel4meihen3endhen3erg2h3entwher3a2bher3eck4hereighe4rerwherin4shie4reihie4rinhi2l3a4hin4t1ahir4nerhle3runhner3eih3nunge2hot3s2hrei4bah4r3eigh3re2s1h3rieslhr2s1achr2s3auhr4s1ofhr4stechrü3ckeh2s1achh4schanhse4lerh2s1erlh2s1parhst3alth2s3tauh3steinhst3ranh3taktsh2t3assh2t3a2th4teilzh2t1eimh2t1eisht3erfoh2t1erhh4terklh2t1errht3erscht3ersth2t1erzh4t1essht3ort_ht3randh2t3rath2t5rinh2t3rosh4t3rösht3spriht4stabh2t1urshu2b1eihu2b1enhu2l3eihul3enghu4lenthu2l1inhut4zenia2l1a4i3alenti3alerfi3alerhi3a2leti3a2liai2b1aufi2b1eigi2b1eisich2t3rieb4strie2f1akie2f1anie3g4raie4l1ecien4erfienge4fien3s2eie4rerfier3staies2s3tie4tertie2t3hoie4t3ö4i2f3armift3erkif2t3riift3s2pi2g1angi4gefari3g4neuig3steiig4s3toig4strei2k3anoi4kanzei2k1etaik2o3p4i2l3a2mil4aufbi4lentsi2l1erfi2l1ergil2f3reili3e4ni2l1indil4mangil2m3atil2m1auilz3erki2m1armimat5scima4turi2m1erfi2m1erzi2m1infi2m1insi4n3au2in4deneind4stai2n1engin3erbeiner4lö1in4fosing4sami3n2i3d3inkarninn4stains3ertin3s2kain3stel1in3s2zional3aion4spiir2m1auir2m1eii4s3amtisch3ari4schefi2sch1lisch3leisch3obisch3otisch3reisch3rui4schwai4schwoisch3wuise3infi4seinti2s1ermi2s1essi3s4tati3s4teli3s4tilit3a4reiten3s2iti4kani2t3ranits1a4git2s1e4its3er1it4zergi2v1enei2v1enti2z1enejek4terjekt1o2jektor4je2t1u2jugend3jung3s42k1a2bo2k3a2drka3len_kal3eri2k1annakari3es2k1artikau2f1okauf4spke1in2d2k1eise2ke2lekkel3s2kk3enten2k1entsker4kenker4neu2k1i2deki3n2o32k1inse4k1last2k1o2fekop4fenkord3erkot4tak2k3räum2k3redek6s3ammk4s3amtk2s1ersk2s1erwk3stat4k2t3a2rk2t1ergk2t1erkk2t1ingkti4terkuri4erku4schl4l3aben4l1a2bl2l1a2drland4spla2r1eila4rene3l2ar3glar3ini2l1ar3t3lasserla2t3ralat4t1alat2t3rlaub4s3lau4fer2l1ausrlär2m1al2b1edel2b1insld3a2ckl2d1a2dl2d3a2nl2d1a2rleben4slecht4e4leier_lein4duleins4e2le2lekle2m1o24lendet4lenerglen4sem2l3entwlent4wäle2ra4gle4rers3lergehl3ergen2l1ergilerin4s2l1er2ö3l2erral4f1eislgeräu33lichem3licher2l1i2doli3e2neli4schu2l1i2soll1a2bel2l1abtl2l1a2ml2l1ausl4lentsl4lergoll3erntll3ertrl2l1indl2l1o2bl2l1o2rllus5t6l2m3a2blm3einsl2m1e2pl2m1erz2l1o2bllos3t4rl2s1a2dl4s3ambl4schinl4schmül2s1e2bl2s1ersl2s1impls3ohnel2t1eislte4leml3t2erglt4stablt4stoclug3stelung4sclus4s3alus2s1clus2s1olus2s3plus4s3tlust3rema4gentma2l1ak2m1analman4ce_man3ers2m1angrma3s2pa4m1aspemas4tel2m1au2fmäu2s1cmein4dame1i2some2r3apmer3eckme4rensmerin4dmerin4tmerz4en4m1essamierer4minde4smis2s1cmme4linm4mentwmme2ra2mme4recmmi3s4tmo4n1ermor2d3amp4ferfmpf3erpmpf3errmpf3erzm2t1erfm2t1ergm2t1erlm2t1ersm2t1ertm2t1etamt3s2kana3chenna2l1a23n2al3dna4lentnal3l2a4n1a2nana4schw4n1a2synauf4frn4austende4al_nde4lännde4robn2d3ratn4d3runnd4sparnd4stabnds3tau4n3eingne2n3a24n1endb4n1endd4n1endf4n1endh4n1endk4n1endp4n1endt4n1endwne4nenenen4ge_nen4gen5n2enta4n1entl4n3entw2ne4p3fne2ra2bne3r4alne2r3am4nerbe_4nerben2n1erbine2r1eb4n5erfonerfor42n1erlöner4mit4n1ernt3n2ers_4n3ersa4n3essi2n1etatnett4sc2n1e2tun2g1a2mn2g1einnge4zänn2g1i2dn3g2locng3sendnie3l2ani4kingni4schwn4k1algnke4leinke2r3un2k1insn2k1ortn4nentsn2n1unfn2o3ble2n1ob2sno2m1annor2d5rno4t3eino2t3inno2t1opn2s1äusn6schefnsen4spns3erfan4serfon2s1erkn2s1erwn2s1erznsi3de_n2s1inin4stat_n3stemmnst4erön4stracn4strien3t2a3cn4tanzan4t1essnti3k4ln4t1inhnton2s1nt3reifn5t4repntu4re_ntu4resn2z1a4gn4zensen4zentwnz3erwe2o3b4enoben3d4obe4riso2ch1ecocher4kof2f1ino2h1eiso2h1erto2h1erzoh4lergoh4lerwo3isch_ol2l1auoll1e2col2l1eiol4lerkoma4nero3m2eiso2m1indo2m1into2n1erbo2n1erdon3n2anont3erwon2t3riop4ferdopi3er_o4r3almo4r3alpor2d1iror2d3reord3s2to2r1e2cor2k3arormen4sor4mentor3n2o1ors4tinor2t1akor4t1anort3eigort3erfor2t3evor4trauort3ricor2t1umo2s3perost1a2bos4ta2gost3ageos4t1amos3tarrost3einost3rano2ß1enzo2ß3ereo2ß1erfo3t2e1iote2l1aote4leio2t1erwot3s2peot4terkozen4taöchs4tuögen4s3öl2f1eiöl2k3leö2r1e2lö3r2erzö2r1unepa2r3afpar3akt2par2erpar4kaupe4leinper2r1ap2f1a2b2ph1erspie4leipie4reipil4zerpingen4pi2z1in3ple5n4po2p3arpor4tripo2s3tepost3rap4t1entpt3ereip4t1erwp4t1erzp4t1in12r1acetra4chinracht3r3ra1k4l2r3alm_r4al3thram4manram2p3lran4dep4r3aneiran4spara2r1inra4schlrau3e2nrau4manra3umsa2raus5sr2d1elbrder4errderin4r2d1innre3alerrech3arreier4trei3l2arei3necre1in2v2r1entl2r1ents3r2erki2r1ernä2r1erns2r1ernt3r2ers_2r1ersa3r2ertu2r3evid2r1e2x1rfi4le_rfolg4srf4s1idrf2s3prr2g1a2drge4ralrge4taprgi4selr2g3ralrg5s2turi2f1eirif4terri4generin4dexrin4diz4rinnta3r4ins_rin4tegrin4t5r2r1inveri4schori4schwr3i2talr2k3reark4stecrk2t1anrk2t1o2rl4s3tor2m1ider2n1anzr3n2a2rrn3ebenr4n3eisr4n1ener4n1ergrn4erhir4n1ertrol4lanron4tanro2r3alros2s1crre4aler2s1a2dr4s3amtr2s3angr2s1e2br4stantrs4temprs4terbr3s2tierst3ingrst3ranr2t1almrt3a4rertei3lartei3s4r4t3elfrten3s2rt3ereir4terfar4terfor4t3erhr4t1erkr2t1ersrte3s4kr4t1i2dr4t1imar4t1rakr4treisrt4s1ehr2t1urtru3a2r3ruch3strun2d1arund3er4r3uniorus2s1pr2z1erfr2z1erkr2z1erwrz2t3ror3z2wecsa2cho22s1a2drsa2l1id6s3amma2s3a2nasan4dri4s5a2sy2s5aufb2s5ausb4schanc4schangsch3ei_4schemp4schess3sching4schiru4schle_4schre_4schrinsch3romsch3s2ksch3t2a4schunt4schwetsdien4e2s1echo2s1echt4s1e2ckse2e1i4se4h1eise4herk5s4ein_sein4dusei3n2esein4fo4s3einr4seinstsel3erdse4lerlsel3ers4s1endlsen3eck2s1entg2s1entsse2r3als3ereigser3eimse4reinser3eis2s1ernt4sersehse4r1ufse3r2umse3rung4s1e2thsi3ach_siege4ssi2k1absin3g4lsing3sasi4schuska4te_4skategska4tes4s3klassni3er_sni3erssol4ler4s3o2ly2s1orga5s4orgeso2r1o24spensi4s1peri3s2pi4e4spier44s3p4lu5s2prac3s4prec3sprosssrat4scs4s1alas4s1albs3sa1s2s4s1egasse3infs4sentsss3erhöss3erses3s4tipst1a2mi4s3tann3staus_4stechn3steilh3sternc3s4tett3s2tiel1s2ti2r2s3tosesto3s2t3s4trah4strans3s4tras4straum4stränest4reifst3renn2s4trig2s3trisst3roll4st3run2s4t3s4stum4sc3s4tunds2t1uni2s3tuns2st1urtsu2m1o23s4zene2ß1erseta2b1antab4bauta4bendta2g1eitage4s3tahl3sk4taktiv3t2aktutaler4ita2l1op2t1anna4t3ansp4tanzeita4rens3t4a3rita2t1erta2t1um2t3ausg4t3auss2t1ausw4teilhet3eingete2l1aute4l1ecte4l1ehte4leinte2l1inte2m1ei4t3endf4t1endl4t3endpten3d4rten3eid4tenerg4t1eng_ten4ge_ten4gla4tensem4t3entwten4zerter3endte4rengterer4z4terfol4terkläter4mert3erneuter4re_3t2erroter4sert4erst_t4erstit4erstute4r1ufter4wähter3z2a2t3erzbtes4sertes3tantest3eiteu3ereteu3eriteu2r3a2t3e2xe2t1e2xi4thrin_4thrinsti3e4n3tie4recti4gerzti2ma2gtim2m1at1in1ittin2k1lti4que_ti4schatisch3w3ti3t2etle2r3ato2d1ertor3inttra3chatra4demtra4far3t4ran_3t4reib2t3reihtre2t3rt4riche4t3rose3t4runkt4schart3sch2et4schefts4chemtsch4lit4schrot2s1e2bt4seindt2s1entt2s1i2dts4paret3s2pont3s2port4spreits3tätits3tradts3traut2s3trät4stropt2s3trütte4lent1u2fert3umsattu2r1ertur3eretu4schlt2z1e2ct2z1eiet2z1eistz3entsuben4seuch4spruch4toruch2t3ruden3s2u4erinnu3erunfu3eruntu2f1ä2ßu2f1erhu4ferleufs3temu4gabteu2g1erfu2g1erlugge4stu3isch_u3ischsulm3einu2m1artument4su2m1ergu2m1erlu2m1erwum2p3leum2s1peun2d1idun2d3umunk4titunk2t3run2n3adunte4riunvoll3upt3ergu2r3a2mur1an5su2r3a4rurgros4ur2s3auu2s1eseusi3er_us3partu2s1pasu5s4pizuss3erkust3abeu5strasu4t1erhuto4berut4schlut2s3pautz3engüch2s1cück3eriü4ckersück4speü3d2ensü2f1ergü2h1engü2h1erkü2h1erzühr3ei_ül2l1eiün2f1eiüste3neva2t3a4va4t1inve4l1auviel4ervi2l1invollen4waffel3wah4lerwalt4stwar3stewa4schawass4e2we3cke_we3ckeswei3strwen2k3rwer4gelwe4r3iowest3eiwest1o2wolf2s3wol4lerwor2t3rwuch4scxi4d1emx2t1e2dxtra3b4x2t3ranyl4anteyri3ersze2l1a2ze2n3aczen4sem4zergeb2z1erhözerin4tzer4neb2z1ersazert1a4zert4anzessen4zie4leizin4ser4zinsufzon4terzu2g1arzu4gentzwan2d1",
		8 : "_alb6rec_al5l4en_anden6k_ar4m3ac_ar4t3ei_bei6ge__ber4g3r_de3r4en_einen6g_en4d3er_er4zen4_ka4t3io_ost5end_par3t4h_richt6e_rücker6_sucher6_tan4k3la4ch3erwach6stuback5sta43a2er2o1al4b3erwal2l3a4rall5erfaalli5er_al4t3erfam4t3ernan4g3erlan4g3erzang4s3poani5ers_an2t3a4ran2z1i4nari5ers_at4z3erwau5ereinau4s3erwauster6mau4ten4gäs4s3erkbach7t4ebal4l3ehbe4r3eiwber3st4abe6steinbe4s3tolbote3n4ebse4r3inbu4s3chach3e4ben6chergebcher6zie4d3achse2d1an3d22d1e2bendel5sterde4n3end4den4semde4r3eckde3r4erbde4r3ero4d3erhöh4d3ersat2d1in1itdi4t3erldi4t3ermdi4t3ersd4s3chind4s3tätid3s4terne3a4reneech3t4eiege4n3a4eg4se4r1eh4l3entei2b3u4tei4d3errei2m1a4gein6stalei6schinei6schwuei4s3erweister6reld5erstel4d3erwel5eier_e4ler4fae4ler4laelgi5er_elgi5ersel4l3eine6mentspen4d3esseni5ers_en5sch4een4t3rolen4z3erfen4z3erke4r3entfer4g3an_eri3e4n3eri5ers_ess4e3reess5erwees4t3enges4t3erhes4t3essestmo6deest3o4riet4sch3wet4z3enteue6reifeut6schnfal6schafal6schmfrach6trf4s3tüteft4s3tangas4t3el2g1eise2gel4b3ragel6ders4g3ereigge4ren4sge4r3entge4s3terglei4t5rgrammen6gros6selhaft4s3phal6lerfhau3f4lihau5steihel4l3auhe2n1e2bhe4r3eishe4r3o4bhfel6lerh6l3ernäho6ckerlhol6zeneh6rerlebh3s4terbh3t4akt_h4t3entfh4t3entsh4t3erfüh4t3erkeh6terstaht6ersteht6raumeht4s3turht4s3türhut4z3eri2e2l1a2ie2l3o4bie4n3ergier4s3ehiesen3s4im4m3enti2n1e2bei4ner4trin2g1a4gin4n3ermir4m3untir4sch3wi4sch3eii6schwiriso6nendis4s3chejah4r3eikehr4s3o4ken4gagken5steik3er4lauk3er4lebkeu6schlkor6dergkre1i2e4k4s3tanzk4t3erfolat4t3inl2d1e2selei6nerble4n3end5lentwet4l3ereig4l3ergeb3l4ergewli2g1a2b2l1in1itl6lergenl4s3ort_l4s3tätils6ternels6ternsl4t1e4skl2t1o2rilu2g1e2blus4s3erlu4t3erglu4t3ersl2z1u4fema4t3erd4m3entwi4m3ergänmp4f3erg4m3ungebnacht6ra4n1a2mernavi5er_navi5ersn4d3entsnder5stene2n1e2bn4g3erseng4s3e4hnich6ter2n3i2geln4k3erfanseh5erens6eins_n4s3prien4s3tatenst5opfenten6te_nt4s3parober3in4oh4l3erhol4z3ernon4t3endopf5erdeopi5ers_or4d3engor2m1a4gorni5er_orsch5lior4t3entor4t3ereor4t3offor4t3räuos4s3enzos4s3erfoste4r3eo2ß1en2kpargel6dpä4t1e2hpä4t3entp2f1in3srach6trä2r3a2d3rrali5er_rali5ersran4d3errau4m3agräu5scher2b1a2der4b3lastrch6terwr4d3erntre4n3end4r3erlaures6serwrge4l3err4g1en4g4r3innerrkstati6r2m1o2rirpe4r3inr4s3ort_r6steingrst3er4wr6strangr4ter4laru6ckerlrun6derlrun6dersrun6derwr4z3entssat4z3en2s1e2bense2r3a2d6sereignse4r3enk4s1e2tatson5ende2s1o2riesrücker6sse3in4ts4t3endss4t3englstes6se_sun6derhta4r3eretau3f4litau6schrtau6schwtblock5e4t1e2bentein3e4ctel4l3änte4l3ostte2m1o2rte2n1e2bte3n4ei_ten4t3ri4t3erde_te2r1e2b4t3ereigter4n3art6erscha6terwerbtes6terkti4v3erlto6ckenttrücker6t4s3amt4t4s3esset3s4tero2t1u2niou2ch1e4cu3erin4tuern3s4tu4g3reisun4d3erfund5erhaunge3n4eu6schentusch5werusi5ers_ü2ck1e2rüge6leisve4n1en2wach4t4rwahl5entwandels6we5cken_weis4s3pwel6schlwel6schrwel4t3a4xpor6terx2t1er2fx2t1il2l2z1e2benzei4t3erze2r1e2bzer4n3ei4z3erstezer4t3ag",
		9 : "_ber6g5ab_er8stein_he6r5inn_men8schl_wort5en6_wor8tendach8traumalli7ers_al5s6terbäh4l3e4be6b5rechtechner8ei_den6s5taue6ch5erzierg3el4s3got6t5erggren6z5eihä6s5chenhe6rin6nuherin8terh6t5erspaieler8gebil4d3en4tke6rin6nulepositi86mel6ternn4n3er4waos4s3en4kpapieren8ram6m5ersr8blasserris6t5erssfal6l5erspani7er_su6m5ents4t3a4genttan6z5erhtblocken8tes6ter6gvati8ons_wer6t5ermwin4d3e4czer6t5rauzes6s5end",
		10 : "_er8brecht_os8ten8deder6t5en6deren8z7endgram8m7endin6n5er6scos6t5er6wewel6t5en6d",
		11 : "_er8stritt__spiege8leiach8träume_lei8t7er8scpapie8r7endpiegelei8en",
		12 : "ach8träumen_",
		13 : "_er8stritten_"
	}
};

