<!doctype html>
<html <?php language_attributes(); ?> class="no-js">
	<head>
		<meta charset="<?php bloginfo('charset'); ?>">
		<title><?php wp_title(''); ?><?php if(wp_title('', false)) { echo ' :'; } ?> <?php bloginfo('name'); ?></title>

		<link href="//www.google-analytics.com" rel="dns-prefetch">
        <link href="<?php echo get_template_directory_uri(); ?>/img/icons/favicon.ico" rel="shortcut icon">
        <link href="<?php echo get_template_directory_uri(); ?>/img/icons/touch.png" rel="apple-touch-icon-precomposed">

		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="<?php bloginfo('description'); ?>">

		<?php wp_head(); ?>
		<script>
        // conditionizr.com
        // configure environment tests
        conditionizr.config({
            assets: '<?php echo get_template_directory_uri(); ?>',
            tests: {}
        });
        </script>

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>


		<link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/"/>
		<script type="text/javascript" src="//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

	</head>
	<body <?php body_class(); ?>>

		<!-- wrapper -->
		

			<!-- header -->
			<header class="header clear" role="banner">
					<div class="wrapper">
					<a href="<?php echo home_url(); ?>">
						<div class="logo">
							<div class="tablewrapper">
							  <div class="table">
							    <div class="row">
							      <div class="cell">
							        <img src="<?php echo get_template_directory_uri(); ?>/img/logo.svg" alt="Logo" class="logo-wordmark">
							      </div>
							      <div class="rowspanned cell">
							        <img src="<?php echo get_template_directory_uri(); ?>/img/header-pusheen.gif" alt="Cat" class="logo-cat">
							      </div>
							    </div>
							    <div class="row">
							      <div class="cell">
							      	<div class="circle"></div>
							        <div class="circle"></div>
							        <div class="circle"></div>
							        <div class="circle"></div>
							        <div class="circle"></div>
							        <div class="circle"></div>
							        <div class="circle"></div>
							        <p> the cat</p>
							      </div>
							      <div class="empty cell"></div>
							    </div>
							  </div>
							</div>
						</div>
					</a>
	

					</div>

			</header>
				<div class="wrapper">


					<nav class="nav" role="navigation">
						<?php html5blank_nav(); ?>
					</nav>
				</div>
			<!-- /header -->
