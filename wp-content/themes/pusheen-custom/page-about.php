<?php /* Template Name: About Page */ get_header(); ?>

	<main role="main" id="about">
		<div class="row">
			<div class="col-xs-12">
				<div class="featured-image">
				<?php if ( has_post_thumbnail()) : ?>
				   <?php the_post_thumbnail('full'); ?>
				<?php endif; ?>	
				</div>		
			</div>
		</div>
		<div class="row">
			<div class="col-sm-12">
				<h1>About</h1>
				<div class="about-body">
					<div class="about-pusheen">
						<img src="<?php echo get_template_directory_uri(); ?>/img/about-pusheen.png">
					</div>
					<?php if (have_posts()): while (have_posts()) : the_post(); ?>

							<?php the_content(); ?>

					<?php endwhile; ?>

					<?php else: ?>

					<?php endif; ?>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-12">
				<h1>Contact Us</h1>
			</div>
		</div>
		<div class="row">
				<?php echo do_shortcode('[contact-form-7 id="33" title="Contact form 1"]'); ?>
		</div>
	</main>


<?php get_footer(); ?>

