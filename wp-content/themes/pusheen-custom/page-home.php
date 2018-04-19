<?php /* Template Name: Home Page */ get_header(); ?>

	<main role="main">
		<div class="row">

			<div class="col-xs-12" id="carousel">
			</div>

		</div>
		
		<div class="row">
			<div class="col-xs-12" id="news-feed">
				<h1><span>News</span></h1>

			</div>	

		</div>	

		<div class="row">
			<div class="col-xs-12" id="instagram-feed">
				<h1>Instagram</h1>
				<?php echo do_shortcode('[elfsight_instagram_feed id="1"]'); ?>

			</div>

		</div>
	</main>

<?php get_footer(); ?>
