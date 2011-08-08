// ==UserScript==
// @name           GitHub Bookmarks
// @namespace      https://github.com/rsanchez
// @include        https://github.com/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

window.githubBookmarks = {
	
	bookmarks: null,
    form: null,
	buttonText: ["Bookmark", "Unbookmark"],
	buttonMarkup: "<li><a href=\"javascript:void(0);\" class=\"minibutton\" id=\"bookmark\"><span><span class=\"icon\">{{button}}</span></span></a></li>",
	bookmarkedReposMarkup: "<div class=\"repos\"><div class=\"top-bar\"><h2>Bookmarked Repositories <em>({{numRepos}})</em></h2></div><ul class=\"repo_list\">{{reposList}}</ul><div class=\"bottom-bar\"></div></div>",
	bookmarkedReposListMarkup: "<li class=\"public source\"><a href=\"{{href}}\"><span class=\"owner\">{{owner}}</span>/<span class=\"repo\">{{repo}}</span></a></li>",
	currentHref: $(".repohead .title-actions-bar h1 strong a:first").attr("href"),
	
	add: function(){
        if ($.inArray(this.currentHref, this.bookmarks) === -1) {
            this.bookmarks.push(this.currentHref);
            this.save();
        }
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
        var i = $.inArray(this.currentHref, this.bookmarks);
        if (i !== -1) {
            this.bookmarks.splice(i, 1);
        }
		this.save();
	},
	
	save: function(){
        if (this.hasRemoteBookmarks()) {
            var user = this.currentHref.split("/")[1];
            var repo = this.currentHref.split("/")[2];
            this.form.find("textarea.commit-message").val("bookmarked "+user+"/"+repo);
            this.form.find("textarea.file-editor-textarea").val(JSON.stringify(this.bookmarks, null, "\t"));
            
            $.post(this.form.attr("action"), this.form.serialize(), fuction(){}, "html");
        } else {
            localStorage.setItem("githubBookmarks", JSON.stringify(this.bookmarks));
        }
	},
    
    useRemoteBookmarks: function(use){
        if (use === undefined) {
            use = 1;
        }
        localStorage.setItem('githubBookmarksRemote', Number(use));
    },
    
    hasRemoteBookmarks: function(){
        return localStorage.getItem('githubBookmarksRemote') == 1;
    },
    
    loadBookmarks: function(callback){
        //@TODO get username
        var user = github_user;
        
        if (this.hasRemoteBookmarks)()) {
            var self = this;
            
            $.get("https://github.com/"+user+"/github_bookmarks_userscript/edit/my_bookmarks/my_bookmarks.js", "",
            function(data, textStatus, xhr) {
                if (xhr.status == 200) {
                    self.form = $(data).find("form.js-blob-edit-form");

                    self.bookmarks = JSON.parse(self.form.find("textarea.file-editor-textarea").val().replace(/&quot;/g, '"'));
                } else {
                    this.useRemoteBookmarks(false);
                
                    this.loadLocalBookmarks();
                }

                callback();
            },
            "html");
        } else {
            this.loadLocalBookmarks();
            
            /* legacy object, convert into array */
            if (this.bookmarks.constructor !== Array) {
                var temp = [];
                for (var href in this.bookmarks) {
                    temp.push(href);
                }
                this.bookmarks = temp;
            }
            
            callback();
        }
    },
    
    loadLocalBookmarks: function(){
        this.bookmarks = JSON.parse(localStorage.getItem("githubBookmarks")) || [];
    },
	
	isBookmarked: function(){
		return ($.inArray(this.currentHref, this.bookmarks) !== -1);
	},
    
    inject: function(){function(){
        
            /* ADD BOOKMARK BUTTON */
            if (this.currentHref != "") {
                var button = $(this.template(this.buttonMarkup, {button: this.buttonText[Number(this.isBookmarked())]}));
                
                button.children("a:first").bind("click", function(){
                    if (window.githubBookmarks.isBookmarked()) {
                        $(this).find("span.icon").html(windowgithubBookmarks.buttonText[0]);
                        window.githubBookmarks.remove();
                    } else {
                        $(this).find("span.icon").html(window.githubBookmarks.buttonText[1]);
                        window.githubBookmarks.add();
                    }
                });
                
                $(".repohead .title-actions-bar ul.actions").prepend(button);
            }
            
            /* ADD BOOKMARKED REPOS LIST */
            var data = {
                numRepos: this.bookmarks.length,
                reposList: ""
            };
            
            for (var i in this.bookmarks) {
                data.reposList += this.template(this.bookmarkedReposListMarkup, {
                    href: this.bookmarks[i],
                    owner: this.bookmarks[i].split("/")[1],
                    repo: this.bookmarks[i].split("/")[2]
                });
            }
            
            $("#watched_repos").after(this.template(this.bookmarkedReposMarkup, data));
        }
    },
	
	init: function(){
        this.loadBookmarks(this.inject);
	}
};

window.githubBookmarks.init();