<?php
    /*
    *
    *	Wpbingo Framework Menu Functions
    *	------------------------------------------------
    *	Wpbingo Framework v3.0
    * 	Copyright Wpbingo Ideas 2017 - http://wpbingosite.com/
    *
    *	florial_setup_menus()
    *
    */
    /* CUSTOM MENU SETUP
    ================================================== */
    register_nav_menus( array(
        'main_navigation' 	=> esc_html__( 'Main Menu', 'florial' ),
		'topbar_menu'   	=> esc_html__( 'Topbar Menu', 'florial' ),
        'menu_left'         => esc_html__( 'Menu Left', 'florial' ),
        'menu_right'        => esc_html__( 'Menu Right', 'florial' )
    ) );
?>