// ==UserScript==
// @name           GitHub Bookmarks
// @namespace      https://github.com/rsanchez
// @include        https://github.com/*
// @match          https://github.com/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

window.githubBookmarks = {
	
	bookmarks: JSON.parse(window.localStorage.getItem("githubBookmarks")) || {},
	buttonText: ["Bookmark", "Unbookmark"],
	buttonMarkup: "<li><a href=\"javascript:void(0);\" class=\"minibutton\" id=\"bookmark\"><span><span class=\"icon\">{{button}}</span></span></a></li>",
	bookmarkedReposMarkup: "<div class=\"repos\"><div class=\"top-bar\"><h2>Bookmarked Repositories <em>({{numRepos}})</em></h2></div><ul class=\"repo_list\">{{reposList}}</ul><div class=\"bottom-bar\"></div></div>",
	bookmarkedReposListMarkup: "<li class=\"public source\"><a href=\"{{href}}\"><span class=\"owner\">{{owner}}</span>/<span class=\"repo\">{{repo}}</span></a></li>",
	currentHref: "",
	
	add: function(){
		this.bookmarks[this.currentHref] = null;
		this.save();
	},
	
	template: function(template, data){
		if (typeof data === "object") {
			for (var i in data) {
				template = template.replace(new RegExp("{{"+i+"}}", "g"), data[i]);
			}
		}
		return template;
	},
	
	remove: function(){
		delete this.bookmarks[this.currentHref];
		this.save();
	},
	
	save: function(){
		window.localStorage.setItem("githubBookmarks", JSON.stringify(this.bookmarks));
	},
	
	isBookmarked: function(){
		return this.currentHref in this.bookmarks;
	},
    
    init: function(){
        var self = this;
        if (typeof jQuery == 'undefined') {
            var script = document.createElement("script");
            script.setAttribute("src", parent.location.protocol+"//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
            script.addEventListener("load", function(){
                console.log(window.jQuery);
                //self.setup();
                //var script = document.createElement("script");
                //script.textContent = "(" + callback.toString() + ")(jQuery);";
                //document.body.appendChild(script);
            }, false);
            document.body.appendChild(script);
        } else {
            window.githubBookmarks.setup();
        }
    },
	
	setup: function(){
        this.currentHref = jQuery(".repohead .title-actions-bar h1 a:last").attr("href");
        
		/* ADD BOOKMARK BUTTON */
		if (this.currentHref != "") {
			var button = jQuery(this.template(this.buttonMarkup, {button: this.buttonText[Number(this.isBookmarked())]}));
			
			button.children("a:first").bind("click", function(){
				if (window.githubBookmarks.isBookmarked()) {
					jQuery(this).find("span.icon").html(window.githubBookmarks.buttonText[0]);
					window.githubBookmarks.remove();
				} else {
					jQuery(this).find("span.icon").html(window.githubBookmarks.buttonText[1]);
					window.githubBookmarks.add();
				}
			});
			
			jQuery(".repohead .title-actions-bar ul.actions").prepend(button);
		}
		
		/* ADD BOOKMARKED REPOS LIST */
		var data = {
			numRepos: Object.keys(this.bookmarks).length,
			reposList: ""
		};
		
		for (var href in this.bookmarks) {
			data.reposList += this.template(this.bookmarkedReposListMarkup, {
				href: href,
				owner: href.split("/")[1],
				repo: href.split("/")[2]
			});
		}
		
		jQuery("#watched_repos").after(this.template(this.bookmarkedReposMarkup, data));	
	}
};
    
window.githubBookmarks.init();