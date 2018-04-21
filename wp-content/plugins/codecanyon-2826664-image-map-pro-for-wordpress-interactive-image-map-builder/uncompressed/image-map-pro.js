; (function ($, window, document, undefined) {
    "use strict";

    // Variable to hold the currently fullscreen image map
    var fullscreenMap = undefined;
    var fullscreenMapParent = undefined;
    var touch = false;

    // API

    /*
        HTML API
        ---------------------------------------
        data-imp-highlight-shape-on-mouseover
        data-imp-highlight-shape-on-click
        data-imp-unhighlight-shape-on-mouseover
        data-imp-unhighlight-shape-on-click

        data-imp-open-tooltip-on-mouseover
        data-imp-open-tooltip-on-click
        data-imp-close-tooltip-on-mouseover
        data-imp-close-tooltip-on-click

        data-imp-trigger-shape-on-mouseover
        data-imp-trigger-shape-on-click
        data-imp-untrigger-shape-on-mouseover
        data-imp-untrigger-shape-on-click

        EXAMPLE
        ---------------------------------------
        <div data-imp-highlight-shape-on-mouseover="myshape1" data-imp-image-map-name="map1">Click</div>
    */

    // Events (called by the plugin, need implementation)
    $.imageMapProInitialized = function (imageMapName) {

    }
    $.imageMapProEventHighlightedShape = function (imageMapName, shapeName) {

    }
    $.imageMapProEventUnhighlightedShape = function (imageMapName, shapeName) {

    }
    $.imageMapProEventClickedShape = function (imageMapName, shapeName) {

    }
    $.imageMapProEventOpenedTooltip = function (imageMapName, shapeName) {

    }
    $.imageMapProEventClosedTooltip = function (imageMapName, shapeName) {

    }
    // Actions (called by a third party, implemented here)
    $.imageMapProHighlightShape = function (imageMapName, shapeName) {
        var i = $('[data-shape-title="' + shapeName + '"]').data('index');
        var s = instances[imageMapName].settings.spots[i];

        // Add shape to the list of highlighted shapes by the API
        if (instances[imageMapName].apiHighlightedShapes.indexOf(i) == -1) {
            instances[imageMapName].apiHighlightedShapes.push(i);
        }

        // If the shape is a master, then add its slaves too
        if (instances[imageMapName].connectedShapes[s.id]) {
            for (var j = 0; j < instances[imageMapName].connectedShapes[s.id].length; j++) {
                var index = instances[imageMapName].connectedShapes[s.id][j].index;
                if (instances[imageMapName].apiHighlightedShapes.indexOf(index) == -1) {
                    instances[imageMapName].apiHighlightedShapes.push(index);
                }
            }
        }

        instances[imageMapName].highlightShape(i, true);
    }
    $.imageMapProUnhighlightShape = function (imageMapName, shapeName) {
        var i = $('[data-shape-title="' + shapeName + '"]').data('index');
        var s = instances[imageMapName].settings.spots[i];

        // Remove the shape from the list of highlighted shapes by the API
        if (instances[imageMapName].apiHighlightedShapes.indexOf(i) != -1) {
            var arrayIndex = instances[imageMapName].apiHighlightedShapes.indexOf(i);
            instances[imageMapName].apiHighlightedShapes.splice(arrayIndex, 1);
        }

        // If the shape is a master, then remove its slaves too, and unhighlight them
        if (instances[imageMapName].connectedShapes[s.id]) {
            for (var j = 0; j < instances[imageMapName].connectedShapes[s.id].length; j++) {
                var index = instances[imageMapName].connectedShapes[s.id][j].index;
                var index2 = instances[imageMapName].apiHighlightedShapes.indexOf(index);
                instances[imageMapName].apiHighlightedShapes.splice(index2, 1);
                instances[imageMapName].unhighlightShape(index);
            }
        }

        instances[imageMapName].unhighlightShape(i);
    }
    $.imageMapProOpenTooltip = function (imageMapName, shapeName) {
        var i = $('[data-shape-title="' + shapeName + '"]').data('index');

        instances[imageMapName].showTooltip(i);
        instances[imageMapName].updateTooltipPosition(i);

        // Add the tooltip to the list of tooltips opened with the API
        if (instances[imageMapName].apiOpenedTooltips.indexOf(i) == -1) {
            instances[imageMapName].apiOpenedTooltips.push(i);
        }
    }
    $.imageMapProHideTooltip = function (imageMapName, shapeName) {
        var i = $('[data-shape-title="' + shapeName + '"]').data('index');

        // Remove the tooltip to the list of tooltips opened with the API
        if (instances[imageMapName].apiOpenedTooltips.indexOf(i) != -1) {
            var arrayIndex = instances[imageMapName].apiOpenedTooltips.indexOf(i);
            instances[imageMapName].apiOpenedTooltips.splice(arrayIndex, 1);
        }

        instances[imageMapName].hideTooltip(i);
    }
    $.imageMapProReInitMap = function (imageMapName) {
        instances[imageMapName].init();
    }
    $.imageMapProIsMobile = function () {
        return isMobile();
    }

    // Create the defaults once
    var pluginName = "imageMapPro";
    var default_settings = $.imageMapProEditorDefaults;
    var default_spot_settings = $.imageMapProShapeDefaults;

    var instances = new Array();

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend(true, {}, default_settings, options);

        this.root = $(element);
        this.wrap = undefined;
        this.zoomWrap = undefined;
        this.translateWrap = undefined;
        this.ui = undefined;
        this.uiNavigatorRoot = undefined;
        this.uiNavigatorWindowWidth = undefined;
        this.uiNavigatorWindowHeight = undefined;
        this.uiNavigatorImage = undefined;
        this.shapeContainer = undefined;
        this.shapeSvgContainer = undefined;
        this.fullscreenTooltipsContainer = undefined;

        // Cache
        this.visibleFullscreenTooltip = undefined;
        this.visibleFullscreenTooltipIndex = undefined;
        this.bodyOverflow = undefined;
        this.highlightedShapes = new Array();
        this.connectedShapes = new Array();
        this.openedTooltips = new Array();
        this.apiHighlightedShapes = new Array();
        this.apiOpenedTooltips = new Array();

        // Zoom
        this.targetZoom = 1;
        this.zoom = 1;
        this.maxZoomLevel = 8;
        this.zoomMultiplier = 1.45;

        // Pan
        this.targetPanX = 0;
        this.actualPanX = 0;
        this.targetPanY = 0;
        this.actualPanY = 0;
        this.initialPanX = 0;
        this.initialPanY = 0;
        this.panDeltaY = 0;

        this.ix = 0;
        this.iy = 0;
        this.lastX = 0;
        this.lastY = 0;

        this.pinchInitial = [{x: 0, y: 0}, {x: 0, y: 0}]
        this.pinchInitialDistance = 0;
        this.pinchInitialZoom = 0;

        this.navigatorRatio = 1;
        this.navigatorMarginX = 0;
        this.navigatorMarginY = 0;

        // Flags
        this.touch = false;
        this.fullscreenTooltipVisible = false;
        this.panning = false;
        this.didPan = false;
        this.panningOnNavigator = false;
        this.pinching = false;

        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
            var self = this;
            
            self.parseSettings();

            instances[this.settings.general.name] = this;

            this.id = Math.random() * 100;

            // Various preparations
            for (var i = 0; i < self.settings.spots.length; i++) {
                // Fill out any missing properties
                var s = self.settings.spots[i];
                var d = $.extend(true, {}, default_spot_settings);
                s = $.extend(true, d, s);
                self.settings.spots[i] = $.extend(true, {}, s);

                // Support for image maps created before 3.1.0
                if (!self.settings.spots[i].title || self.settings.spots[i].title.length == 0) {
                    self.settings.spots[i].title = self.settings.spots[i].id;
                }

                // Create connected shape groups
                if (s.connected_to != '') {
                    if (!this.connectedShapes[s.connected_to]) {
                        this.connectedShapes[s.connected_to] = new Array();
                    }

                    this.connectedShapes[s.connected_to].push({ id: s.id, index: i });
                }
            }

            var img = new Image();
            img.src = self.settings.image.url;

            self.loadImage(img, function () {
                // Image loading
            }, function () {
                // Image loaded
                var html = '';

                html += '<div class="imp-wrap">';
                html += '   <div class="imp-ui" data-image-map-pro-ui-id="' + self.settings.id + '">';

                // Navigator
                if (parseInt(self.settings.zooming.enable_zooming, 10) == 1 && parseInt(self.settings.zooming.enable_navigator, 10) == 1) {
                    html += '       <div class="imp-ui-element imp-ui-navigator-root">';
                    html += '         <img src="'+ self.settings.image.url +'" class="imp-ui-navigator-background-image-edgefill">';
                    html += '         <img src="'+ self.settings.image.url +'" class="imp-ui-navigator-background-image">';
                    html += '         <div class="imp-ui-navigator-overlay"></div>';
                    html += '         <img src="'+ self.settings.image.url +'" class="imp-ui-navigator-window-image">';
                    html += '      </div>';
                }

                // Zoom Buttons
                if (parseInt(self.settings.zooming.enable_zooming, 10) == 1 && parseInt(self.settings.zooming.enable_zoom_buttons, 10) == 1) {
                    html += '       <div class="imp-ui-element imp-ui-zoom-button imp-ui-zoom-button-zoom-in" style="color: '+ self.settings.zooming.zoom_button_text_color +'; background: '+ self.settings.zooming.zoom_button_background_color +';"><i class="fa fa-plus"></i></div>';
                    html += '       <div class="imp-ui-element imp-ui-zoom-button imp-ui-zoom-button-zoom-out" style="color: '+ self.settings.zooming.zoom_button_text_color +'; background: '+ self.settings.zooming.zoom_button_background_color +';"><i class="fa fa-minus"></i></div>';
                }

                // Layers UI
                if (parseInt(self.settings.layers.enable_layers, 10) == 1) {
                    html += '<div class="imp-ui-layers-menu-wrap">';
                    html += '   <div class="imp-ui-layer-switch-up imp-ui-layer-switch"><i class="fa fa-caret-up" aria-hidden="true"></i></div>';
                    html += '   <div class="imp-ui-layer-switch-down imp-ui-layer-switch"><i class="fa fa-caret-down" aria-hidden="true"></i></div>';
                    html += '   <select class="imp-ui-element imp-ui-layers-select">';
                    for (var i=0; i<self.settings.layers.layers_list.length; i++) {
                        html += '<option value="'+ self.settings.layers.layers_list[i].id +'">'+ self.settings.layers.layers_list[i].title +'</option>';
                    }
                    html += '   </select>';
                    html += '</div>';
                }

                html += '   </div>';
                html += '   <div class="imp-zoom-outer-wrap">';
                html += '       <div class="imp-translate-wrap">';
                html += '           <div class="imp-zoom-wrap">';
                html += '               <img src="' + self.settings.image.url + '" class="imp-main-image">';
                html += '           </div>';
                html += '       </div>';
                html += '   </div>';
                html += '</div>';

                self.root.html(html);

                self.wrap = self.root.find('.imp-wrap');
                self.zoomWrap = self.root.find('.imp-zoom-wrap');
                self.translateWrap = self.root.find('.imp-translate-wrap');
                self.ui = self.wrap.find('.imp-ui');

                self.root.addClass('imp-initialized');
                self.root.attr('data-image-map-pro-id', self.settings.id);

                self.centerImageMap();
                self.drawShapes();
                self.addTooltips();
                self.initFullscreen();
                self.initZoom();
                self.adjustSize();
                self.initNavigator();
                self.initLayers();
                self.events();
                self.APIEvents();
                self.animateShapesLoop();

                $.imageMapProInitialized(self.settings.general.name);
            });

            $(window).off('resize.' + this.settings.general.id + this.settings.runtime.is_fullscreen);
            $(window).on('resize.' + this.settings.general.id + this.settings.runtime.is_fullscreen, function() {
                if (self.openedTooltips.length > 0) {
                    self.updateTooltipPosition(self.openedTooltips[self.openedTooltips.length - 1]);
                }
                
                self.resetZoomAndPan();

                if (fullscreenMap) {
                    fullscreenMap.adjustSize();
                }
                
                self.adjustNavigatorSize();
            });
        },
        parseSettings: function () {
            // If there is a value for the old image URL in the settings, use that instead
            // This happens when the user updates from an older version using the old format and the
            // image map has not been saved yet.
            if (this.settings.general.image_url) {
                this.settings.image.url = this.settings.general.image_url;
            }
        },
        loadImage: function (image, cbLoading, cbComplete) {
            if (!image.complete || image.naturalWidth === undefined || image.naturalHeight === undefined) {
                cbLoading();
                $(image).on('load', function () {
                    $(image).off('load');
                    cbComplete();
                });
            } else {
                cbComplete();
            }
        },

        centerImageMap: function () {
            var self = this;

            if (parseInt(self.settings.general.center_image_map, 10) == 1) {
                self.wrap.css({
                    margin: '0 auto'
                });
            }
        },
        adjustSize: function () {
            var self = this;

            // If the image map is in fullscreen mode, adjust according to the window and return
            if (parseInt(self.settings.runtime.is_fullscreen, 10) == 1) {
                var screenRatio = $(window).width() / $(window).height();
                var imageRatio = self.settings.general.width / self.settings.general.height;

                if (imageRatio < screenRatio) {
                    self.settings.general.width = $(window).height() * imageRatio;
                    self.settings.general.height = $(window).height();
                } else {
                    self.settings.general.width = $(window).width();
                    self.settings.general.height = $(window).width() / imageRatio;
                }

                self.wrap.css({
                    width: self.settings.general.width,
                    height: self.settings.general.height,
                });

                return;
            }

            // If the image map is responsive, fit the map to its parent element
            if (parseInt(self.settings.general.responsive, 10) == 1) {
                if (parseInt(self.settings.general.preserve_quality, 10) == 1) {
                    var width = self.settings.general.naturalWidth || self.settings.general.width;
                    self.wrap.css({
                        'max-width': self.settings.general.naturalWidth
                    });
                }
            } else {
                self.wrap.css({
                    width: self.settings.general.width,
                    height: self.settings.general.height,
                });
            }
        },
        drawShapes: function () {
            var self = this;

            // Make sure spot coordinates are numbers
            for (var i = 0; i < self.settings.spots.length; i++) {
                var s = self.settings.spots[i];

                s.x = parseFloat(s.x);
                s.y = parseFloat(s.y);
                s.width = parseFloat(s.width);
                s.height = parseFloat(s.height);
                s.default_style.stroke_width = parseInt(s.default_style.stroke_width);
                s.mouseover_style.stroke_width = parseInt(s.mouseover_style.stroke_width);

                if (s.type == 'poly') {
                    for (var j = 0; j < s.points.length; j++) {
                        s.points[j].x = parseFloat(s.points[j].x);
                        s.points[j].y = parseFloat(s.points[j].y);
                    }
                }
            }

            self.settings.general.width = parseInt(self.settings.general.width);
            self.settings.general.height = parseInt(self.settings.general.height);

            self.zoomWrap.prepend('<div class="imp-shape-container"></div>');
            self.shapeContainer = self.wrap.find('.imp-shape-container');

            var html = '';
            var hasPolygons = false;

            // If the image map is responsive, use natural width and height
            // Otherwise, use the width/height set from the editor
            var imageMapWidth = self.settings.general.width;
            var imageMapHeight = self.settings.general.height;
            if (parseInt(self.settings.general.responsive, 10) == 1) {
                imageMapWidth = self.settings.general.naturalWidth;
                imageMapHeight = self.settings.general.naturalHeight;
            }
            var svgHtml = '<svg class="hs-poly-svg" viewBox="0 0 ' + imageMapWidth + ' ' + imageMapHeight + '" preserveAspectRatio="none">';

            for (var i = 0; i < self.settings.spots.length; i++) {
                // If layers are enabled and the shape does not belong to the currently active layer, then continue
                if (parseInt(self.settings.layers.enable_layers, 10) == 1 && parseInt(self.settings.spots[i].layerID, 10) != parseInt(self.settings.runtime.layerID)) {
                    continue;
                }

                var s = self.settings.spots[i];
                var style = this.calcStyles(s.default_style, i);

                if (s.type == 'spot') {
                    if (parseInt(s.default_style.use_icon, 10) == 1) {
                        var spotClass = 'imp-shape-spot';

                        if (parseInt(s.default_style.icon_is_pin, 10) == 1) {
                            spotClass += ' imp-shape-spot-pin'
                        }

                        html += '<div class="imp-shape '+ spotClass +'" id="' + s.id + '" data-shape-title="' + s.title + '" style="' + style + '" data-index=' + i + '>';

                        // Icon
                        if (s.default_style.icon_type == 'library') {
                            var iconStyle = 'color: ' + s.default_style.icon_fill + ';';
                            iconStyle += 'line-height: ' + s.height + 'px;';
                            iconStyle += 'font-size: ' + s.height + 'px;';

                            html += '   <div class="imp-spot-fontawesome-icon" style="'+ iconStyle +'">';
                            html += '       <i class="fa fa-'+ s.default_style.icon_fontawesome_id +'"></i>';
                            html += '   </div>';
                        }

                        if (s.default_style.icon_type == 'custom' && s.default_style.icon_url.length > 0) {
                            html += '<img src="' + s.default_style.icon_url + '" style="width: ' + s.width + 'px; height: ' + s.height + 'px">';
                        }

                        // Shadow
                        if (parseInt(s.default_style.icon_shadow, 10) == 1) {
                            var shadowStyle = '';

                            shadowStyle += 'width: ' + s.width + 'px;';
                            shadowStyle += 'height: ' + s.height + 'px;';
                            shadowStyle += 'top: ' + s.height / 2 + 'px;';

                            html += '<div style="' + shadowStyle + '" class="imp-shape-icon-shadow"></div>';
                        }

                        html += '</div>';
                    } else {
                        html += '<div class="imp-shape imp-shape-spot" id="' + s.id + '" data-shape-title="' + s.title + '" style="' + style + '" data-index=' + i + '></div>';
                    }
                }
                if (s.type == 'text') {
                    html += '<div class="imp-shape imp-shape-text" id="' + s.id + '" data-shape-title="' + s.title + '" style="' + style + '" data-index=' + i + '>'+ s.text.text +'</div>';
                }
                if (s.type == 'rect') {
                    html += '<div class="imp-shape imp-shape-rect" id="' + s.id + '" data-shape-title="' + s.title + '" style="' + style + '" data-index=' + i + '></div>';
                }
                if (s.type == 'oval') {
                    html += '<div class="imp-shape imp-shape-oval" id="' + s.id + '" data-shape-title="' + s.title + '" style="' + style + '" data-index=' + i + '></div>';
                }
                if (s.type == 'poly') {
                    svgHtml += '<polygon class="imp-shape imp-shape-poly" style="' + style + '" data-index=' + i + ' id="' + s.id + '" data-shape-title="' + s.title + '" points="';

                    var shapeWidthPx = imageMapWidth * (s.width / 100);
                    var shapeHeightPx = imageMapHeight * (s.height / 100);

                    s.vs = new Array();
                    for (var j = 0; j < s.points.length; j++) {
                        var x = (imageMapWidth * (s.x / 100)) + (s.points[j].x / 100) * (shapeWidthPx);
                        var y = (imageMapHeight * (s.y / 100)) + (s.points[j].y / 100) * (shapeHeightPx);

                        svgHtml += x + ',' + y + ' ';

                        // Cache an array of coordinates for later use in mouse events
                        s.vs.push([x, y]);
                    }

                    svgHtml += '"></polygon>';
                }
            }
            svgHtml += '</svg>';

            self.shapeContainer.html(html + svgHtml);
        },
        addTooltips: function () {
            var self = this;

            if (self.settings.tooltips.fullscreen_tooltips == 'always' || (self.settings.tooltips.fullscreen_tooltips == 'mobile-only' && isMobile())) {
                // Fullscreen tooltips
                if (!self.fullscreenTooltipsContainer) {
                    $('.imp-fullscreen-tooltips-container[data-image-map-id="' + self.settings.id + '"]').remove();
                    $('body').prepend('<div class="imp-fullscreen-tooltips-container" data-image-map-id="' + self.settings.id + '"></div>');
                    self.fullscreenTooltipsContainer = $('.imp-fullscreen-tooltips-container[data-image-map-id="' + self.settings.id + '"]');
                }

                var html = '';

                for (var i = 0; i < self.settings.spots.length; i++) {
                    var s = self.settings.spots[i];

                    var style = '';
                    var color_bg = hexToRgb(s.tooltip_style.background_color) || { r: 0, b: 0, g: 0 };

                    style += 'padding: ' + s.tooltip_style.padding + 'px;';
                    style += 'background: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');';

                    if (self.settings.tooltips.tooltip_animation == 'none') {
                        style += 'opacity: 0;';
                    }
                    if (self.settings.tooltips.tooltip_animation == 'fade') {
                        style += 'opacity: 0;';
                        style += 'transition-property: opacity;-moz-transition-property: opacity;-webkit-transition-property: opacity;';
                    }
                    if (self.settings.tooltips.tooltip_animation == 'grow') {
                        style += 'transform: scale(0, 0);-moz-transform: scale(0, 0);-webkit-transform: scale(0, 0);';
                        style += 'transition-property: transform;-moz-transition-property: -moz-transform;-webkit-transition-property: -webkit-transform;';
                        style += 'transform-origin: 50% 50%;-moz-transform-origin: 50% 50%;-webkit-transform-origin: 50% 50%;';
                    }

                    html += '<div class="imp-fullscreen-tooltip" style="' + style + '" data-index="' + i + '">';
                    html += '   <div class="imp-tooltip-close-button" data-index="' + i + '"><i class="fa fa-times" aria-hidden="true"></i></div>';

                    if (s.tooltip_content.content_type == 'plain-text') {
                        var style = '';
                        style += 'color: ' + s.tooltip_content.plain_text_color + ';';

                        html += '<div class="imp-tooltip-plain-text" style="' + style + '">' + s.tooltip_content.plain_text + '</div>';
                    } else {
                        if (s.tooltip_content.squares_json) {
                            html += $.squaresRendererRenderObject(s.tooltip_content.squares_json);
                        } else {
                            html += $.squaresRendererRenderObject(s.tooltip_content.squares_settings);
                        }
                    }

                    html += '</div>';
                }

                self.fullscreenTooltipsContainer.html(html);
            } else {
                // Regular tooltips
                var html = '';

                for (var i = 0; i < self.settings.spots.length; i++) {
                    var s = self.settings.spots[i];

                    var style = '';
                    var color_bg = hexToRgb(s.tooltip_style.background_color) || { r: 0, b: 0, g: 0 };

                    style += 'border-radius: ' + s.tooltip_style.border_radius + 'px;';
                    style += 'padding: ' + s.tooltip_style.padding + 'px;';
                    style += 'background: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');';

                    if (self.settings.tooltips.tooltip_animation == 'none') {
                        style += 'opacity: 0;';
                    }
                    if (self.settings.tooltips.tooltip_animation == 'fade') {
                        style += 'opacity: 0;';
                        style += 'transition-property: opacity;-moz-transition-property: opacity;-webkit-transition-property: opacity;';
                    }
                    if (self.settings.tooltips.tooltip_animation == 'grow') {
                        style += 'transform: scale(0, 0);-moz-transform: scale(0, 0);-webkit-transform: scale(0, 0);';
                        style += 'transition-property: transform;-moz-transition-property: -moz-transform;-webkit-transition-property: -webkit-transform;';

                        if (s.tooltip_style.position == 'top') {
                            style += 'transform-origin: 50% 100%;-moz-transform-origin: 50% 100%;-webkit-transform-origin: 50% 100%;';
                        }
                        if (s.tooltip_style.position == 'bottom') {
                            style += 'transform-origin: 50% 0%;-moz-transform-origin: 50% 0%;-webkit-transform-origin: 50% 0%;';
                        }
                        if (s.tooltip_style.position == 'left') {
                            style += 'transform-origin: 100% 50%;-moz-transform-origin: 100% 50%;-webkit-transform-origin: 100% 50%;';
                        }
                        if (s.tooltip_style.position == 'right') {
                            style += 'transform-origin: 0% 50%;-moz-transform-origin: 0% 50%;-webkit-transform-origin: 0% 50%;';
                        }
                    }

                    html += '<div class="imp-tooltip" style="' + style + '" data-index="' + i + '">';

                    if (s.tooltip_style.position == 'top') {
                        html += '   <div class="hs-arrow hs-arrow-bottom" style="border-top-color: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');"></div>';
                    }
                    if (s.tooltip_style.position == 'bottom') {
                        html += '   <div class="hs-arrow hs-arrow-top" style="border-bottom-color: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');"></div>';
                    }
                    if (s.tooltip_style.position == 'left') {
                        html += '   <div class="hs-arrow hs-arrow-right" style="border-left-color: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');"></div>';
                    }
                    if (s.tooltip_style.position == 'right') {
                        html += '   <div class="hs-arrow hs-arrow-left" style="border-right-color: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + s.tooltip_style.background_opacity + ');"></div>';
                    }

                    if (s.tooltip_content.content_type == 'plain-text') {
                        var style = '';
                        style += 'color: ' + s.tooltip_content.plain_text_color + ';';

                        html += '<div class="imp-tooltip-plain-text" style="' + style + '">' + s.tooltip_content.plain_text + '</div>';
                    } else {
                        if (s.tooltip_content.squares_json) {
                            html += $.squaresRendererRenderObject(s.tooltip_content.squares_json);
                        } else {
                            html += $.squaresRendererRenderObject(s.tooltip_content.squares_settings);
                        }
                    }

                    html += '</div>';
                }

                self.wrap.prepend(html);
            }
        },
        initFullscreen: function () {
            if (parseInt(this.settings.fullscreen.enable_fullscreen_mode, 10) == 1) {
                // Button style
                var style = '';
                style += 'background: ' + this.settings.fullscreen.fullscreen_button_color + '; ';
                style += 'color: ' + this.settings.fullscreen.fullscreen_button_text_color + '; ';

                // Button content
                var icon = '<i class="fa fa-arrows-alt" aria-hidden="true"></i>';
                if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                    icon = '<i class="fa fa-times" aria-hidden="true"></i>';
                }

                var text = 'Go Fullscreen';
                if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                    text = 'Close Fullscreen';
                }

                var buttonContent = '';
                if (this.settings.fullscreen.fullscreen_button_type == 'icon') {
                    buttonContent += icon;
                }
                if (this.settings.fullscreen.fullscreen_button_type == 'text') {
                    buttonContent += text;
                }
                if (this.settings.fullscreen.fullscreen_button_type == 'icon_and_text') {
                    buttonContent += icon + ' ' + text;
                }

                // Button classes
                var classes = '';
                if (this.settings.fullscreen.fullscreen_button_type == 'icon') {
                    classes += 'imp-fullscreen-button-icon-only';
                }

                // Button html
                var html = '';
                html += '<div style="' + style + '" class="imp-ui-element ' + classes + ' imp-fullscreen-button imp-fullscreen-button-position-' + this.settings.fullscreen.fullscreen_button_position + '">';
                html += buttonContent;
                html += '</div>';

                // Append
                this.ui.append(html);

                // Scroll to top
                if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                    $(window).scrollTop(0);
                    fullscreenMap = this;
                }

                // Correct the button's position
                var btn = this.ui.find('.imp-fullscreen-button');
                if (parseInt(this.settings.fullscreen.fullscreen_button_position, 10) == 1 || parseInt(this.settings.fullscreen.fullscreen_button_position, 10) == 4) {
                    btn.css({ "margin-left": - btn.outerWidth() / 2 });
                }

                // Start in fullscreen mode
                if (parseInt(this.settings.fullscreen.start_in_fullscreen_mode, 10) == 1 && this.settings.runtime.is_fullscreen == 0) {
                    this.toggleFullscreen();
                }
            }
        },
        initNavigator: function() {
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 1 && parseInt(this.settings.zooming.enable_navigator, 10) == 1) {
                this.uiNavigatorRoot = this.ui.find('.imp-ui-navigator-root');
                this.uiNavigatorImage = this.ui.find('.imp-ui-navigator-window-image');

                this.adjustNavigatorSize();
            }
        },
        initLayers: function() {
            // Is layers enabled?
            if (parseInt(this.settings.layers.enable_layers, 10) == 0) return;

            // If the layerID set in the runtime doesn't exist in the list of layers, then set the layerID to the first layer
            var exists = false;
            for (var i=0; i<this.settings.layers.layers_list.length; i++) {
                if (parseInt(this.settings.layers.layers_list[i].id, 10) == parseInt(this.settings.runtime.layerID, 10)) {
                    exists = true;
                }
            }

            if (!exists) {
                this.settings.runtime.layerID = this.settings.layers.layers_list[0].id;
            }

            // Set the value of the layers select
            this.wrap.find('.imp-ui-layers-select').val(this.settings.runtime.layerID);
        },
        initZoom: function() {
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 1) {
                // Reset zoom variables
                this.zoom = 1;
                this.targetZoom = 1;
                this.targetPanX = 0;
                this.actualPanX = 0;
                this.targetPanY = 0;
                this.actualPanY = 0;
                this.initialPanX = 0;
                this.initialPanY = 0;
                this.panDeltaY = 0;

                // Calculate max zoom level
                if (parseInt(this.settings.zooming.limit_max_zoom_to_image_size, 10) == 1) {
                    this.maxZoomLevel = this.settings.general.naturalWidth / this.wrap.width();
                } else {
                    this.maxZoomLevel = this.settings.zooming.max_zoom;
                }
            }
        },
        adjustNavigatorSize: function() {
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 0) return;
            if (parseInt(this.settings.zooming.enable_navigator, 10) == 0) return;

            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                // Calculate the ratio of the size of the navigator, compared to the actual size of the image
                this.navigatorRatio = this.uiNavigatorRoot.width() / this.settings.general.width;

                // Calculate the size of the navigator window
                var imageRatio = this.settings.general.naturalWidth / this.settings.general.naturalHeight;
                var windowRatio = window.innerWidth / window.innerHeight;
                var navigatorImageWidth = 0;
                var navigatorImageHeight = 0;

                if (imageRatio < windowRatio) {
                    if (imageRatio < 1) {
                        navigatorImageWidth = 150 * imageRatio;
                        navigatorImageHeight = 150;

                        this.uiNavigatorWindowWidth = navigatorImageHeight * windowRatio;
                        this.uiNavigatorWindowHeight = navigatorImageHeight;
                        this.navigatorMarginX = navigatorImageWidth/2 - this.uiNavigatorWindowWidth/2;
                        this.navigatorMarginY = 0;
                    } else {
                        navigatorImageWidth = 150;
                        navigatorImageHeight = 150 / imageRatio;

                        this.uiNavigatorWindowWidth = navigatorImageHeight * windowRatio;
                        this.uiNavigatorWindowHeight = navigatorImageHeight;

                        this.navigatorMarginX = navigatorImageWidth/2 - this.uiNavigatorWindowWidth/2;
                        this.navigatorMarginY = 0;
                    }
                } else {
                    if (imageRatio < 1) {
                        navigatorImageWidth = 150 * imageRatio;
                        navigatorImageHeight = 150;

                        this.uiNavigatorWindowWidth = navigatorImageWidth;
                        this.uiNavigatorWindowHeight = navigatorImageWidth / windowRatio;

                        this.navigatorMarginX = 0;
                        this.navigatorMarginY = navigatorImageHeight/2 - this.uiNavigatorWindowHeight/2;
                    } else {
                        navigatorImageWidth = 150;
                        navigatorImageHeight = 150 / imageRatio;

                        this.uiNavigatorWindowWidth = navigatorImageWidth;
                        this.uiNavigatorWindowHeight = navigatorImageWidth / windowRatio;

                        this.navigatorMarginX = 0;
                        this.navigatorMarginY = navigatorImageHeight/2 - this.uiNavigatorWindowHeight/2;
                    }
                }
            } else {
                // Calculate the ratio of the size of the navigator, compared to the actual size of the image
                this.navigatorRatio = this.uiNavigatorRoot.width() / this.wrap.width();
                this.uiNavigatorWindowWidth = this.uiNavigatorRoot.width();
                this.uiNavigatorWindowHeight = this.uiNavigatorRoot.height();
            }
        },
        measureTooltipSize: function (i) {
            // Size needs to be calculated just before
            // the tooltip displays, and for the specific tooltip only.
            // No calculations needed if in fullscreen mode

            // 1. Does size need to be calculated?
            if (this.settings.tooltips.fullscreen_tooltips == 'always' || (this.settings.tooltips.fullscreen_tooltips == 'mobile-only' && isMobile())) return;

            var s = this.settings.spots[i];
            var t = this.wrap.find('.imp-tooltip[data-index="' + i + '"]');

            // 2. If the tooltip has manual width, set it
            if (parseInt(s.tooltip_style.auto_width, 10) == 0) {
                t.css({
                    width: s.tooltip_style.width
                });
            }

            // 3. Measure width/height
            t.data('imp-measured-width', t.outerWidth());
            t.data('imp-measured-height', t.outerHeight());
        },
        animateShapesLoop: function () {
            if (this.settings.general.pageload_animation == 'none') return;

            var interval = 750 / this.settings.spots.length;
            var shapesRandomOrderArray = shuffle(this.settings.spots.slice());

            for (var i = 0; i < shapesRandomOrderArray.length; i++) {
                this.animateShape(shapesRandomOrderArray[i], interval * i);
            }
        },
        animateShape: function (shape, delay) {
            var self = this;
            var spotEl = $('#' + shape.id);

            setTimeout(function () {
                if (self.settings.general.pageload_animation == 'fade') {
                    spotEl.css({
                        opacity: shape.default_style.opacity
                    });
                }
                if (self.settings.general.pageload_animation == 'grow') {
                    spotEl.css({
                        transform: 'scale(1, 1)',
                        '-moz-transform': 'scale(1, 1)',
                        '-webkit-transform': 'scale(1, 1)'
                    });
                }
            }, delay);
        },
        events: function () {
            // to do - complete rewrite
            var self = this;

            // Mouse events
            this.wrap.off('mousedown');
            this.wrap.on('mousedown', function (e) {
                if (touch) return;
                self.handleEventStart(e);
            });
            this.wrap.off('mousemove');
            this.wrap.on('mousemove', function (e) {
                if (touch) return;
                self.handleEventMove(e);
            });
            this.wrap.off('mouseup');
            this.wrap.on('mouseup', function (e) {
                if (touch) return;
                
                self.handleEventEnd(e);
            });
            this.wrap.off('mousewheel');
            this.wrap.on('mousewheel', function (e) {
                if (touch) return;
                self.handleEventEnd(e);

                if (parseInt(self.settings.zooming.enable_zooming, 10) == 1) {
                    if ((e.deltaY < 0 && self.targetZoom > 1) || (e.deltaY > 0 && self.targetZoom < self.maxZoomLevel)) {
                        return false;
                    }
                }
            });

            // Touch events
            this.wrap.off('touchstart');
            this.wrap.on('touchstart', function (e) {
                touch = true;
                self.handleEventStart(e);
                // if ($(e.target).closest('.imp-ui').length > 0) {
                //     return false;
                // }
                if (self.pinching) return false;
            });
            this.wrap.off('touchmove');
            this.wrap.on('touchmove', function (e) {
                self.handleEventMove(e);
                
                if (self.panning && self.panDeltaY != 0) return false;
                if (self.pinching) return false;
            });
            this.wrap.off('touchend');
            this.wrap.on('touchend', function (e) {
                self.handleEventEnd(e);
            });

            // Global events

            // Hide tooltips when mouse leaves the image map container
            $(document).off('mousemove.' + this.settings.id);
            $(document).on('mousemove.' + this.settings.id, function (e) {
                if (self.touch) return;

                // Is the event outsite the current image map container?
                if (($(e.target).closest('.imp-wrap').length == 0 || $(e.target).closest('[data-image-map-pro-id="' + self.settings.id + '"]').length == 0) && $(e.target).closest('.imp-fullscreen-tooltips-container').length == 0) {
                    // Is the tooltip open method set to "mouseover"?
                    if (self.settings.tooltips.show_tooltips == 'mouseover') {
                        // If the event is not inside an HTML API tooltip mouseover element, then hide all tooltips
                        if ($(e.target).closest('[data-imp-open-tooltip-on-mouseover]').length == 0 && $(e.target).closest('[data-imp-trigger-shape-on-mouseover]').length == 0) {
                            self.hideAllTooltips();
                        }
                    }

                    // If the event is not inside an HTML API shape highlight mouseover element, then unhighlight all shapes
                    if ($(e.target).closest('[data-imp-highlight-shape-on-mouseover]').length == 0 && $(e.target).closest('[data-imp-trigger-shape-on-mouseover]').length == 0) {
                        self.unhighlightAllShapes();
                    }
                }

                // Pan
                if (self.panning) {
                    var p = self.getEventCoordinates(e);
                    self.pan(p.x, p.y);
                }
            });
            $(document).off('touchstart.' + this.settings.id);
            $(document).on('touchstart.' + this.settings.id, function (e) {
                // Is the event outsite the current image map container?
                if (($(e.target).closest('.imp-wrap').length == 0 || $(e.target).closest('[data-image-map-pro-id="' + self.settings.id + '"]').length == 0) && $(e.target).closest('.imp-fullscreen-tooltips-container').length == 0) {

                    // Is the tooltip open method set to "mouseover"?
                    if (self.settings.tooltips.show_tooltips == 'mouseover') {
                        // If the event is not inside an HTML API tooltip mouseover element, then hide all tooltips
                        if ($(e.target).closest('[data-imp-open-tooltip-on-mouseover]').length == 0 && $(e.target).closest('[data-imp-trigger-shape-on-mouseover]').length == 0) {
                            self.hideAllTooltips();
                        }
                    }

                    // If the event is not inside an HTML API shape highlight mouseover element, then unhighlight all shapes
                    if ($(e.target).closest('[data-imp-highlight-shape-on-mouseover]').length == 0 && $(e.target).closest('[data-imp-trigger-shape-on-mouseover]').length == 0) {
                        self.unhighlightAllShapes();
                    }
                }
            });
            $(document).off('mouseup.' + this.settings.id);
            $(document).on('mouseup.' + this.settings.id, function (e) {
                if (self.touch) return;

                // Is the event outsite the current image map container?
                if (($(e.target).closest('.imp-wrap').length == 0 || $(e.target).closest('[data-image-map-pro-id="' + self.settings.id + '"]').length == 0) && $(e.target).closest('.imp-fullscreen-tooltips-container').length == 0) {
                    // Is the tooltip open method set to "click"?
                    if (self.settings.tooltips.show_tooltips == 'click') {
                        self.hideAllTooltips();
                    }
                    self.unhighlightAllShapes();
                }

                // Pan
                if (self.panning) self.panning = false;
            });
            $(document).off('touchend.' + this.settings.id);
            $(document).on('touchend.' + this.settings.id, function (e) {
                // Is the event outsite the current image map container?
                if (($(e.target).closest('.imp-wrap').length == 0 || $(e.target).closest('[data-image-map-pro-id="' + self.settings.id + '"]').length == 0) && $(e.target).closest('.imp-fullscreen-tooltips-container').length == 0) {
                    // Is the tooltip open method set to "click"?
                    if (self.settings.tooltips.show_tooltips == 'click') {
                        self.hideAllTooltips();
                    }
                    self.unhighlightAllShapes();
                }
            });

            // Tooltips close button
            $(document).off('click.' + this.settings.id, '.imp-tooltip-close-button');
            $(document).on('click.' + this.settings.id, '.imp-tooltip-close-button', function () {
                self.hideAllTooltips();
            });

            // Layers select
            $(document).off('change.' + this.settings.id, '.imp-ui-layers-select');
            $(document).on('change.' + this.settings.id, '.imp-ui-layers-select', function() {
                var newID = self.wrap.find('.imp-ui-layers-select').val();
                self.switchLayer(newID);
            });

            // Fullscreen button
            // $(document).off('click.' + this.settings.id, '[data-image-map-pro-ui-id="' + this.settings.id + '"] .imp-fullscreen-button');
            // $(document).on('click.' + this.settings.id, '[data-image-map-pro-ui-id="' + this.settings.id + '"] .imp-fullscreen-button', function () {
            //     self.toggleFullscreen();
            // });
        },
        APIEvents: function () {
            /*

            HTML API
            ---------------------------------------
            data-imp-highlight-shape-on-mouseover
            data-imp-highlight-shape-on-click
            data-imp-unhighlight-shape-on-mouseover
            data-imp-unhighlight-shape-on-click

            data-imp-open-tooltip-on-mouseover
            data-imp-open-tooltip-on-click
            data-imp-close-tooltip-on-mouseover
            data-imp-close-tooltip-on-click

            data-imp-trigger-shape-on-mouseover
            data-imp-trigger-shape-on-click
            data-imp-untrigger-shape-on-mouseover
            data-imp-untrigger-shape-on-click

            */

            // HTML API - SHAPE

            var self = this;

            // [data-imp-highlight-shape-on-mouseover]
            $(document).on('mouseover', '[data-imp-highlight-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-highlight-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');

                    self.highlightShape(i, true);
                }
            });
            $(document).on('mouseout', '[data-imp-highlight-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-highlight-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    self.unhighlightAllShapes();
                }
            });

            // [data-imp-highlight-shape-on-click]
            $(document).on('click', '[data-imp-highlight-shape-on-click]', function () {
                var shapeName = $(this).data('imp-highlight-shape-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    self.highlightShape(i, true);

                    // Add shape to the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) == -1) {
                        instances[mapName].apiHighlightedShapes.push(i);
                    }

                    // If the shape is a master, then add its slaves too
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            if (instances[mapName].apiHighlightedShapes.indexOf(index) == -1) {
                                instances[mapName].apiHighlightedShapes.push(index);
                            }
                        }
                    }
                }
            });

            // [data-imp-unhighlight-shape-on-mouseover]
            $(document).on('mouseover', '[data-imp-unhighlight-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-unhighlight-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    // Remove the shape from the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiHighlightedShapes.indexOf(i);
                        instances[mapName].apiHighlightedShapes.splice(arrayIndex, 1);
                    }

                    // If the shape is a master, then remove its slaves too, and unhighlight them
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            var index2 = instances[mapName].apiHighlightedShapes.indexOf(index);
                            instances[mapName].apiHighlightedShapes.splice(index2, 1);
                            instances[mapName].unhighlightShape(index);
                        }
                    }

                    self.unhighlightShape(i);
                }
            });

            // [data-imp-unhighlight-shape-on-click]
            $(document).on('click', '[data-imp-unhighlight-shape-on-click]', function () {
                var shapeName = $(this).data('imp-unhighlight-shape-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    // Remove the shape from the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiHighlightedShapes.indexOf(i);
                        instances[mapName].apiHighlightedShapes.splice(arrayIndex, 1);
                    }

                    // If the shape is a master, then remove its slaves too, and unhighlight them
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            var index2 = instances[mapName].apiHighlightedShapes.indexOf(index);
                            instances[mapName].apiHighlightedShapes.splice(index2, 1);
                            instances[mapName].unhighlightShape(index);
                        }
                    }

                    self.unhighlightShape(i);
                }
            });

            // HTML API - TOOLTIP

            // [data-imp-open-tooltip-on-mouseover]
            $(document).on('mouseover', '[data-imp-open-tooltip-on-mouseover]', function () {
                var shapeName = $(this).data('imp-open-tooltip-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');

                    self.showTooltip(i);
                    self.updateTooltipPosition(i);
                }
            });
            $(document).on('mouseout', '[data-imp-open-tooltip-on-mouseover]', function () {
                var shapeName = $(this).data('imp-open-tooltip-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    self.hideAllTooltips();
                }
            });

            // [data-imp-open-tooltip-on-click]
            $(document).on('click', '[data-imp-open-tooltip-on-click]', function () {
                var shapeName = $(this).data('imp-open-tooltip-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    self.showTooltip(i);
                    self.updateTooltipPosition(i);

                    // Add the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) == -1) {
                        instances[mapName].apiOpenedTooltips.push(i);
                    }
                }
            });

            // [data-imp-close-tooltip-on-mouseover]
            $(document).on('mouseover', '[data-imp-close-tooltip-on-mouseover]', function () {
                var shapeName = $(this).data('imp-close-tooltip-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    // Remove the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiOpenedTooltips.indexOf(i);
                        instances[mapName].apiOpenedTooltips.splice(arrayIndex, 1);
                    }

                    self.hideTooltip(i);
                }
            });

            // [data-imp-close-tooltip-on-click]
            $(document).on('click', '[data-imp-close-tooltip-on-click]', function () {
                var shapeName = $(this).data('imp-close-tooltip-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    // Remove the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiOpenedTooltips.indexOf(i);
                        instances[mapName].apiOpenedTooltips.splice(arrayIndex, 1);
                    }

                    self.hideTooltip(i);
                }
            });

            // HTML API - TRIGGER

            // [data-imp-trigger-shape-on-mouseover]
            $(document).on('mouseover', '[data-imp-trigger-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-trigger-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    self.highlightShape(i, true);
                    self.showTooltip(i);
                    self.updateTooltipPosition(i);
                }
            });
            $(document).on('mouseout', '[data-imp-trigger-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-trigger-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    self.unhighlightAllShapes();
                    self.hideAllTooltips();
                }
            });

            // [data-imp-trigger-shape-on-click]
            $(document).on('click', '[data-imp-trigger-shape-on-click]', function () {
                var shapeName = $(this).data('imp-trigger-shape-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    self.highlightShape(i, true);
                    self.showTooltip(i);
                    self.updateTooltipPosition(i);

                    // Add the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) == -1) {
                        instances[mapName].apiOpenedTooltips.push(i);
                    }

                    // Add shape to the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) == -1) {
                        instances[mapName].apiHighlightedShapes.push(i);
                    }

                    // If the shape is a master, then add its slaves too
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            if (instances[mapName].apiHighlightedShapes.indexOf(index) == -1) {
                                instances[mapName].apiHighlightedShapes.push(index);
                            }
                        }
                    }
                }
            });

            // [data-imp-untrigger-shape-on-mouseover]
            $(document).on('mouseover', '[data-imp-untrigger-shape-on-mouseover]', function () {
                var shapeName = $(this).data('imp-untrigger-shape-on-mouseover');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    // Remove the shape from the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiHighlightedShapes.indexOf(i);
                        instances[mapName].apiHighlightedShapes.splice(arrayIndex, 1);
                    }

                    // If the shape is a master, then remove its slaves too, and unhighlight them
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            var index2 = instances[mapName].apiHighlightedShapes.indexOf(index);
                            instances[mapName].apiHighlightedShapes.splice(index2, 1);
                            instances[mapName].unhighlightShape(index);
                        }
                    }

                    self.unhighlightShape(i);

                    // Remove the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiOpenedTooltips.indexOf(i);
                        instances[mapName].apiOpenedTooltips.splice(arrayIndex, 1);
                    }

                    self.hideTooltip(i);
                }
            });

            // [data-imp-untrigger-shape-on-click]
            $(document).on('click', '[data-imp-untrigger-shape-on-click]', function () {
                var shapeName = $(this).data('imp-untrigger-shape-on-click');
                var mapName = $(this).data('imp-image-map-name');
                if (!mapName) mapName = self.settings.general.name;

                if (mapName == self.settings.general.name) {
                    var i = $('[data-shape-title="' + shapeName + '"]').data('index');
                    var s = self.settings.spots[i];

                    // Remove the shape from the list of highlighted shapes by the API
                    if (instances[mapName].apiHighlightedShapes.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiHighlightedShapes.indexOf(i);
                        instances[mapName].apiHighlightedShapes.splice(arrayIndex, 1);
                    }

                    // If the shape is a master, then remove its slaves too, and unhighlight them
                    if (instances[mapName].connectedShapes[s.id]) {
                        for (var j = 0; j < instances[mapName].connectedShapes[s.id].length; j++) {
                            var index = instances[mapName].connectedShapes[s.id][j].index;
                            var index2 = instances[mapName].apiHighlightedShapes.indexOf(index);
                            instances[mapName].apiHighlightedShapes.splice(index2, 1);
                            instances[mapName].unhighlightShape(index);
                        }
                    }

                    self.unhighlightShape(i);

                    // Remove the tooltip to the list of tooltips opened with the API
                    if (instances[mapName].apiOpenedTooltips.indexOf(i) != -1) {
                        var arrayIndex = instances[mapName].apiOpenedTooltips.indexOf(i);
                        instances[mapName].apiOpenedTooltips.splice(arrayIndex, 1);
                    }

                    self.hideTooltip(i);
                }
            });
        },
        disableEvents: function () {
            this.wrap.off('mousemove');
            this.wrap.off('mouseup');

            // Touch events
            this.wrap.off('touchstart');
            this.wrap.off('touchmove');
            this.wrap.off('touchend');

            // Hide tooltips when mouse leaves the image map container
            $(document).off('mousemove.' + this.settings.id);
            $(document).off('touchstart.' + this.settings.id);

            // Tooltips close button
            $(document).off('click.' + this.settings.id, '.imp-tooltip-close-button');

            // Fullscreen button
            $(document).off('click.' + this.settings.id, '.imp-fullscreen-button');
        },
        handleEventStart: function(e) {
            var p = this.getEventCoordinates(e);

            // Is zooming enabled?
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 1) {
                // Pan on navigator
                if ($(e.target).closest('.imp-ui-navigator-root').length > 0) {
                    this.ix = p.x;
                    this.iy = p.y;

                    this.panningOnNavigator = true;
                    return;
                }

                // Pinch
                if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
                    this.pinchInitial[0] = { x: e.originalEvent.touches[0].pageX, y: e.originalEvent.touches[0].pageY };
                    this.pinchInitial[1] = { x: e.originalEvent.touches[1].pageX, y: e.originalEvent.touches[1].pageY };

                    this.initialPanX = this.actualPanX;
                    this.initialPanY = this.actualPanY;

                    this.ix = (e.originalEvent.touches[0].pageX + e.originalEvent.touches[1].pageX) / 2;
                    this.iy = (e.originalEvent.touches[0].pageY + e.originalEvent.touches[1].pageY) / 2;

                    this.lastX = this.ix;
                    this.lastY = this.iy;

                    this.pinchInitialDistance = Math.sqrt(Math.pow(this.pinchInitial[1].x - this.pinchInitial[0].x, 2) + Math.pow(this.pinchInitial[1].y - this.pinchInitial[0].y, 2));
                    this.pinchInitialZoom = this.zoom;

                    this.pinching = true;
                    return;
                }

                // Pan
                if (!this.panning && $(e.target).closest('.imp-ui').length == 0) {
                    this.ix = p.x;
                    this.iy = p.y;

                    this.initialPanX = this.actualPanX;
                    this.initialPanY = this.actualPanY;

                    this.panning = true;
                }
            }
        },
        handleEventMove: function (e) {
            // If there is a visible fullscreen tooltip, return
            if (this.fullscreenTooltipVisible) return;

            // If the mouse is over a tooltip AND sticky tooltips are OFF, return
            // if (($(e.target).closest('.imp-tooltip').length != 0 || $(e.target).hasClass('imp-tooltip')) && parseInt(this.settings.tooltips.sticky_tooltips, 10) == 0) return;

            // Get event data
            var c = this.getEventRelativeCoordinates(e);
            var i = this.matchShapeToCoords(c);

            // Is zooming enabled?
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 1) {
                // Pan on navigator
                if (this.panningOnNavigator) {
                    var p = this.getEventCoordinates(e);

                    var x = (p.x - this.uiNavigatorRoot.offset().left) / this.navigatorRatio * this.targetZoom;
                    var y = (p.y - this.uiNavigatorRoot.offset().top) / this.navigatorRatio * this.targetZoom;

                    this.panTo(x, y);
                    return;
                }

                // Pinch
                if (this.pinching) {
                    this.pinch(e);
                    this.didPan = true;
                    return;
                }

                // Pan
                if (this.panning) {
                    var p = this.getEventCoordinates(e);
                    this.pan(p.x, p.y);
                    this.didPan = true;
                    return;
                }
            }
            
            // If there is a tooltip under the event, and sticky tooltips are turned off, then return
            if (this.isPointInsideVisibleTooltip(e) && parseInt(this.settings.tooltips.sticky_tooltips, 10) == 0) {
                return;
            }

            // If the mouse is over a UI element, then return
            if ($(e.target).closest('.imp-ui').length == 1) {
                this.unhighlightAllShapes();
                if (this.settings.tooltips.show_tooltips == 'mouseover') {
                    this.hideAllTooltips();
                }
                return;
            }

            // There is a shape under the event
            if (i != -1) {
                if (!this.didPan) {
                    // If the shape is not highlighted, 
                    // then highlight it, hide any visible tooltip and unhighlight all other shapes
                    if (!this.isShapeHighlighted(i)) {
                        this.unhighlightAllShapes();
                        if (this.settings.tooltips.show_tooltips == 'mouseover') {
                            this.hideAllTooltips();
                        }

                        this.highlightShape(i, true);
                    }

                    // If tooltips are set to show on mouseover, show the tooltip for the shape under the event
                    if (this.settings.tooltips.show_tooltips == 'mouseover' && parseInt(this.settings.tooltips.enable_tooltips, 10) == 1 && parseInt(this.settings.spots[i].tooltip_style.enable_tooltip, 10) == 1) {
                        this.showTooltip(i);
                    }

                    // If there is a visible tooltip and sticky tooltips is on, then update the position of the last opened tooltip
                    if (this.openedTooltips.length > 0 && parseInt(this.settings.tooltips.sticky_tooltips, 10) == 1) {
                        // Tooltips must be set to show on mouseover
                        if (this.settings.tooltips.show_tooltips == 'mouseover') {
                            this.updateTooltipPosition(this.openedTooltips[this.openedTooltips.length - 1], e);
                        }
                    }
                }
            }

            // There is no shape under the event
            if (i == -1) {
                // Unhighlight all shapes and hide any visible tooltip
                this.unhighlightAllShapes();
                if (this.settings.tooltips.show_tooltips == 'mouseover') {
                    this.hideAllTooltips();
                }
            }
        },
        handleEventEnd: function (e) {
            // Is zooming enabled?
            if (parseInt(this.settings.zooming.enable_zooming, 10) == 1) {
                
                // Zooming
                if (e.type == 'mousewheel') {
                    if (e.deltaY > 0) {
                        this.zoomIn(e);
                    }
                    if (e.deltaY < 0) {
                        this.zoomOut(e);
                    }

                    return;
                }

                // Navigator pan
                if (this.panningOnNavigator) {
                    this.panningOnNavigator = false;
                }
                // Navigator click
                if ($(e.target).closest('.imp-ui-navigator-root').length > 0) {
                    var p = this.getEventCoordinates(e);

                    var x = (p.x - this.uiNavigatorRoot.offset().left) / this.navigatorRatio * this.targetZoom;
                    var y = (p.y - this.uiNavigatorRoot.offset().top) / this.navigatorRatio * this.targetZoom;

                    this.panTo(x, y);

                    return;
                }

                // Zoom button click
                if ($(e.target).closest('.imp-ui-zoom-button').length > 0) {
                    if ($(e.target).closest('.imp-ui-zoom-button-zoom-in').length > 0) {
                        this.zoomIn();
                    } else {
                        this.zoomOut();
                    }

                    return;
                }

                // Panning
                if (this.panning) {
                    this.panning = false;
                }

                // Pinching
                if (this.pinching) {
                    this.pinching = false;
                }
            }

            // Fullscreen button click
            if ($(e.target).closest('.imp-fullscreen-button').length > 0) {
                this.toggleFullscreen();
            }

            // Layers switch click
            if ($(e.target).closest('.imp-ui-layer-switch-up').length > 0) {
                for (var i=0; i<this.settings.layers.layers_list.length; i++) {
                    if (this.settings.layers.layers_list[i].id == this.settings.runtime.layerID && i > 0) {
                        var newLayerID = this.settings.layers.layers_list[i - 1].id;
                        this.switchLayer(newLayerID);
                        break;
                    }
                }
            }
            if ($(e.target).closest('.imp-ui-layer-switch-down').length > 0) {
                for (var i=0; i<this.settings.layers.layers_list.length; i++) {
                    if (this.settings.layers.layers_list[i].id == this.settings.runtime.layerID && i < this.settings.layers.layers_list.length - 1) {
                        var newLayerID = this.settings.layers.layers_list[i + 1].id;
                        this.switchLayer(newLayerID);
                        break;
                    }
                }
            }
            
            // Did the user click on a tooltip?
            if ($(e.target).closest('.imp-tooltip').length != 0) {
                return;
            }

            // If there is a visible fullscreen tooltip, return
            if (this.fullscreenTooltipVisible) return;

            // If the mouse is over a UI element, then return
            if ($(e.target).closest('.imp-ui').length == 1) {
                this.unhighlightAllShapes();
                if (this.settings.tooltips.show_tooltips == 'mouseover') {
                    this.hideAllTooltips();
                }
                return;
            }

            // Get event data
            var c = this.getEventRelativeCoordinates(e);
            var i = this.matchShapeToCoords(c);

            // There is a shape under the event
            if (i != -1) {
                if (!this.didPan) {
                    // If the shape is not highlighted, 
                    // then highlight it, hide any visible tooltip and unhighlight all other shapes
                    if (!this.isShapeHighlighted(i)) {
                        this.unhighlightAllShapes();
                        if (this.settings.tooltips.show_tooltips == 'mouseover') {
                            this.hideAllTooltips();
                        }

                        this.highlightShape(i, true);
                    }

                    // Show the tooltip for the shape under the event
                    if (parseInt(this.settings.tooltips.enable_tooltips, 10) == 1 && parseInt(this.settings.spots[i].tooltip_style.enable_tooltip, 10) == 1) {
                        this.showTooltip(i);
                    }

                    // If there is a visible tooltip and sticky tooltips is on, then update the position of the last opened tooltip
                    if (this.openedTooltips.length > 0 && parseInt(this.settings.tooltips.sticky_tooltips, 10) == 1) {
                        // Tooltips must be set to show on mouseover
                        if (this.settings.tooltips.show_tooltips == 'mouseover') {
                            this.updateTooltipPosition(this.openedTooltips[this.openedTooltips.length - 1], e);
                        }
                    }
                }

                // Do click action for the shape
                this.performClickAction(i);
            }

            // There is no shape under the event
            if (i == -1) {
                // Hide any visible tooltips
                this.hideAllTooltips();

                if (!this.didPan) {
                    this.unhighlightAllShapes();
                }
            }

            if (e.originalEvent.touches && e.originalEvent.touches.length == 0) {
                this.didPan = false;
            }
            if (!e.originalEvent.touches) {
                this.didPan = false;
            }
        },

        getEventRelativeCoordinates: function (e) {
            var x, y;

            if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
                var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                x = touch.pageX;
                y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
                x = e.pageX;
                y = e.pageY;
            }

            // Make coordinates relative to the container
            x -= this.zoomWrap.offset().left;
            y -= this.zoomWrap.offset().top;

            // Convert coordinates to %
            x = (x / (this.wrap.width() * this.zoom)) * 100;
            y = (y / (this.wrap.height() * this.zoom)) * 100;

            return { x: x, y: y };
        },
        getEventCoordinates: function (e) {
            var x, y;

            if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
                var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                x = touch.pageX;
                y = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
                x = e.pageX;
                y = e.pageY;
            }

            return { x: x, y: y };
        },
        matchShapeToCoords: function (c) {
            for (var i = this.settings.spots.length - 1; i >= 0; i--) {
                // If layers are enabled and the shape does not belong to the currently active layer, then continue
                if (parseInt(this.settings.layers.enable_layers, 10) == 1 && parseInt(this.settings.spots[i].layerID, 10) != parseInt(this.settings.runtime.layerID)) {
                    continue;
                }

                var s = this.settings.spots[i];

                if (s.type == 'poly') {
                    var x = (c.x / 100) * this.zoomWrap.width();
                    var y = (c.y / 100) * this.zoomWrap.height();

                    x = (x * this.settings.general.naturalWidth) / this.zoomWrap.width();
                    y = (y * this.settings.general.naturalHeight) / this.zoomWrap.height();

                    if (isPointInsidePolygon(x, y, s.vs)) {
                        return i;
                        break;
                    }
                }

                if (s.type == 'spot') {
                    var shapeWidth = (s.width < 44) ? 44 : s.width;
                    var shapeHeight = (s.height < 44) ? 44 : s.height;

                    shapeWidth /= this.zoom;
                    shapeHeight /= this.zoom;

                    var x = (c.x / 100) * this.wrap.width();
                    var y = (c.y / 100) * this.wrap.height();
                    var rx = (s.x / 100) * this.wrap.width() - shapeWidth / 2;
                    var ry = (s.y / 100) * this.wrap.height() - shapeHeight / 2;
                    var rw = shapeWidth;
                    var rh = shapeHeight;

                    if (parseInt(s.default_style.icon_is_pin, 10) == 1 && parseInt(s.default_style.use_icon, 10) == 1) {
                        ry -= shapeHeight / 2;

                        if (s.height < 44) {
                            ry += s.height / 2;
                        }
                    }

                    if (isPointInsideRect(x, y, rx, ry, rw, rh)) {
                        return i;
                        break;
                    }
                }

                if (s.type == 'rect') {
                    if (isPointInsideRect(c.x, c.y, s.x, s.y, s.width, s.height)) {
                        return i;
                        break;
                    }
                }

                if (s.type == 'oval') {
                    var x = c.x;
                    var y = c.y;
                    var ex = s.x + s.width / 2;
                    var ey = s.y + s.height / 2;
                    var rx = s.width / 2;
                    var ry = s.height / 2;

                    if (isPointInsideEllipse(x, y, ex, ey, rx, ry)) {
                        return i;
                        break;
                    }
                }

                if (s.type == 'text') continue;
            }

            return -1;
        },
        isPointInsideVisibleTooltip: function (e) {
            for (var i = 0; i < this.openedTooltips.length; i++) {
                var p = this.getEventCoordinates(e);
                var t = this.wrap.find('.imp-tooltip[data-index="' + this.openedTooltips[i] + '"]');
                var index = this.openedTooltips[i];

                p.x = ((p.x - this.wrap.offset().left) / this.wrap.width()) * 100;
                p.y = ((p.y - this.wrap.offset().top) / this.wrap.height()) * 100;

                var buffer = 0;
                if (this.settings.spots[index].type == 'spot') {
                    buffer = this.settings.spots[index].tooltip_style.buffer;
                } else {
                    buffer = this.settings.spots[index].tooltip_style.buffer * this.zoom;
                }

                var tw = t.outerWidth();
                var th = t.outerHeight();
                var tx = t.offset().left - this.wrap.offset().left;
                var ty = t.offset().top - this.wrap.offset().top;

                // Convert tooltip x/y/w/h from px to %
                tx = (tx / this.wrap.width()) * 100;
                ty = (ty / this.wrap.height()) * 100;
                tw = (tw / this.wrap.width()) * 100;
                th = (th / this.wrap.height()) * 100;

                // Create a polygon, representing the buffer space
                var poly = [];

                if (this.settings.spots[index].tooltip_style.position == 'left') {
                    // Convert buffer from px to %
                    buffer = (buffer / this.wrap.width()) * 100;

                    var poly = [
                        [tx, ty],
                        [tx + tw, ty],
                        [tx + tw + buffer, ty + th - th / 3 - th / 3],
                        [tx + tw + buffer, ty + th - th / 3],
                        [tx + tw, ty + th],
                        [tx, ty + th]
                    ];
                }
                if (this.settings.spots[index].tooltip_style.position == 'right') {
                    // Convert buffer from px to %
                    buffer = (buffer / this.wrap.width()) * 100;

                    var poly = [
                        [tx, ty],
                        [tx + tw, ty],
                        [tx + tw, ty + th],
                        [tx, ty + th],
                        [tx - buffer, ty + th - th / 3],
                        [tx - buffer, ty + th - th / 3 - th / 3]
                    ];
                }
                if (this.settings.spots[index].tooltip_style.position == 'top') {
                    // Convert buffer from px to %
                    buffer = (buffer / this.wrap.height()) * 100;

                    var poly = [
                        [tx, ty],
                        [tx + tw, ty],
                        [tx + tw, ty + th],
                        [tx + tw - tw / 3, ty + th + buffer],
                        [tx + tw - tw / 3 - tw / 3, ty + th + buffer],
                        [tx, ty + th]
                    ];
                }
                if (this.settings.spots[index].tooltip_style.position == 'bottom') {
                    // Convert buffer from px to %
                    buffer = (buffer / this.wrap.height()) * 100;

                    var poly = [
                        [tx, ty],
                        [tx + tw - tw / 3 - tw / 3, ty - buffer],
                        [tx + tw - tw / 3, ty - buffer],
                        [tx + tw, ty],
                        [tx + tw, ty + th],
                        [tx, ty + th]
                    ];
                }

                if (isPointInsidePolygon(p.x, p.y, poly)) {
                    return true;
                }

                return false;
            }
        },
        getIndexOfShapeWithID: function (id) {
            for (var i = 0; i < this.settings.spots.length; i++) {
                if (this.settings.spots[i].id == id) return i;
            }
        },
        // Calculates style string for shape with index "i" and styles "styles"
        calcStyles: function (styles, i) {
            // The shape object
            var s = this.settings.spots[i];

            // The computed styles
            var style = '';

            // The shape is a Spot
            if (s.type == 'spot') {
                style += 'left: ' + s.x + '%;';
                style += 'top: ' + s.y + '%;';
                style += 'width: ' + s.width + 'px;';
                style += 'height: ' + s.height + 'px;';
                style += 'opacity: ' + styles.opacity + ';';
                style += 'transform: scale(' + (1/this.zoom) + ');';

                var marginTop = -s.width / 2;
                var marginLeft = -s.height / 2;

                // The spot is not an icon
                if (parseInt(s.default_style.use_icon, 10) == 0) {
                    var color_bg = hexToRgb(styles.background_color) || { r: 0, b: 0, g: 0 };
                    var color_border = hexToRgb(styles.border_color) || { r: 0, b: 0, g: 0 };

                    style += 'border-radius: ' + styles.border_radius + 'px;';
                    style += 'background: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + styles.background_opacity + ');';
                    style += 'border-width: ' + styles.border_width + 'px;';
                    style += 'border-style: ' + styles.border_style + ';';
                    style += 'border-color: rgba(' + color_border.r + ', ' + color_border.g + ', ' + color_border.b + ', ' + styles.border_opacity + ');';
                }

                // The spot is an icon
                if (parseInt(s.default_style.use_icon, 10) == 1) {
                    // If the icon is a pin, center it on the bottom edge
                    if (parseInt(s.default_style.icon_is_pin, 10) == 1) {
                        marginTop = -s.height;
                    }
                }

                style += 'margin-left: ' + marginLeft + 'px;';
                style += 'margin-top: ' + marginTop + 'px;';
            }

            // The shape is Text
            if (s.type == 'text') {
                var c = hexToRgb(s.text.text_color);

                style += 'left: ' + s.x + '%;';
                style += 'top: ' + s.y + '%;';
                style += 'font-family: ' + s.text.font_family + ';';
                style += 'font-size: ' + s.text.font_size + 'px;';
                style += 'font-weight: ' + s.text.font_weight + ';';
                style += 'color: rgba('+ c.r +', '+ c.g +', '+ c.b +', '+ s.text.text_opacity +');';
            }

            // The shape is a Rect or Oval
            if (s.type == 'rect' || s.type == 'oval') {
                // If the shape is an Oval, apply 50% 50% border radius
                var borderRadius = styles.border_radius + 'px';
                if (s.type == 'oval') {
                    borderRadius = '50% 50%';
                }

                var color_bg = hexToRgb(styles.background_color) || { r: 0, b: 0, g: 0 };
                var color_border = hexToRgb(styles.border_color) || { r: 0, b: 0, g: 0 };

                style += 'left: ' + s.x + '%;';
                style += 'top: ' + s.y + '%;';
                style += 'width: ' + s.width + '%;';
                style += 'height: ' + s.height + '%;';

                style += 'opacity: ' + styles.opacity + ';';
                style += 'background: rgba(' + color_bg.r + ', ' + color_bg.g + ', ' + color_bg.b + ', ' + styles.background_opacity + ');';
                style += 'border-width: ' + styles.border_width + 'px;';
                style += 'border-style: ' + styles.border_style + ';';
                style += 'border-color: rgba(' + color_border.r + ', ' + color_border.g + ', ' + color_border.b + ', ' + styles.border_opacity + ');';
                style += 'border-radius: ' + borderRadius + ';';
            }

            // The shape is a Poly
            if (s.type == 'poly') {
                var c_fill = hexToRgb(styles.fill) || { r: 0, b: 0, g: 0 };
                var c_stroke = hexToRgb(styles.stroke_color) || { r: 0, b: 0, g: 0 };

                style += 'opacity: ' + styles.opacity + ';';
                style += 'fill: rgba(' + c_fill.r + ', ' + c_fill.g + ', ' + c_fill.b + ', ' + styles.fill_opacity + ');';
                style += 'stroke: rgba(' + c_stroke.r + ', ' + c_stroke.g + ', ' + c_stroke.b + ', ' + styles.stroke_opacity + ');';
                style += 'stroke-width: ' + styles.stroke_width + 'px;';
                style += 'stroke-dasharray: ' + styles.stroke_dasharray + ';';
                style += 'stroke-linecap: ' + styles.stroke_linecap + ';';
            }

            return style;
        },
        // Applies the styles from the "styles" string variable to the shape with an index "i"
        applyStyles: function (styles, i) {
            // The shape object
            var s = this.settings.spots[i];

            // The shape HTML element
            var el = this.wrap.find('#' + s.id);

            // Get the calculated style string
            var style = this.calcStyles(styles, i);

            // Apply the styles to the HTML element
            el.attr('style', style);
            
            // EXCEPTION - If the shape is an SVG icon
            if (s.type == 'spot' && el.find('path').length > 0) {
                el.find('path').attr('style', 'fill:' + styles.icon_fill);
            }
        },
        highlightShape: function (i, recursive) {
            var s = this.settings.spots[i];

            // If the shape is connected to a master, start from the master and return
            if (recursive && s.connected_to != '') {
                var index = this.getIndexOfShapeWithID(s.connected_to);
                this.highlightShape(index, true);
                return;
            }

            // If the shape is a connected shape master, then highlight its slaves (if recursive is TRUE)
            if (this.connectedShapes[s.id]) {
                for (var j = 0; j < this.connectedShapes[s.id].length; j++) {
                    var index = this.connectedShapes[s.id][j].index;
                    this.highlightShape(index, false);
                }
            }

            // Apply mouseover styles
            this.applyStyles(this.settings.spots[i].mouseover_style, i);

            // Send API event
            $.imageMapProEventHighlightedShape(this.settings.general.name, s.title);

            // Add the shape to the array of highlighted shapes
            if (this.highlightedShapes.indexOf(i) == -1) {
                this.highlightedShapes.push(i);
            }
        },
        unhighlightShape: function (i) {
            var s = this.settings.spots[i];

            // If the shape is highlighted with the API, then return
            if (this.apiHighlightedShapes.indexOf(i) != -1) {
                return;
            }

            // Apply default styles
            this.applyStyles(s.default_style, i);

            // Send API event
            $.imageMapProEventUnhighlightedShape(this.settings.general.name, s.title);

            // Remove the shape from the array of highlighted shapes
            var indexInList = this.highlightedShapes.indexOf(i);
            this.highlightedShapes.splice(indexInList, 1);
        },
        unhighlightAllShapes: function () {
            var shapes = this.highlightedShapes.slice(0);

            for (var i = 0; i < shapes.length; i++) {
                this.unhighlightShape(shapes[i]);
            }
        },
        isShapeHighlighted: function (i) {
            for (var j = 0; j < this.highlightedShapes.length; j++) {
                if (this.highlightedShapes[j] == i) {
                    return true;
                }
            }

            return false;
        },
        performClickAction: function (i) {
            var s = this.settings.spots[i];

            if (s.actions.click == 'follow-link') {
                if ($('#imp-temp-link').length == 0) {
                    $('body').append('<a href="" id="imp-temp-link" target="_blank"></a>');
                }
                $('#imp-temp-link').attr('href', s.actions.link);

                if (parseInt(s.actions.open_link_in_new_window, 10) == 1) {
                    $('#imp-temp-link').attr('target', '_blank');
                } else {
                    $('#imp-temp-link').removeAttr('target');
                }

                $('#imp-temp-link')[0].click();
            }
            if (s.actions.click == 'run-script') {
                eval(s.actions.script.replace('<br>', ''));
            }

            $.imageMapProEventClickedShape(this.settings.general.name, this.settings.spots[i].title);
        },
        showTooltip: function (i, e) {
            // If the tooltip's shape is connected to a master and it's using its tooltip, show that tooltip instead
            var s = this.settings.spots[i];
            if (s.connected_to != '' && parseInt(s.use_connected_shape_tooltip, 10) == 1) {
                var masterShapeIndex = this.getIndexOfShapeWithID(s.connected_to);
                this.showTooltip(masterShapeIndex);
                return;
            }

            // If the tooltip is already visible, then return
            if (this.openedTooltips.indexOf(i) != -1) return;

            // If there is a visible tooltip, then hide it
            if (this.openedTooltips.length > 0) {
                this.hideAllTooltips();
            }

            // Add tooltip to the list of opened tooltips
            if (this.openedTooltips.indexOf(i) == -1) {
                this.openedTooltips.push(i);
            }

            // Show fullscreen or normal tooltips
            if ((this.settings.tooltips.fullscreen_tooltips == 'mobile-only' && isMobile()) || this.settings.tooltips.fullscreen_tooltips == 'always') {
                // Fullscreen tooltips
                this.visibleFullscreenTooltip = $('.imp-fullscreen-tooltip[data-index="' + i + '"]');
                this.visibleFullscreenTooltipIndex = i;

                this.fullscreenTooltipsContainer.show();
                this.visibleFullscreenTooltip.show();

                var self = this;
                setTimeout(function () {
                    self.visibleFullscreenTooltip.addClass('imp-tooltip-visible');
                }, 20);

                this.fullscreenTooltipVisible = true;

                // Prevent scrolling of the body and store the original overflow attribute value
                this.bodyOverflow = $('body').css('overflow');
                $('body').css({
                    overflow: 'hidden'
                });
            } else {
                // Normal tooltips
                var t = this.wrap.find('.imp-tooltip[data-index="' + i + '"]');
                t.show();
                setTimeout(function() {
                    t.addClass('imp-tooltip-visible');
                }, 1);

                this.measureTooltipSize(i);
                this.updateTooltipPosition(i, e);
            }

            // Send event
            $.imageMapProEventOpenedTooltip(this.settings.general.name, this.settings.spots[i].title);
        },
        hideTooltip: function (i) {
            // If the tooltip has been opened with the API, then return
            if (this.apiOpenedTooltips.indexOf(i) != -1) {
                return;
            }
            
            // Remove from the list of opened tooltips
            var indexInList = this.openedTooltips.indexOf(i);
            this.openedTooltips.splice(indexInList, 1);

            // Hide mobile tooltip
            if ((this.settings.tooltips.fullscreen_tooltips == 'mobile-only' && isMobile()) || this.settings.tooltips.fullscreen_tooltips == 'always') {
                var self = this;
                var t = this.fullscreenTooltipsContainer.find('.imp-fullscreen-tooltip[data-index="' + i + '"]');

                t.removeClass('imp-tooltip-visible');
                setTimeout(function () {
                    self.fullscreenTooltipsContainer.hide();
                    t.hide();
                }, 200);

                this.fullscreenTooltipVisible = false;
                
                // Restore the body overflow to allow scrolling
                $('body').css({
                    overflow: this.bodyOverflow
                });
            } else {
                // Hide normal tooltip
                var t = this.wrap.find('.imp-tooltip[data-index="' + i + '"]');
                t.removeClass('imp-tooltip-visible');
                setTimeout(function() {
                    t.hide();
                }, 200);
            }

            // Send event
            $.imageMapProEventClosedTooltip(this.settings.general.name, this.settings.spots[i].title);
        },
        hideAllTooltips: function () {
            var tooltips = this.openedTooltips.slice(0);

            for (var i = 0; i < tooltips.length; i++) {
                this.hideTooltip(tooltips[i]);
            }
        },
        updateTooltipPosition: function (i, e) {
            // t = tooltip element
            // tw/th = tooltip width/height
            // sx/sy/sw/sh = spot x/y/width/height
            // p = padding
            // ex/ey = event x/y
            // s = target shape

            // If fullscreen tooltips are on, then do nothing
            if (this.fullscreenTooltipVisible) return;

            var t, tw, th, sx, sy, sw, sh, p = 20, ex, ey, s;

            t = this.wrap.find('.imp-tooltip[data-index="' + i + '"]');
            tw = t.data('imp-measured-width');
            th = t.data('imp-measured-height');
            s = this.settings.spots[i];

            var wrapWidth = this.wrap.width();
            var wrapHeight = this.wrap.height();
            var wrapOffsetLeft = this.wrap.offset().left;
            var wrapOffsetTop = this.wrap.offset().top;
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            if (parseInt(this.settings.tooltips.sticky_tooltips, 10) == 1 && e) {
                // Sticky tooltips
                // Set width/height of the spot to 0
                // and X and Y to the mouse coordinates
                // Get the event coordinates
                var c = this.getEventCoordinates(e);
                ex = c.x;
                ey = c.y;

                sx = ex - wrapOffsetLeft;
                sy = ey - wrapOffsetTop;
                sw = 0;
                sh = 0;
            } else {
                sw = (s.width / 100) * wrapWidth;
                sh = (s.height / 100) * wrapHeight;
                
                sw = sw * this.zoom;
                sh = sh * this.zoom;

                sx = ((Math.round(s.x * 10) / 10) / 100) * wrapWidth;
                sy = ((Math.round(s.y * 10) / 10) / 100) * wrapHeight;

                sx = sx * this.zoom + this.actualPanX;
                sy = sy * this.zoom + this.actualPanY;
            }

            // If the shape is a spot, move its x/y center to the top-left corner
            if (s.type == 'spot') {
                sx -= s.width/2;
                sy -= s.height/2;

                sw = s.width;
                sh = s.height;
            }

            // If the spot is a pin, offset it to the top
            if (s.type == 'spot' && parseInt(s.default_style.icon_is_pin, 10) == 1 && s.type == 'spot' && parseInt(s.default_style.use_icon, 10) == 1) {
                sy -= sh/2;
            }

            // Limit the size-position of the shape to the bounds of the wrap
            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                if (sx + wrapOffsetLeft < 0) {
                    sw = sw + sx + wrapOffsetLeft;
                    sx = -wrapOffsetLeft;
                }
                if (sx + wrapOffsetLeft + sw > windowWidth) {
                    sw += windowWidth - (sx + wrapOffsetLeft + sw);
                }
                if (sy + wrapOffsetTop < 0) {
                    sh = sh + sy + wrapOffsetTop;
                    sy = -wrapOffsetTop;
                }
                if (sy + wrapOffsetTop + sh > windowHeight) {
                    sh += windowHeight - (sy + wrapOffsetTop + sh);
                }
            } else {
                if (sx < 0) {
                    sw = sw + sx;
                    sx = 0;
                }
                if (sx + sw > wrapWidth) {
                    sw = wrapWidth - sx;
                }
                if (sy < 0) {
                    sh = sh + sy;
                    sy = 0;
                }
                if (sy + sh > wrapHeight) {
                    sh = wrapHeight - sy;
                }
            }
            

            // Calculate and set the position
            var x, y;
            if (s.tooltip_style.position == 'left') {
                x = sx - tw - p;
                y = sy + sh / 2 - th / 2;
            }
            if (s.tooltip_style.position == 'right') {
                x = sx + sw + p;
                y = sy + sh / 2 - th / 2;
            }
            if (s.tooltip_style.position == 'top') {
                x = sx + sw / 2 - tw / 2;
                y = sy - th - p;
            }
            if (s.tooltip_style.position == 'bottom') {
                x = sx + sw / 2 - tw / 2;
                y = sy + sh + p;
            }

            var pos = { x: x, y: y };

            // Constrain tooltips
            if (parseInt(this.settings.tooltips.constrain_tooltips, 10) == 1) {
                pos = fitRectToScreen(x + wrapOffsetLeft, y + wrapOffsetTop, tw, th);
                pos.x -= wrapOffsetLeft;
                pos.y -= wrapOffsetTop;
            }

            // If fullscreen is on, offset the tooltips
            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                pos.x += wrapOffsetLeft;
                pos.y += wrapOffsetTop;
            }

            t.css({
                left: pos.x,
                top: pos.y
            });
        },
        toggleFullscreen: function () {
            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 0) {
                // Go fullscreen
                $('body').addClass('imp-fullscreen-mode');

                var fullscreenSettings = $.extend(true, {}, this.settings);
                fullscreenSettings.runtime.is_fullscreen = 1;
                fullscreenSettings.id = '999999';
                fullscreenSettings.general.responsive = 0;

                var style = '';
                style += 'background: ' + this.settings.fullscreen.fullscreen_background;
                $('body').append('<div id="imp-fullscreen-wrap" style="' + style + '"><div id="image-map-pro-' + fullscreenSettings.id + '"></div></div>');

                $('#image-map-pro-' + fullscreenSettings.id).imageMapPro(fullscreenSettings);

                // Disable current image map
                this.disableEvents();

                fullscreenMapParent = this;
            } else {
                // Close fullscreen
                $('body').removeClass('imp-fullscreen-mode');
                $('#imp-fullscreen-wrap').remove();
                this.disableEvents();

                fullscreenMapParent.events();
            }
        },
        resetZoomAndPan: function() {
            this.zoom = 1;
            this.targetZoom = 1;
            this.targetPanX = 0;
            this.targetPanY = 0;
            this.actualPanX = 0;
            this.actualPanY = 0;

            this.redraw();
        },
        zoomIn: function(e) {
            // Check if it's possible to zoom further
            if (this.targetZoom < this.maxZoomLevel) {
                // Adjust zoom
                var targetZoom = this.zoom * this.zoomMultiplier;
                
                // Focal point
                var eventX = 0, eventY = 0, wrapWidth = this.wrap.width(), wrapHeight = this.wrap.height();

                // Check if the zoom was triggered by clicking with the zoom tool, or by keyboard shortcut
                if (e) {
                    // Focal point is at event point, relative to the zoomed wrap
                    eventX = e.pageX;
                    eventY = e.pageY;
                } else {
                    // Assume that the event happened at the center of the non-zoomed wrap
                    eventX = this.wrap.offset().left + wrapWidth/2;
                    eventY = this.wrap.offset().top + wrapHeight/2;
                }

                this.applyZoom(targetZoom, eventX, eventY);
            }
        },
        zoomOut: function(e) {
            // Check if it's possible to zoom further
            if (this.targetZoom > 1) {

                // Adjust zoom
                var targetZoom = this.zoom / this.zoomMultiplier;

                // Focal point
                var eventX = 0, eventY = 0, wrapWidth = this.wrap.width(), wrapHeight = this.wrap.height();

                // Check if the zoom was triggered by clicking with the zoom tool, or by keyboard shortcut
                if (e) {
                    // Focal point is at event point, relative to the zoomed wrap
                    eventX = e.pageX;
                    eventY = e.pageY;
                } else {
                    // Assume that the event happened at the center of the non-zoomed wrap
                    eventX = this.wrap.offset().left + wrapWidth/2;
                    eventY = this.wrap.offset().top + wrapHeight/2;
                }

                this.applyZoom(targetZoom, eventX, eventY);
            }
        },
        applyZoom: function(zoomLevel, eventX, eventY) {
            // Stop interpolation at the actual pan
            this.targetZoom = this.zoom;
            this.targetPanX = this.actualPanX;
            this.targetPanY = this.actualPanY;
            this.redraw();

            // Limit the zoom level
            if (zoomLevel > this.maxZoomLevel) {
                zoomLevel = this.maxZoomLevel;
            }
            if (zoomLevel < 1) {
                zoomLevel = 1;
            }

            this.targetZoom = zoomLevel;

            // Focal point
            var wrapWidth = this.wrap.width(), wrapHeight = this.wrap.height();

            var fx = eventX - this.zoomWrap.offset().left;
            var fy = eventY - this.zoomWrap.offset().top;

            // Calculate base zoom offset
            var baseOffsetX = (wrapWidth*this.targetZoom - wrapWidth*this.zoom) / 2;
            var baseOffsetY = (wrapHeight*this.targetZoom - wrapHeight*this.zoom) / 2;

            // Calculate focal offset
            var focalOffsetX = baseOffsetX * (((wrapWidth * this.zoom)/2 - fx)/((wrapWidth * this.zoom)/2));
            var focalOffsetY = baseOffsetY * (((wrapHeight * this.zoom)/2 - fy)/((wrapHeight * this.zoom)/2));

            this.targetPanX -= baseOffsetX;
            this.targetPanY -= baseOffsetY;
            this.targetPanX += focalOffsetX;
            this.targetPanY += focalOffsetY;

            // Adjust the size of the spots
            for (var i=0; i<this.settings.spots.length; i++) {
                var s = this.settings.spots[i];
                if (s.type == 'spot') {
                    this.wrap.find('#' + s.id).css({
                        'transform' : 'scale(' + (1/this.targetZoom) + ')'
                    });
                }
            }

            this.hideAllTooltips();
            this.redraw();
        },
        pan: function(eventX, eventY) {
            this.actualPanX = this.initialPanX - (this.ix - eventX);
            this.actualPanY = this.initialPanY - (this.iy - eventY);
            
            var wrapWidth = this.wrap.width();
            var wrapHeight = this.wrap.height();
            var wrapOffsetLeft = this.wrap.offset().left;
            var wrapOffsetTop = this.wrap.offset().top;

            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            // Limit to bounds
            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                if (wrapWidth * this.zoom > windowWidth) {
                    if (this.actualPanX > -wrapOffsetLeft) this.actualPanX = -wrapOffsetLeft;
                    if (this.actualPanX < windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft) this.actualPanX = windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft;
                } else {
                    this.actualPanX = (wrapWidth - wrapWidth * this.targetZoom)/2;
                }

                if (wrapHeight * this.zoom > windowHeight) {
                    if (this.actualPanY > -wrapOffsetTop) this.actualPanY = -wrapOffsetTop;
                    if (this.actualPanY < windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop) this.actualPanY = windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop;
                } else {
                    this.actualPanY = (wrapHeight - wrapHeight * this.targetZoom)/2;
                }
            } else {
                if (this.actualPanX > 0) this.actualPanX = 0;
                if (this.actualPanY > 0) this.actualPanY = 0;

                if (this.actualPanX < wrapWidth - wrapWidth*this.targetZoom) this.actualPanX = wrapWidth - wrapWidth*this.targetZoom;
                if (this.actualPanY < wrapHeight - wrapHeight*this.targetZoom) this.actualPanY = wrapHeight - wrapHeight*this.targetZoom;
            }

            this.panDeltaY = Math.abs(this.actualPanY - this.targetPanY);
            
            this.targetPanX = this.actualPanX;
            this.targetPanY = this.actualPanY;

            this.hideAllTooltips();
            this.redraw();
        },
        panTo: function(x, y) {
            var panX = -x + this.wrap.width()/2;
            var panY = -y + this.wrap.height()/2;

            this.panDeltaY = Math.abs(panY - this.targetPanY);

            this.targetPanX = panX;
            this.targetPanY = panY;

            this.hideAllTooltips();
            this.redraw();
        },
        pinch: function(e) {
            var eventX = (e.originalEvent.touches[0].pageX + e.originalEvent.touches[1].pageX) / 2;
            var eventY = (e.originalEvent.touches[0].pageY + e.originalEvent.touches[1].pageY) / 2;

            // Pan
            this.actualPanX += eventX - this.lastX;
            this.actualPanY += eventY - this.lastY;

            // Limit to bounds
            var wrapWidth = this.wrap.width();
            var wrapHeight = this.wrap.height();
            var wrapOffsetLeft = this.wrap.offset().left;
            var wrapOffsetTop = this.wrap.offset().top;

            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                if (wrapWidth * this.zoom > windowWidth) {
                    if (this.actualPanX > -wrapOffsetLeft) this.actualPanX = -wrapOffsetLeft;
                    if (this.actualPanX < windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft) this.actualPanX = windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft;
                } else {
                    this.actualPanX = (wrapWidth - wrapWidth * this.targetZoom)/2;
                }

                if (wrapHeight * this.zoom > windowHeight) {
                    if (this.actualPanY > -wrapOffsetTop) this.actualPanY = -wrapOffsetTop;
                    if (this.actualPanY < windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop) this.actualPanY = windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop;
                } else {
                    this.actualPanY = (wrapHeight - wrapHeight * this.targetZoom)/2;
                }
            } else {
                if (this.actualPanX > 0) this.actualPanX = 0;
                if (this.actualPanY > 0) this.actualPanY = 0;

                if (this.actualPanX < wrapWidth - wrapWidth*this.targetZoom) this.actualPanX = wrapWidth - wrapWidth*this.targetZoom;
                if (this.actualPanY < wrapHeight - wrapHeight*this.targetZoom) this.actualPanY = wrapHeight - wrapHeight*this.targetZoom;
            }

            this.lastX = eventX;
            this.lastY = eventY;
            
            // Zoom
            var distance = Math.sqrt(Math.pow(e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX, 2) + Math.pow(e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY, 2));
            var delta = distance / this.pinchInitialDistance;
            
            this.applyZoom(this.pinchInitialZoom * delta, eventX, eventY);
        },
        redraw: function() {
            var wrapWidth = this.wrap.width();
            var wrapHeight = this.wrap.height();
            
            // Limit to bounds
            if (parseInt(this.settings.runtime.is_fullscreen, 10) == 1) {
                var wrapOffsetLeft = this.wrap.offset().left;
                var wrapOffsetTop = this.wrap.offset().top;
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();

                if (wrapWidth * this.zoom > windowWidth) {
                    if (this.targetPanX > -wrapOffsetLeft) this.targetPanX = -wrapOffsetLeft;
                    if (this.targetPanX < windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft) this.targetPanX = windowWidth - wrapWidth*this.targetZoom - wrapOffsetLeft;
                } else {
                    this.targetPanX = (wrapWidth - wrapWidth * this.targetZoom)/2;
                }

                if (wrapHeight * this.zoom > windowHeight) {
                    if (this.targetPanY > -wrapOffsetTop) this.targetPanY = -wrapOffsetTop;
                    if (this.targetPanY < windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop) this.targetPanY = windowHeight - wrapHeight*this.targetZoom - wrapOffsetTop;
                } else {
                    this.targetPanY = (wrapHeight - wrapHeight * this.targetZoom)/2;
                }
            } else {
                if (this.targetPanX > 0) this.targetPanX = 0;
                if (this.targetPanY > 0) this.targetPanY = 0;

                if (this.targetPanX < wrapWidth - wrapWidth*this.targetZoom) this.targetPanX = wrapWidth - wrapWidth*this.targetZoom;
                if (this.targetPanY < wrapHeight - wrapHeight*this.targetZoom) this.targetPanY = wrapHeight - wrapHeight*this.targetZoom;
            }

            // Interpolate
            this.zoom = lerp(this.zoom, this.targetZoom, 0.1);
            this.actualPanX = lerp(this.actualPanX, this.targetPanX, 0.1);
            this.actualPanY = lerp(this.actualPanY, this.targetPanY, 0.1);

            // Check interpolation thresholds
            if (Math.abs(this.zoom - this.targetZoom) < 0.001) this.zoom = this.targetZoom;
            if (Math.abs(this.actualPanX - this.targetPanX) < 1) this.actualPanX = this.targetPanX;
            if (Math.abs(this.actualPanY - this.targetPanY) < 1) this.actualPanY = this.targetPanY;
            
            // Draw
            this.zoomWrap.css({
                'transform' : 'scale('+ this.zoom +', '+ this.zoom +')'
            });
            this.translateWrap.css({
                'transform' : 'translate('+ this.actualPanX +'px, '+ this.actualPanY +'px)'
            });

            // Navigator window
            if (parseInt(this.settings.zooming.enable_navigator, 10) == 1) {
                var imageClipLeft = -this.actualPanX*this.navigatorRatio/this.zoom + this.navigatorMarginX/this.zoom;
                var imageClipRight = (wrapWidth * this.navigatorRatio) - (imageClipLeft + (this.uiNavigatorWindowWidth * 1/this.zoom));
                var imageClipTop = -this.actualPanY*this.navigatorRatio/this.zoom + this.navigatorMarginY/this.zoom;
                var imageClipBottom = (wrapHeight * this.navigatorRatio) - (imageClipTop + (this.uiNavigatorWindowHeight * 1/this.zoom));

                this.uiNavigatorImage.css({
                    'clip-path' : 'inset('+ imageClipTop +'px '+ imageClipRight +'px '+ imageClipBottom +'px '+ imageClipLeft +'px)',
                    '-webkit-clip-path' : 'inset('+ imageClipTop +'px '+ imageClipRight +'px '+ imageClipBottom +'px '+ imageClipLeft +'px)',
                    '-moz-clip-path' : 'inset('+ imageClipTop +'px '+ imageClipRight +'px '+ imageClipBottom +'px '+ imageClipLeft +'px)'
                });
            }

            // Repeat
            var self = this;
            if (this.zoom != this.targetZoom || this.actualPanX != this.targetPanX || this.actualPanY != this.targetPanY) {
                window.requestAnimationFrame(function() {
                    self.redraw();
                });
            }
        },
        switchLayer: function(layerID) {
            // Set the layerID in the runtime
            this.settings.runtime.layerID = layerID;

            // Find the new layer from its ID
            for (var i=0; i<this.settings.layers.layers_list.length; i++) {
                if (parseInt(this.settings.layers.layers_list[i].id, 10) == parseInt(this.settings.runtime.layerID, 10)) {
                    // Change image URL
                    this.settings.image.url = this.settings.layers.layers_list[i].image_url;

                    // Change image dimentions
                    this.settings.general.width = this.settings.layers.layers_list[i].image_width;
                    this.settings.general.naturalWidth = this.settings.layers.layers_list[i].image_width;
                    this.settings.general.height = this.settings.layers.layers_list[i].image_height;
                    this.settings.general.naturalHeight = this.settings.layers.layers_list[i].image_height;

                    break;
                }
            }

            this.init();
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        });
    };

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    function screenToImageMapSpace(x, y, imageMap) {
        return {
            x: Math.round((x - imageMap.offset().left) * 1000) / 1000,
            y: Math.round((y - imageMap.offset().top) * 1000) / 1000
        }
    }
    function isPointInsideRect(x, y, rx, ry, rw, rh) {
        if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return true;
        return false;
    }
    function isPointInsidePolygon(x, y, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
    function isPointInsideEllipse(x, y, ex, ey, rx, ry) {
        var a = (x - ex) * (x - ex);
        var b = rx * rx;
        var c = (y - ey) * (y - ey);
        var d = ry * ry;

        if (a / b + c / d <= 1) return true;

        return false;
    }
    function fitRectToScreen(x, y, w, h) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > $(document).width() - w) x = $(document).width() - w;
        if (y > $(document).height() - h) y = $(document).height() - h;
        return { x: x, y: y };
    }
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
    function isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }

        return false;
    }
    function lerp(v0, v1, t) {
        return v0*(1-t)+v1*t
    }

})(jQuery, window, document);

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright 2015 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});