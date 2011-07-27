// ==UserScript==
// @name           GitHub
// @namespace      https://github.com/rsanchez
// @include        https://github.com/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

var githubBookmarks = {
	
	bookmarks: JSON.parse(window.localStorage.getItem("githubBookmarks")) || {},
	buttonText: ["Bookmark", "Unbookmark"],
	buttonMarkup: "<li><a href=\"javascript:void(0);\" class=\"minibutton\" id=\"bookmark\"><span><span class=\"icon\">{{button}}</span></span></a></li>",
	bookmarkedReposMarkup: "<div class=\"repos\"><div class=\"top-bar\"><h2>Bookmarked Repositories <em>({{numRepos}})</em></h2></div><ul class=\"repo_list\">{{reposList}}</ul><div class=\"bottom-bar\"></div></div>",
	bookmarkedReposListMarkup: "<li class=\"public source\"><a href=\"{{href}}\"><span class=\"owner\">{{owner}}</span>/<span class=\"repo\">{{repo}}</span></a></li>",
	currentHref: $(".repohead .title-actions-bar h1 a:last").attr("href"),
	
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
		/* ADD BOOKMARK BUTTON */
		if (this.currentHref != "") {
			var button = $(this.template(this.buttonMarkup, {button: this.buttonText[Number(this.isBookmarked())]}));
			
			button.children("a:first").bind("click", function(){
				if (githubBookmarks.isBookmarked()) {
					$(this).find("span.icon").html(githubBookmarks.buttonText[0]);
					githubBookmarks.remove();
				} else {
					$(this).find("span.icon").html(githubBookmarks.buttonText[1]);
					githubBookmarks.add();
				}
			});
			
			$(".repohead .title-actions-bar ul.actions").prepend(button);
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
		
		$("#watched_repos").after(this.template(this.bookmarkedReposMarkup, data));	
	}
};

githubBookmarks.init();