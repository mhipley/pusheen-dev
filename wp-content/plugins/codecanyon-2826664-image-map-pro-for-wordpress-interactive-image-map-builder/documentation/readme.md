# Image Map Pro for WordPress - Documentation

## Installation
1. Download the plugin from CodeCanyon
_Visit CodeCanyon, then go to your Downloads page. Find "Image Map Pro for WordPress", press Download and then select "Installable WordPress file only"._

2. Upload it to your WordPress website
_Open your WordPress dashboard. From the menu on the left click Plugins -> Add New. Finally click the "Upload Plugin" button and choose the ZIP file that you downloaded in step 1._

3. You are all done!

## First Steps

### Take the Guided Tour
When you first launch the Image Map Pro Editor from your WordPress Dashboard, you will see a Guided Tour that will take you through the basics of using the editor. It's the easiest way to get started quickly with the plugin and we highly recommend you to check it out!

To see the Guided Tour again, click the “Help” button located at the top of the editor.

### Activation
By choosing to activate the plugin you will gain access to automatic updates, and that is all. There is no restricted functionality, no annoying pop-ups if you choose not to activate!

To activate the plugin, first you will need your Purchase Code.  [Here is a step by step guide of where to find it.](https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code-) When you have your Purchase Code, launch the Image Map Pro Editor and click **Activate** in the top-left of the screen. Paste the code and enjoy lifetime automatic updates!

## Working with the Editor

### Creating a New Image Map
To create a new image map, click the **New** button in the top-left corner of the Editor, enter a name and click **Create**. 
An example image will be loaded by default. To change it, click the **Image Map** settings tab, and then Image. Click the **Choose Image** button to launch the WP Media Library and pick an image.

### Responsive
The image map is responsive! If you enable the **Responsive** toggle, the image map will scale to 100% width of its parent element. Additionally, the **Preserve Quality** toggle (enabled by default) prevents the image from becoming larger than its original size, preventing loss of quality.

### Drawing Shapes
To start drawing shapes, first make sure that you are in **Edit** mode. Please read below about **Edit** and **Preview** modes. 
Then, select a tool from the toolbar on the left and either click, or click and drag the image, depending on the tool that you selected. 

### Styles
To change the style of a shape, like color or opacity, first make sure that the shape is selected. You can select a shape by clicking it in the shapes list (on the right), or by clicking it in **Edit Mode**. 
Then, you can open the **Selected Shape Settings** tab and change various settings in **Default Style** and **Mouseover Style.** Experiment with different settings and use what you like!

### Preview Mode
At any point you can click the **Preview** button on the top-left side of the Editor to see how the image will look like in the end. You can still make changes to the settings and the preview will instantly update itself.

### Save, Load
Don't forget to save! You can create as many image maps as you wish, and you can switch between them by clicking **Load** and choosing the image map that you saved previously.

### Import, Export
With the **Import** and **Export** buttons from the Editor you can migrate your image maps to another website, or make backups to your image maps. You know, just in case. Also if you can work your way around the JSON code, you can make modifications to the image map.

New in version 4.3 is the ability to import any SVG file to the image map. For example, you might already have an illustrator file with schematics, which you don't want to rebuild from scratch. Now you can import those shapes in Image Map Pro as SVG. Just make sure that you select "SVG XML Code" in the Import options and follow the instructions.

### Connected Shapes
It is possible to have multiple shapes linked together. For example, when you mouseover one shape, several other shapes around it will highlight as well. The way this is done is by defining a "master" shape, and "slave" shapes, which are connected to it. Select each of the shapes that you wish to be "slaves", and from the General settings tab select the shape which you wish to be their "master". Do this for each shape and you are done!

Additionally, you can choose to have only one tooltip for each group of connected shapes. Select each of the "slave" shapes and enable "Use Connected Shape's Tooltip".

### Zooming
In version 4.3 we added zoom functionality to the plugin. Now you can have much more complex and precise image maps on your website and visitors with all kinds of screen sizes will be able to use them. The plugin also supports intuitive pinch zoom/pan on touchscreen devices!

To get started, from the editor open the **Zooming** tab, which is in the image map settings tab. From there you have several different options:

1. Max Zoom - the maximum level of zoom allowed.
2. Limit Max Zoom - if enabled, the zooming can only go up to the original image size.
3. Enable Navigator - shows a mini image on the bottom left of the image map, giving you an idea of where you are on the image map while zooming and panning around.
4. Enable Zoom Buttons - adds + / - buttons on the bottom right side of the image map, allowing you to click to zoom in/out. Useful if you want to make it more obvious that there is zooming.
5. Zoom Button/Background Color - change the style of the zoom buttons to match the design of your website.

### Fullscreen
You can choose to enable fullscreen mode for those extra large and detailed image maps. To get started, open the **Fullscreen** tab in the image map settings tab. From there you have several different options:

1. Start in Fullscreen Mode - If enabled, the image map will go straight into fullscreen mode when the page loads. Be careful!
2. Fullscreen Background - The color of the "empty" space around the image in fullscreen mode.
3. Fullscreen Button Position - You can choose to move the fullscreen button to a different location on the image map, if you feel like it's obstructing information.
4. Button Type - Icon/Text/Icon and Text - Choose whatever you feel is appropriate! Functionality is the same.
5. Button Colors - Change the style of the button to match the design of your website.

## Publishing Your Image Map
You can insert the image map into a page using a shortcode, which you have to set from the Editor, just below the image map name text box. For example, if you enter my-image-map in the Editor, you can insert the image map with **[my-image-map]** in plain text.

Please keep in mind that the shortcode must not contain any spaces.

## Image Map Pro API

### Intro
Adding custom functionality is super easy, using the Image Map Pro's API. However, you will need to know a bit of JavaScript/jQuery (or just HTML if you need only basic functionality) to put something together. This documentation will give you a solid start on the API, but you **will** need to write some code by yourself.

If you are not comfortable writing code, you can always visit our friends at [wpkraken.io](https://wpkraken.io/?ref=nickys) - they specialize in customizing plugins for customers and their prices are very reasonable. They are also pretty awesome.

### A Simple Example (HTML)
Let's say that we want to have a list of buttons next to our image map, and we want to highlight different shapes when mousing over each button.

The simplest way to accomplish this would be to use the HTML API:

```html
<div data-imp-trigger-shape-on-mouseover="my-shape-1">My Shape 1</div>
```

With the `data-imp-trigger-shape-on-mouseover` HTML attribute we are telling the plugin to highlight `my-shape-1` and to open its tooltip. If you want only to highlight or only open the tooltip, there are different HTML attributes for that. Please check the API Reference section for a full list.

If you have more than one image map on the same page, you will need to add the `data-imp-image-map-name` attribute to specify on which image map you want to make a change:

```html
<div data-imp-open-tooltip-on-click="my-shape-1" data-imp-image-map-name="My Image Map">My Shape 1</div>
```

In this example we are opening the tooltip for the `my-shape-1` shape **on click**, in an image map named `My Image Map`.

### A Simple Example 1 (JavaScript)
The API provides you with several different functions, which you can use to trigger events on the image map and to listen for events.

Let's say that we want to achieve some really awesome mouseover effects and we want to replace the entire image when a user points at a specific shape. Because why not.

```javascript
$.imageMapProEventHighlightedShape = function(imageMapName, shapeName) {
    console.log(shapeName);
}
```

The hook function that we want to use in this case is `$.imageMapProEventHighlightedShape`. Whenever a mouseover event occurs on a shape, this function is called. It provides us with two variables - `imageMapName` and `shapeName`, which we can check to see which shape was highlighted and on which image map. In the example above we are simply logging the value of `shapeName` to the console.

```javascript
$.imageMapProEventHighlightedShape = function(imageMapName, shapeName) {
    // Check which shape has been highlighted
    if (shapeName == 'shape') {
        // This piece of code will execute only when "shape" has been highlighted.
        // For the purposes of this example, we replace our image with a new one.
        $('#image-map-pro-1718' .imp-main-image').attr('src', 'img/image-2.png');

        // Regarding the selector “#image-map-pro-1718” you have to replace the “1718” with the ID of your image map. You can see the ID by clicking the “Export” button located at the top of the editor.
    }
}
```

Of course, we will want to go back to the original image when the user moves the mouse away from `shape`. In this case we need to use the `$.imageMapProEventHighlightedShape` hook function, which works exactly the same.

For the full list of functions, please see the API Reference section below.

Also, as a good practice we should "enclose" our code, using this boilerplate snippet:

```javascript
(function($, window, document, undefined) {
    // Your code goes here...
})(jQuery, window, document);
```

This is just a bonus tip and you should be doing it to all your scripts. It's not specific to this plugin.

Finally, here is how the entire code would look like:

```javascript
(function($, window, document, undefined) {
    // When the user triggers a mouseover event on a shape (or "highlights" a shape), we want to replace the main image with a new one
    $.imageMapProEventHighlightedShape = function(imageMapName, shapeName) {

        // Check which shape has been highlighted
        if (shapeName == 'shape') {

            // This piece of code will execute only when "shape" has been highlighted.
            // For the purposes of this example, we replace our image with a new one.
            $('#image-map-pro-1718' .imp-main-image').attr('src', 'img/image-2.png');

            // Regarding the selector “#image-map-pro-1718” you have to replace the “1718” with the ID of your image map. You can see the ID by clicking the “Export” button located at the top of the editor.
        }
    }

    // When the mouse moves away from the shape, revert back to the original image
    $.imageMapProEventUnhighlightedShape = function(imageMapName, shapeName) {

        // Check which shape has been unhighlighted
        if (shapeName == 'shape') {

            // Revert back to the original image
            $('#image-map-pro-1718' .imp-main-image').attr('src', 'img/image-1.jpg');
        }
    }
})(jQuery, window, document);
```

You have many different options where to put this block of code. You can insert it in the editor of the plugin: go to the menu "Image Map Settings" -> go to the section "Custom Code" -> use the field "Custom JS". Moreover, you can paste it at the bottom of **image-map-pro.js**, or just slap it in a `<script>` tag on the page itself.

### A Simple Example 2 (JavaScript)

In the previous example we used **Hooks**. Meaning that we were waiting for something to happen, and the plugin called the hook functions for us when that *thing* happened. In this example we want to *make* something happen, and for that we need to use **Actions**.

Let's say that we want to have a list of buttons next to our image map, and we want to highlight different shapes when mousing over each button.

```javascript
$.imageMapProHighlightShape('My Image Map', 'my-shape-1');
```

In this example we are telling the plugin to highlight shape with name `my-shape-1` on an image map with name `My Image Map`. Here is how we would use this in an example:

```javascript
(function($, window, document, undefined) {
    // Add an event listener to all of our buttons
    $('.button-list .button').on('mouseover', function(e) {
        // When the event is triggered, find out the ID of the button, which triggered the event
        if ($(this).attr('id') == 'button-1') {

            // Highlight our shape corresponding to the button
            $.imageMapProHighlightShape('My Image Map', 'building-1');

            // Unhighlight the rest of the shapes
            $.imageMapProUnhighlightShape('My Image Map', 'building-2');
            $.imageMapProUnhighlightShape('My Image Map', 'building-3');
        }

        // Repeat 2 more times...
        if ($(this).attr('id') == 'button-2') {
            $.imageMapProHighlightShape('My Image Map', 'building-2');

            $.imageMapProUnhighlightShape('My Image Map', 'building-1');
            $.imageMapProUnhighlightShape('My Image Map', 'building-3');
        }
        if ($(this).attr('id') == 'button-3') {
            $.imageMapProHighlightShape('My Image Map', 'building-3');

            $.imageMapProUnhighlightShape('My Image Map', 'building-1');
            $.imageMapProUnhighlightShape('My Image Map', 'building-2');
        }
    });

    // Unhighlight all shapes if the mouse moves away from the buttons
    $('.button-list').on('mouseout', function(e) {
        $.imageMapProUnhighlightShape('My Image Map', 'building-1');
        $.imageMapProUnhighlightShape('My Image Map', 'building-2');
        $.imageMapProUnhighlightShape('My Image Map', 'building-3');
    });
})(jQuery, window, document);
```

And here is the HTML snippet:

```html
<div class="button-list">
   <div id="button-1" class="button">Day1</div>
   <div id="button-2" class="button">Day2</div>
   <div id="button-3" class="button">Day2</div>
</div>
```


## API Reference

### HTML

This is a list of all HTML attributes provided by the plugin. For an example of how can you use them, please see the **Custom Functionality with the Image Map Pro API** section. Note - when you highlight a shape with the API, you can unhighlight it only by using the API. The same applies for opening tooltips. An exception to this rule is when you use the "mouseover" triggers from the HTML API.

Attribute | Description
--- | ---
`data-imp-image-map-name` | Specifies on which image map you want to trigger the action. This is required if you have more than one image map on the same page. If you have just one, you don't need to use it.
`data-imp-highlight-shape-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will highlight a shape. The value of the attribute represents the name of the shape.
`data-imp-highlight-shape-on-click` | When a user clicks on this element, the plugin will highlight a shape. The value of the attribute represents the name of the shape.
`data-imp-unhighlight-shape-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will remove the highlight effect from a shape. The value of the attribute represents the name of the shape.
`data-imp-unhighlight-shape-on-click` | When a user clicks on this element, the plugin will remove the highlight effect from a shape. The value of the attribute represents the name of the shape.
`data-imp-open-tooltip-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will open the shape's tooltip. The value of the attribute represents the name of the shape.
`data-imp-open-tooltip-on-click` | When a user clicks on this element, the plugin will open the shape's tooltip. The value of the attribute represents the name of the shape.
`data-imp-close-tooltip-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will close the shape's tooltip. The value of the attribute represents the name of the shape.
`data-imp-close-tooltip-on-click` | When a user clicks on this element, the plugin will close the shape's tooltip. The value of the attribute represents the name of the shape.
`data-imp-trigger-shape-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will highlight a shape and show its tooltip. The value of the attribute represents the name of the shape.
`data-imp-trigger-shape-on-click` | When a user clicks on this element, the plugin will highlight a shape and show its tooltip. The value of the attribute represents the name of the shape.
`data-imp-untrigger-shape-on-mouseover` | When a user triggers a mouseover event on this element, the plugin will remove the highlight effect from a shape and hide its tooltip. The value of the attribute represents the name of the shape.
`data-imp-untrigger-shape-on-click` | When a user clicks on this element, the plugin will remove the highlight effect from a shape and hide its tooltip. The value of the attribute represents the name of the shape.

### JavaScript Actions

**Actions** are when you call a function and something happens on the image map. For example if you want to open a tooltip or highlight a shape, you need to use an **Action**. Note - when you highlight a shape with the API, you can unhighlight it only by using the API. The same applies for opening tooltips.

Action Name | Description
--- | ---
`$.imageMapProHighlightShape(imageMapName, shapeTitle);` | Highlight a shape with a title of `shapeTitle` on an image map with a name `imageMapName`.
`$.imageMapProUnhighlightShape(imageMapName, shapeTitle);` | Remove the highlight effect from a shape with a title of `shapeTitle` on an image map with a name `imageMapName`.
`$.imageMapProOpenTooltip(imageMapName, shapeTitle);` | Open the tooltip for a shape with a title of `shapeTitle` on an image map with a name `imageMapName`.
`$.imageMapProHideTooltip(imageMapName, shapeTitle);` | Close the tooltip for a shape with a title of `shapeTitle` on an image map with a name `imageMapName`.
`$.imageMapProReInitMap(imageMapName);` | Manually reinitialize an image map.
`$.imageMapProIsMobile();` | Returns `true` if the user is using a mobile browser, or `false` if he is not. This is the same check that the plugin does in order to determine it fullscreen tooltips are necessary. This action is useful if you want to make adjustments to the contents of the tooltips, or anything else when the user is on a mobile device.

### JavaScript Hooks
**Hooks** are functions which get called when something specific happens on an image map. For example - you want to know when a user has highlighted a specific shape.

Hook Name | Description
--- | ---
`$.imageMapProInitialized = function(imageMapName) {}` | Called when an image map with a name `imageMapName` has finished initializing. 
`$.imageMapProEventHighlightedShape = function(imageMapName, shapeTitle) {}` | Called when a shape has been highlighted. Parameters include the name of the shape, and the name of the image map.
`$.imageMapProEventUnhighlightedShape = function(imageMapName, shapeTitle) {}` | Called when a shape has been unhighlighted. Parameters include the name of the shape, and the name of the image map.
`$.imageMapProEventClickedShape = function(imageMapName, shapeTitle) {}` | Called when a shape has been clicked. Parameters include the name of the shape, and the name of the image map.
`$.imageMapProEventOpenedTooltip = function(imageMapName, shapeTitle) {}` | Called when a tooltip has been opened. Parameters include the name of the shape, and the name of the image map.
`$.imageMapProEventClosedTooltip = function(imageMapName, shapeTitle) {}` | Called when a tooltip has been closed. Parameters include the name of the shape, and the name of the image map.

## Customer Support
Please send us a support ticket [here](https://webcraftplugins.com/support) if you are having trouble using any of our products. We are here to help!