<?php /* Template Name: Home Page */ get_header(); ?>

	<main role="main">
		<div class="row">

			<div class="col-xs-12" id="carousel">
				<?php if( have_rows('slide') ): ?>

				<ul class="slides">

				<?php while( have_rows('slide') ): the_row(); 

					// vars
					$type = get_sub_field('type');
					$image = get_sub_field('image');
					$video = get_sub_field('video');
					$hotspots = get_sub_field('hotspots');

					?>

					<li class="slide carousel-cell">

							<?php if( $image): ?>

								<img src="<?php echo $image['url']; ?>" alt="<?php echo $image['alt'] ?>" />

							<?php endif; ?>

							<?php if( $hotspots): ?>
							<?php endif; ?>
					</li>


				<?php endwhile; ?>

				</ul>

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

$('.slides').flickity({
  // options
  cellAlign: 'left',
  contain: true
});


</script>
