<?php /* Template Name: Home Page */ get_header(); ?>

	<main role="main">
		<div class="row">

			<div class="col-xs-12" id="carousel">
				<?php if( have_rows('slide') ): ?>

				<div class="slides">

				<?php while( have_rows('slide') ): the_row(); 

					// vars
					$image_map = get_sub_field('image_map');
					$video = get_sub_field('video');
					?>

					<div class="slide carousel-cell">

							<?php if( $image_map): ?>

								<?php echo do_shortcode($image_map); ?>

							<?php endif; ?>

					</div>


				<?php endwhile; ?>

				</div>

			<?php endif; ?>
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

<script>
$( document ).ready(function() {
	console.log("ready");
	$(document).ready(function(){
	  $('.slides').slick({
	  	  arrows: true,
	  	  infinite: false
	  });
	});
});

</script>
