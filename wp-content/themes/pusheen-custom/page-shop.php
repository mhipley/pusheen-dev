<?php /* Template Name: Shop Page */ get_header(); ?>

	<main role="main">
		<div class="row">
			<div class="col-xs-12">
				<div class="featured-image">
				<?php if ( has_post_thumbnail()) : ?>
				   <?php the_post_thumbnail('full'); ?>
				<?php endif; ?>	
				</div>		
			</div>
			<div class="col-xs-12">
				<h1>Where To Buy</h1>

			</div>
		</div>

	</main>

<?php get_footer(); ?>
