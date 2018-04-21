;(function ( $, window, document, undefined ) {
    // Version 3.0
    $.imp_editor_storage_get_saves_list = function(cb) {
        var data = {
            action : 'image_map_pro_get_saves_list'
        };

        $.post(ajaxurl, data).done(function(res) {
            var parsed = 0;
            try {
                res = stripSlashes(res);
                res = res.replace(/\\'/g, "'");

                parsed = JSON.parse(res);
                // console.log("Fetched saves list: ");
                // console.log(parsed);
                cb(parsed);
            } catch (err) {
                res = stripSlashes(res);
                res = res.replace(/\\'/g, "'");

                console.log(err);
                console.log('Failed to load saves list.');
                console.log(res);
                cb(false);
            }
        });
    }

    // Version 3.0
    $.imp_editor_storage_get_save = function(id, cb) {
		var data = {
            action : 'image_map_pro_get_save',
            saveID: id
        };

		$.ajax({
			type: 'POST',
			url: ajaxurl,
			data: data,
		}).done(function(res) {
			// Verify loaded data
			var parsed = 0;

			try {
				var parsed = JSON.parse(stripSlashes(res));
				// console.log('Successfully verified loaded image map:');
				// console.log(parsed);
				cb(parsed);
			} catch (err) {
				console.log(err);
				console.log('Failed to verify loaded image map.');
				console.log('Original JSON: ');
				console.log(stripSlashes(res));
				cb(false);
			}
		});
    }

    // Version 3.0
    $.imp_editor_storage_store_save = function(save, cb) {
		var data = {
			action: 'image_map_pro_store_save',
			json: JSON.stringify(save),
			saveID: save.id,
            name: save.general.name,
            shortcode: save.general.shortcode
		};

		$.ajax({
			type: 'POST',
			url: ajaxurl,
			data: data,
		}).done(function(res) {
			// Verify saved data
			var parsed = 0;

			try {
				var parsed = JSON.parse(stripSlashes(res));
				// console.log('Successfully verified saved image map:');
				// console.log(parsed);
				cb(true);
			} catch (err) {
				console.log(err);
				console.log('Failed to verify saved image map.');
				console.log('Original JSON: ');
				console.log(stripSlashes(res));
				cb(false);
			}
		});
    }

    // Version 3.0
    $.imp_editor_storage_delete_save = function(id, cb) {
        var data = {
            action : 'image_map_pro_delete_save',
            saveID: id
        };

        $.post(ajaxurl, data).done(function(res) {
            cb();
        });
    }
    $.imp_editor_storage_get_last_save = function(cb) {
        var data = {
            action : 'image_map_pro_get_last_save'
        };

        $.post(ajaxurl, data).done(function(res) {
            if (res.length > 0) {
                cb(res);
            } else {
                cb(false);
            }
        });
    }
    $.imp_editor_storage_set_last_save = function(id, cb) {
        var data = {
            action : 'image_map_pro_set_last_save',
            saveID: id
        };

        $.post(ajaxurl, data).done(function() {
            cb();
        });
    }

    function stripSlashes(str) {
        return str.replace(/\\(.)/mg, "$1");
    }
})( jQuery, window, document );
