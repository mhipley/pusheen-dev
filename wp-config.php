<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'pusheendev');

/** MySQL database username */
define('DB_USER', 'pusheendev');

/** MySQL database password */
define('DB_PASSWORD', 'Pusheen123!');

/** MySQL hostname */
define('DB_HOST', 'pusheendev.db.5296830.fde.hostedresource.net');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '?|<<436WcV3u:=@I!,.8o39GPHI:N?KaD[nJvC-Ms6+d%j;?0p=Y(A;J~01gk{9}');
define('SECURE_AUTH_KEY',  '>$WBJRXp,)op:w]UriR8Z=D358:%(e[Uere__g]zgZ+B#<,5da{%NiUQLct0%1,}');
define('LOGGED_IN_KEY',    'IRPm 6X*<onKu/q;Tg6RVGJWR)MI:zqK:WDw+cr$DGF@ |]]$MAIJVgYq-+w&Tti');
define('NONCE_KEY',        '[dGig7J_R9>4=6LrF1v:?Ify/u]SH5-3h^^+mkD~K$hHsT=9g?p1<5l?UfmonEtX');
define('AUTH_SALT',        '_<^[@Vp?V)UhEJ/#rAY4|L+ugRb+h)|EQ|uxZ].Nm3_7vv}.v*ISbm:y/gOGrN^k');
define('SECURE_AUTH_SALT', '}@+)AfXT59u$fW2|1$4_+fjk>7q1bpAs7yCC3CjLCL;x/v J?9O8s>iX:(Exs7/Q');
define('LOGGED_IN_SALT',   'NXJ*K{d3U60)i,r-R:qe0Bad/wCNwYTXJZnb+?`SVTiRYfR_GW/{LJ]z/E-LT6m-');
define('NONCE_SALT',       'CeXFs_JiYGP57y.Cx@?<tmRq~R4-BVi>_IPTj/tFUgtZ}QZQze5Z*;b))v6L/P1[');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
