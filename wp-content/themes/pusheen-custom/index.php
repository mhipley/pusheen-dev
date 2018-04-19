<?php get_header(); ?>

	<main role="main">

		<div class="row">
			<div class="col-xs-12">
				<h1><?php _e( 'News', 'html5blank' ); ?></h1>
			</div>
			<div class="col-xs-12">
				<section>

					<?php get_template_part('loop'); ?>

					<?php get_template_part('pagination'); ?>

				</section>
			</div>
		</div>
	</main>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
