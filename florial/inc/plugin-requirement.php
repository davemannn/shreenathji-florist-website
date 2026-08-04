<?php
/***** Active Plugin ********/
add_action( 'tgmpa_register', 'florial_register_required_plugins' );
function florial_register_required_plugins() {
    $plugins = array(
		array(
            'name'               => esc_html__('Woocommerce', 'florial'), 
            'slug'               => 'woocommerce', 
            'required'           => false
        ),
		array(
            'name'      		 => esc_html__('Elementor', 'florial'),
            'slug'     			 => 'elementor',
            'required' 			 => false
        ),
		array(
            'name'               => esc_html__('Wpbingo Core', 'florial'), 
            'slug'               => 'wpbingo', 
            'source'             => get_template_directory() . '/plugins/wpbingo.zip',
            'required'           => true, 
        ),			
		array(
            'name'               => esc_html__('Redux Framework', 'florial'), 
            'slug'               => 'redux-framework', 
            'required'           => false
        ),			
		array(
            'name'      		 => esc_html__('Contact Form 7', 'florial'),
            'slug'     			 => 'contact-form-7',
            'required' 			 => false
        ),	
		array(
            'name'     			 => esc_html__('WPC Smart Wishlist for WooCommerce', 'florial'),
            'slug'      		 => 'woo-smart-wishlist',
            'required' 			 => false
        ),		
		array(
            'name'     			 => esc_html__('WooCommerce Variation Swatches', 'florial'),
            'slug'      		 => 'variation-swatches-for-woocommerce',
            'required' 			 => false
        ),
    );
    $config = array();
    tgmpa( $plugins, $config );
}