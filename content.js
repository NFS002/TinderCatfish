$( function( ) {

    const COMMENTS_PER_PAGE = 3;
    const STATUS_TO = 2000;
    const BASE_URL = 'https://catfish.skydesign.blue'
    const CATFISH_LOGO_URL =  chrome.extension.getURL('/imgs/catfish-banner.png');

    let all_comments = []

    var change_image = function() {
        $('#logo').attr('src', CATFISH_LOGO_URL)
    }

    var is_invalid_name = function( name ) {
        return ( typeof name === 'undefined' || 
        !name || !name.length || /^\s+$/.test(name) )
    }
    
    var is_invalid_comment = function( comment ) {
        return ( typeof comment === 'undefined' || 
        !comment || comment.length < 2 || /^\s+$/.test(comment) )
    }
    
    var make_frame = function() {
        var frame = document.createElement("div")
        frame.setAttribute('class', 'frame')
        return frame;
    }
    
    var make_left_frame = function() {
        var frame = make_frame();
        frame.setAttribute('id', 'left-frame')
        return frame;
    }
    
    var make_right_frame = function( ) {
        var frame = make_frame();
        frame.setAttribute('id','right-frame');
        return frame;
    }
    
    var update_title = function( txt ) {
        var frame = document.getElementById('right-frame');
        var title = document.getElementById('comments-title');
        if ( !title ) {
            title = document.createElement('div')
            title.setAttribute('id','comments-title')
            frame.prepend( title )
        }
        title.innerHTML =  txt;
    }
    
    var make_pagination = function() {
        var el = document.createElement("div")
        var frame = document.getElementById('right-frame')
        frame.appendChild( el )
        $(el).pagination({
            items: 10,
            displayedPages: 3,
            itemsOnPage: COMMENTS_PER_PAGE,
            onPageClick: render_comments
        })
    }
    
    var update_footer = function( i, k, n ) {
        var frame = document.getElementById('right-frame');
        var footer = document.getElementById('comments-footer');
        if ( !footer ) {
            footer = document.createElement('div')
            footer.setAttribute('id','comments-footer')
            frame.appendChild( footer )
            make_pagination()
    
        }
        var el = $('.simple-pagination');
        el.pagination('updateItems', n)
        if ( !n ) {
            footer.innerHTML = '0 comments'
            el.pagination('disable');
        }
        else {
            el.pagination('enable');
            footer.innerHTML =  'Showing ' + i + ' - ' + k + ' of ' + n + ' comment(s)'
        }
    }

    var html_to_element = function(html) {
        var template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    }
    
    var make_comment_box = function () {
        let box = document.createElement('div');
        box.setAttribute('id','comments');
        return box;
    }
    
    
    var make_input_box = function() {
        let input_box = html_to_element(`
        <div id="input-box">
            <p id="post-title">Post a comment</p>
            <input required placeholder="Your name"/>
            <textarea required placeholder="Your comment"></textarea>
            <button id="post-btn">Post</button>
            <div class='comment-status'>
                <p id="comment_success">Message Posted</p>
                <p id="comment_err"></p>
            </div>
        </div>`)
        return input_box;
    }

    var render_comment = function (comment, idx, arr) {
        let commentDiv = document.createElement("div");
        let box = document.getElementById('comments')
        commentDiv.setAttribute("class", "message");
        commentDiv.innerHTML = `
        <span class="name">${comment.name}</span><span class="date">${comment.date}</span><br>
        <span class="body">${comment.comments}</span><br><hr>
        `;
        box.appendChild(commentDiv);
    };

    var render_comments = function( page_n ) {
        if ( !page_n ) page_n = 1;
        var start = (page_n - 1) * COMMENTS_PER_PAGE
        var end = Math.min( start + COMMENTS_PER_PAGE, all_comments.length )
        var paged_comments = all_comments.slice( start, end )
        comment_box.innerHTML = ''
        update_footer( start + 1, end, all_comments.length )
        paged_comments.forEach( render_comment )
    }
    
    var fetch_comments = function( ) {
        var path = window.location.pathname.substring(1);
        $.get( BASE_URL + '/findComments/' + path, function (data, err) {
            all_comments = JSON.parse( data ).comments;
            render_comments( )
        });
    }

    var comment_success = function() {
        var el = document.getElementById('comment_success');
        el.style.opacity = 1;
        var form = $('#input-box');
        form.find('input, textarea').val("");
        setTimeout(function () {
            el.style.opacity = 0;
            fetch_comments()
        }, STATUS_TO); 
    }
    
    var comment_err = function( txt ) {
        var el =  document.getElementById('comment_err');
        el.innerHTML = txt
        document.getElementById('comment_err').style.opacity = 1;
        $form = $('#input_box');
        $form.find('input, textarea').val("");
        setTimeout(function () {
            el.innerHTML = ''
            el.style.opacity = 0;
        }, STATUS_TO); 
    }
    
    var post_comment = function( comment ) {
        $.post( BASE_URL + '/postComment', comment)
        .done( d => comment_success() )
        .fail( (x, t, e) => comment_err( t ) );
    }
    
    var submit = function() {
        $("<div>").text($('input[type=text]').val()).html()
        let name = $("<div>").text( $('#input-box input').val() ).html();
        let txt = $("<div>").text( $('#input-box textarea').val() ).html();
        if (is_invalid_name( name )) {
            comment_err('Please give your name')
        }
        else if ( is_invalid_comment( txt ) ) {
            comment_err('Please write a comment')
        }
        else {
            var path = window.location.pathname.substring(1);
            var comment = { 'name': name,
                            'comments': txt,
                            'url': path };
            post_comment( comment );
        }
    }

    
    var container = document.getElementById('main');

    var lframe = make_left_frame();
    var rframe = make_right_frame();
    var comment_box = make_comment_box();
    var input_box = make_input_box();

    container.prepend( lframe );
    container.appendChild( rframe );

    lframe.appendChild( input_box )
    rframe.appendChild( comment_box );
    fetch_comments()
    update_title('Top comments')
    change_image()

    $('#post-btn').click( submit );
})






