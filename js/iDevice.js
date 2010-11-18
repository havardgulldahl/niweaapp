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
        if(len == null) len = 105;
        if(!s || s.length < len)
            return s;

        return s.substr(0, len-4) + ' ...';
    };

    timediff = function(published, updated) {
        var nu = (new Date()).getTime();
        var diff  = new Object();
        var epochDate = function (msec) {
            var d = new Date(msec);
            var mnd = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
            var r = [ d.getDate() , ". ", mnd[d.getMonth()], " ", d.getFullYear() ];
            var s = "Publisert ";
            s += r.join("");
            return s;
        };
        diff.published = humanTimediff(nu,published);
        if(updated > 0) {
            diff.updated = humanTimediff(updated,published);
        } else {
            diff.updated = false;
        }
        diff.toString = function() {
            var s;
            if(this.published.days > 14) {
                s = epochDate(this.published.pub_epoch);
            } else {
                s = "Publisert for ";
                s += this.published.toString();
                s += " siden";
            }
            if(this.updated !== false) {
                s += " (oppdatert ";
                if (this.published.days > 14 && this.updated.days > 14) {
                    s += epochDate(this.updated.newer_epoch);
                    s += ")";
                } else {
                    s += this.updated.toString();
                    s += " senere)";
                }
            }
            return s;
        };
        return diff;
    };

    humanTimediff = function(newerstamp, publishedstamp) {
       var tdiff = newerstamp - publishedstamp;
       var diff = new Object();
       diff.pub_epoch = publishedstamp;
       diff.newer_epoch = newerstamp;
 
       diff.days = Math.floor(tdiff/1000/60/60/24);
       tdiff -= diff.days*1000*60*60*24;
 
       diff.hours = Math.floor(tdiff/1000/60/60);
       tdiff -= diff.hours*1000*60*60;
 
       diff.minutes = Math.floor(tdiff/1000/60);
       tdiff -= diff.minutes*1000*60;
 
       diff.seconds = Math.floor(tdiff/1000);

       diff.toString = function() {
            var s = [];
            if(this.days > 0)
                s.push(" " + this.days + " " + pluralFlex("dag", this.days));
            if(this.days < 4 && this.hours > 0)
                s.push(" " + this.hours + " " + pluralFlex("time", this.hours));
            if(this.minutes > 0 && this.days == 0)
                s.push(" " + this.minutes + " " + pluralFlex("minutt", this.minutes));
            if(s.length == 0 && this.seconds > 0)
               s.push(" " + this.seconds + " " + pluralFlex("sekund", this.seconds));
            return s.join(", ");
       };
       return diff;
    };

    pluralFlex = function(root, quantity) {
        if(quantity == 1) return root;
        if(root.substring(root.length-1) == "e") return root + "r";
        return root + "er";
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
				
				//$.address.value(localStorage.getItem('xxcurrentPage') || 'category');
				
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
				
                //console.log("processURI: %o", address);
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
                console.log("setAddress: %o", uri);
                //this.setProgressBar();
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
			$('#category .category-link').each(function(index) { 
                var i = $(this).attr("id").split("-")[2];
                if(i == "99") i = "1";
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
                $('.category-link').each(function() {
                    $(this).click(function(ev) { window.location = $(this).data('href'); });
                });

                $('#category-prev').click(function() { slideTo("prev"); });
                $('#category-next').click(function() { slideTo("next"); });

                containercount = $('#category button.category-link').length;
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
			if (!item || !item.text) {
                //$('body').addClass("working");
                //drawWaitSpinner();
                $.getJSON( './backend/index.php?mode=story&id='+id, function(data) {
                    //$('body').removeClass("working");
                    //var item = data.items[0];
                    drawStoryItem(data.story);
                });
            } else {
                drawStoryItem(item);
            }

        };
		
		drawStoryItem = function(item) {
			var content, i, ii, context, gallerylinks, galleryslider, images, published;
			
			content = $('#content');
			
			content.html('<div class="long story"><div class="img"></div><h2 class="title"></h2><p class="lead"/><p class="published"/><div class="text"/><div class="context_stories"></div>');
			
			content.find('h2').text(item.title);
			content.find('p.lead').html(item.lead);
            published = timediff(parseInt(item.publishedEpoch, 10), parseInt(item.updatedEpoch, 10));
			content.find('p.published').text(item.department + " — " + published.toString());
            switch(item.template) {
              case "picturegallery":
              gallerylinks = {};
              images = 0;
              content.find('div.story').append(item.images)
                .find('img')
                  .each(function(index) {
                    images++;
                    var el = $(this);
                    gallerylinks[el.attr("id")] = index;
                    $(this).error(function(ev) { 
                        var dim;
                        var e = $(this);
                        switch(e.data("cropdef")) {
                            case "f169CropList": dim = "650x367"; break;
                            case "f34CropList": dim = "462x616"; break;
                        }
                        var url = 'http://nrk.no/contentfile/file/'+ e.data("ppid") + '!' +
                            e.data("cropdef") + "/img" + dim + ".jpg";
                        e.attr("src", url);
                        // 16:9 'http://nrk.no/contentfile/file/1.6739360!f169CropList/img650x367.jpg'
                        // 4:3 462x616.jpg
                    });
                  });
              gallerylinks.length = images;
              console.log("gallerylinks: %o", gallerylinks);
              $("#gallerystatus")
                .data("images", gallerylinks)
                .bind("update", function(ev) {
                    console.log("update status");
                    var currid = $("#galleryimages div.galleryimagebox:first-child img").attr("id");
                    var links = $(this).data("images");
                    //$(this).text("bilde "+parseInt(links[currid]+1, 10)+" av "+links.length);
                })
                ;
              $("#playpause").toggle(function() {
                var run = window.setInterval(function() {
                    // every step, move top element to the last position
                    $("#galleryimages div.galleryimagebox:first-child")
                        .css("opacity", "0")
                        .appendTo("#galleryimages")
                        .css("opacity", "");
                    $("#gallerystatus").trigger("update");
                    },
                    2000 //msec
                );
                $(this).data("run", run);
                $(this).text("pause");
              }, function() {
                window.clearInterval($(this).data("run"));
                $(this).text("play");
              });
              $("#prev").click(function() {
                $("#galleryimages div.galleryimagebox:last-child").css("opacity", "0").prependTo("#galleryimages").css("opacity", "");
                $("#gallerystatus").trigger("update");
              });
              $("#next").click(function() {
                $("#galleryimages div.galleryimagebox:first-child").css("opacity", "0").appendTo("#galleryimages").css("opacity", "");
                $("#gallerystatus").trigger("update");
              });
                    
              break;
              case "article":
                content.find('.img').html(item.leadImage);
                content.find('div.text').html(item.text).find('a').each(function(index) {
                    var ppid = $(this).attr("href").match(/\/(\d\.\d{5,8})/);
                    if(ppid) {  // redirect internal links to ourselves
                        $('html, body').animate({scrollTop:0}, 'fast');
                        $(this).attr("href", "#/story?id="+ppid[1]);
                    }
                });
                content.find('.text .factbox').toggle(function(ev) {
                    $(this).css("width", "100%");
                    $(this).find(".factbox-contents").css("height", "auto");
                  }, function (ev) {
                    $(this).css("width", "4em");
                    $(this).find(".factbox-contents").css("height", "0");
                });
                
                //// TODO: add congtext stories, once we are sure we can provide the content
                //context = content.find('div.context_stories')
                //for (i = 0, ii = item.context_stories.length; i < ii; i += 1) {
                //	context.append('<a/>')
                //		.children(':last')
                //		.text(item.context_stories[i].context_title);
                //}
              break;
            }
			Hyphenator.config({
				classname : 'long',
				donthyphenateclassname: 'title',
                //displaytogglebox: true,
                //hyphenchar: '|',
                // onhyphenationdonecallback : function () {
                //     alert('Hyphenation done');
                // },
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

		putJsonToStorage = function(data, id) {
            putToStorage("category"+id, data);
			that.drawCategory(id);
		};

        putGeoJsonToStorage = function(data) {
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
                    i, leadStory, storyClass, storyTemplate, t, 
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

                storyTemplate = $('<div class="story"><div class="storyimg"><img/></div><h2 class="title"/><p class="lead"/><p class="published"/></div>');

                leadStory = storyTemplate.clone().addClass("big");

				item = data.items[0];
                leadStory.click(getCallback(item));
                leadStory.find("img").error({'item':item}, function(ev) {
                    // image loading failed - try unmodified url if it exists
                    console.log("image loading failed, trying original %o", ev.data.item.origimage);
                    if(ev.data.item.origimage) {
                        $(this).attr("src", ev.data.item.origimage); 
                    } else {
                        $(this).hide();
                    }
                }).attr("src", item.image);
                leadStory.find("h2").text(item.title);
                leadStory.find("p.lead").text(item.lead);
                t = timediff(parseInt(item.epoch, 10));
                leadStory.find("p.published").text(t.toString());

                div.addClass('content').append(leadStory);
				
                // sanity check no. of stories
                var displayStories = Math.min(25, data.items.length); // max 25 stories (TODO: why?)

                // create the "small" stories
				for (i = 1; i < displayStories; i += 1) {
					item = data.items[i];
					title = item.shorttitle ? item.shorttitle : item.title;
                    itemStory = storyTemplate.clone().addClass("small").click(getCallback(item));
                    if(i>4) {
                        itemStory.addClass("portrait");
                    }
                    itemStory.find(".storyimg").addClass("portrait");
                    itemStory.find("img").attr("src", item.image);
                    itemStory.find("h2").text(item.title).click(getCallback(item));
                    itemStory.find("p.lead").text(strmax(item.lead));
                    t = timediff(parseInt(item.epoch, 10));
                    itemStory.find("p.published").text(t.toString());
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
            $('<em>').attr("title", "Getting news feed from "+geo.feed).text("Henter nyheter fra "+geo.countyname)
            ).show()
        $('#category-99-select').val(parseInt(geo.county, 10) +100);
        $('#category-99-postalcode').val(geo.postalcode || '');
    };
    $('#category-99-toggle-menu').click(function(ev) {
        // show menu
        var geo = JSON.parse(localStorage.getItem("geo"));
        if(geo != null) {
            // have previous geo setting
            formatGeo(geo);
        }
        $('<div id="menu-overlay"></div>').click(function(ev) {
            //hide menu
            $('#category-99-settings').css({"height": 0}).hide();
            $("#menu-overlay").detach();
        }).appendTo("body");
        $('#category-99-settings').css({"top": ev.target.top, "left": ev.target.left}).show().css({ "height": "auto"});
    });
    $('#category-99-close-menu').click(function(ev) {
        //hide menu
        $('#category-99-settings').css({"height": 0}).hide();
        $("#menu-overlay").detach();
    });
    $('#category-99-settings-gps-activate').click(function(ev) {
        // activate gps
        geo_position_js.getCurrentPosition(function(gpsobj) {
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
        var t,v, z;
        t = $(this);
        try {
            v = t.val();
            if(v.length != 4) return; // we need 4 digits
            for(z=0; z<4; z++) {
                if(isNaN(parseInt(v.charAt(z), 10)))
                    return; // not a digit
            }
        } catch (e) {
            return;
        }
        $('body').addClass("working");
        $.get("backend/geolocate.php?postalcode=" + v, function(geodata) {
            $('body').removeClass("working");
            formatGeo(geodata);
            window.putGeoJsonToStorage(geodata);
        });
    });
    var selectTimeout;
    $('#category-99-select').change(function(ev) {
        // geolocalize from select list, after a short wait
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


