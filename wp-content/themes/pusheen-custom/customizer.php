<?php

add_action( 'customize_register', 'cd_customizer_settings' );
function cd_customizer_settings( $wp_customize ) {
	$wp_customize->add_section( 'cd_colors' , array(
	    'title'      => 'TEST',
	    'priority'   => 30,
	) );

	$wp_customize->add_setting( 'background_color' , array(
	    'default'     => '#fff',
	    'transport'   => 'refresh',
	) );

	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'background_color', array(
		'label'        => 'Background Color',
		'section'    => 'cd_colors',
		'settings'   => 'background_color',
	) ) );	

}



?>