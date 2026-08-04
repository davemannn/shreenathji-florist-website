	<?php 
		$florial_settings = florial_global_settings();
		$cart_layout = florial_get_config('cart-layout','dropdown');
		$cart_style = florial_get_config('cart-style','light');
		$show_minicart = (isset($florial_settings['show-minicart']) && $florial_settings['show-minicart']) ? ($florial_settings['show-minicart']) : false;
		$enable_sticky_header = ( isset($florial_settings['enable-sticky-header']) && $florial_settings['enable-sticky-header'] ) ? ($florial_settings['enable-sticky-header']) : false;
		$show_searchform = (isset($florial_settings['show-searchform']) && $florial_settings['show-searchform']) ? ($florial_settings['show-searchform']) : false;
		$show_wishlist = (isset($florial_settings['show-wishlist']) && $florial_settings['show-wishlist']) ? ($florial_settings['show-wishlist']) : false;
		$show_menutop = (isset($florial_settings['show-menutop']) && $florial_settings['show-menutop']) ? ($florial_settings['show-menutop']) : false;
	?>
	<h1 class="bwp-title hide"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
	<header id='bwp-header' class="bwp-header header-v6">
		<?php florial_campbar(); ?>
		<?php if(isset($florial_settings['show-header-top']) && $florial_settings['show-header-top']){ ?>
		<div id="bwp-topbar" class="topbar-v4 hidden-sm hidden-xs">
			<div class="topbar-inner">
				<div class="container">
					<div class="row">
						<div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 topbar-left hidden-sm hidden-xs">
							<?php if( isset($florial_settings['address']) && $florial_settings['address'] ) : ?>
							<div class="address hidden-xs">
								<a href="<?php echo esc_html($florial_settings['link_address']); ?>"><i class="icon-pin"></i><?php echo esc_html($florial_settings['address']); ?></a>
							</div>
							<?php endif; ?>
							<?php if( isset($florial_settings['phone']) && $florial_settings['phone'] ) : ?>
							<div class="phone hidden-sm hidden-xs">
								<a href="tel:<?php echo esc_html($florial_settings['phone']); ?>"><i class="icon-telephone"></i><?php echo esc_html($florial_settings['phone']); ?></a>
							</div>
							<?php endif; ?>
						</div>
						<div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 topbar-right">
							<?php if($show_menutop){ ?>
								<?php wp_nav_menu( 
								  array( 
									  'theme_location' => 'topbar_menu', 
									  'container' => 'false', 
									  'menu_id' => 'topbar_menu', 
									  'menu_class' => 'menu'
								   ) 
								); ?>
							<?php } ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php } ?>
		<?php florial_menu_mobile(); ?>
		<div class="header-desktop">
			<?php if(($show_minicart || $show_wishlist || $show_searchform || is_active_sidebar('top-link')) && class_exists( 'WooCommerce' ) ){ ?>
			<div class='header-wrapper' data-sticky_header="<?php echo esc_attr($florial_settings['enable-sticky-header']); ?>">
				<div class="container">
					<div class="container-inner">
						<div class="row">
							<div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12 header-left">
								<?php florial_header_logo(); ?>
							</div>
							<div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12 text-center">
								<div class="wpbingo-menu-mobile header-menu">
									<div class="header-menu-bg">
										<?php florial_top_menu(); ?>
									</div>
								</div>
							</div>
							<div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12 header-right">			
								<div class="header-page-link">
									<!-- Begin Search -->
									<?php if($florial_settings['show-searchform']){ ?>
										<div class="search-box">
											<div class="search-toggle"><i class="feather-search"></i></div>
										</div>
										<?php } ?>
									<!-- End Search -->
									<div class="login-header">
										<?php if (is_user_logged_in()) { ?>
											<?php if(is_active_sidebar('top-link')){ ?>
												<div class="block-top-link">
													<?php dynamic_sidebar( 'top-link' ); ?>
												</div>
											<?php } ?>
										<?php }else{ ?>
											<a class="active-login" href="#" ><i class="feather-user"></i></a>
											<?php florial_login_form(); ?>
										<?php } ?>
									</div>
									<?php if($show_wishlist && class_exists( 'WPCleverWoosw' )){ ?>
									<div class="wishlist-box">
										<a href="<?php echo WPcleverWoosw::get_url(); ?>"><i class="feather-heart"></i></a>
										<span class="count-wishlist"><?php echo WPcleverWoosw::get_count(); ?></span>
									</div>
									<?php } ?>
									<?php if($show_minicart && class_exists( 'WooCommerce' )){ ?>
									<div class="florial-topcart <?php echo esc_attr($cart_layout); ?> <?php echo esc_attr($cart_style); ?>">
										<?php get_template_part( 'woocommerce/minicart-ajax' ); ?>
									</div>
									<?php } ?>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div><!-- End header-wrapper -->
			<?php }else{ ?>
				<div class="header-normal">
					<div class='header-wrapper' data-sticky_header="<?php echo esc_attr($florial_settings['enable-sticky-header']); ?>">
						<div class="container">
							<div class="row">
								<div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6 header-left">
									<?php florial_header_logo(); ?>
								</div>
								<div class="col-xl-9 col-lg-9 col-md-6 col-sm-6 col-6 header-main">
									<div class="header-menu-bg">
										<?php florial_top_menu(); ?>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			<?php } ?>
		</div>
	</header><!-- End #bwp-header -->