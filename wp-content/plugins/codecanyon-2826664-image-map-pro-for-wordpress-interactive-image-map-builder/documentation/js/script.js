(function($, document, window, undefined) {
    $(document).ready(function() {

        // Add dummy element at the bottom
        $('body').append('<div id="dummy"></div>');
        $('#dummy').height($(window).height()/2);

        // Build section list
        var sectionsList = [];
        var i = 0;
        var section = {};
        $('h2, h3').each(function() {
            if ($(this).is('h2')) {
                section = {
                    id: $(this).find('a').attr('id'),
                    title: $(this).text(),
                    y: $(this).offset().top,
                    subsections: []
                };

                sectionsList.push(section);

                $(this).append('<i class="fa fa-arrow-up section-scroll-top" aria-hidden="true"></i>');
            } else {
                var subsection = {
                    id: $(this).find('a').attr('id'),
                    title: $(this).text(),
                };
                section.subsections.push(subsection);
            }
        });

        // Scrolling to top
        $('.section-scroll-top').on('click', function() {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        });

        // Add side menu
        $('body').wrapInner('<div class="container"></div>');

        var html = '';
        html += '<nav id="main-nav">';

        html += '<a href="https://webcraftplugins.com/"><img src="https://webcraftplugins.com/uploads/wcp-logo-bw.png"></a>';

        for (var i=0; i<sectionsList.length; i++) {
            var section = sectionsList[i];
            html += '<dl>';
            html += '<dt data-anchor="'+ section.id +'">'+ section.title +'</dt>';

            if (section.subsections.length > 0) {
                html += '<dd>';

                for (var j=0; j<section.subsections.length; j++) {
                    var subsection = section.subsections[j];
                    html += '<a href="#'+ subsection.id +'" data-anchor="'+ subsection.id +'">'+ subsection.title +'</a>';
                }

                html += '</dd>';
            }

            html += '</dl>';
        }

        html += '</nav>';

        $('body').append(html);

        // Add search
        

        // Events
        var autoHighlightSection = true, autoHighlightTimeout = undefined;
        $('[data-anchor]').on('click', function() {
            var y = $('#' + $(this).data('anchor')).offset().top;
            window.scroll({
                top: y - 20,
                left: 0,
                behavior: 'smooth'
            });

            var anchor = $(this);
            if (anchor.is('a')) {
                anchor = $(this).closest('dl').find('dt');
                console.log(anchor);
            }
            $('[data-anchor]').removeClass('active');
            $('[data-anchor]').removeClass('hardactive');
            anchor.addClass('hardactive');

            clearTimeout(autoHighlightTimeout);
            autoHighlightSection = false;
            autoHighlightTimeout = setTimeout(function() {
                autoHighlightSection = true;
                $('[data-anchor].hardactive').addClass('active').removeClass('hardactive');
            }, 1000);
        });

        var scrollTimeout = undefined;
        $(window).on('scroll', function(e) {
            if (!autoHighlightSection) return;

            clearTimeout(scrollTimeout);

            setTimeout(function() {
                var y = $(window).scrollTop();

                for (var i=sectionsList.length - 1; i>=0; i--) {
                    var headingY = $('#'+ sectionsList[i].id +'').offset().top - 21;

                    if (i == sectionsList.length - 1) {
                        headingY -= $(window).height()/2;
                    }

                    if (y > headingY) {
                        $('[data-anchor]').removeClass('active');
                        $('[data-anchor="'+ sectionsList[i].id +'"]').addClass('active');
                        break;
                    }
                }
            }, 100);
        });

        // Present
        $('body').removeClass('unresolved');
    });
})(jQuery, document, window);