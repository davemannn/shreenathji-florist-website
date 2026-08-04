<?php
	global $product, $woocommerce_loop, $post;
	$florial_settings = florial_global_settings();
	if(!isset($layout_shop)){
		$layout_shop = florial_get_config('layout_shop','1');
	}
	$stock = ( $product->is_in_stock() )? 'in-stock' : 'out-stock' ;
?>
<?php if ($layout_shop == '1') { ?>
	<?php
		add_action('woocommerce_before_shop_loop_item_title', 'florial_add_countdownt_item', 15 );
	?>
	<div class="products-entry content-product1 clearfix product-wapper">
		<div class="products-thumb">
			<?php
				/**
				 * woocommerce_before_shop_loop_item_title hook
				 *
				 * @hooked woocommerce_show_product_loop_sale_flash - 10
				 * @hooked woocommerce_template_loop_product_thumbnail - 10
				 */
				do_action( 'woocommerce_before_shop_loop_item_title' );
			?>
			<div class='product-button'>
				<?php do_action('woocommerce_after_shop_loop_item'); ?>
			</div>
			<?php if($stock == "out-stock"): ?>
				<div class="product-stock">    
					<span class="stock"><?php echo esc_html__( 'Out Of Stock', 'florial' ); ?></span>
				</div>
			<?php endif; ?>
		</div>
		<div class="products-content">
			<div class="contents">
				<?php woocommerce_template_loop_rating(); ?>
				<h3 class="product-title"><a href="<?php esc_url(the_permalink()); ?>"><?php esc_html(the_title()); ?></a></h3>
				<?php do_action( 'woocommerce_after_shop_loop_item_title' ); ?>
			</div>
		</div>
	</div>
<?php }elseif ($layout_shop == '2') { ?>
	<?php 
		remove_action('woocommerce_after_shop_loop_item', 'florial_woocommerce_template_loop_add_to_cart', 15 );
		remove_action('woocommerce_after_shop_loop_item_title', 'bwp_display_woocommerce_attribute', 20 );
		add_action('woocommerce_before_shop_loop_item_title', 'florial_add_countdownt_item', 15 );
	?>
	<div class="products-entry content-product4 clearfix product-wapper">
		<div class="products-thumb">
			<?php
				/**
				 * woocommerce_before_shop_loop_item_title hook
				 *
				 * @hooked woocommerce_show_product_loop_sale_flash - 10
				 * @hooked woocommerce_template_loop_product_thumbnail - 10
				 */
				do_action( 'woocommerce_before_shop_loop_item_title' );
			?>
			<div class='product-button'>
				<?php do_action('woocommerce_after_shop_loop_item'); ?>
			</div>
			<?php if($stock == "out-stock"): ?>
				<div class="product-stock">    
					<span class="stock"><?php echo esc_html__( 'Out Of Stock', 'florial' ); ?></span>
				</div>
			<?php endif; ?>
		</div>
		<div class="products-content">
			<div class="contents">
				<?php woocommerce_template_loop_rating(); ?>
				<h3 class="product-title"><a href="<?php esc_url(the_permalink()); ?>"><?php esc_html(the_title()); ?></a></h3>
				<?php do_action( 'woocommerce_after_shop_loop_item_title' ); ?>
				<div class="btn-atc">
					<?php florial_woocommerce_template_loop_add_to_cart(); ?>
				</div>
			</div>
		</div>
	</div>
<?php }elseif ($layout_shop == '3') { ?>
	<?php 
		remove_action('woocommerce_after_shop_loop_item', 'florial_woocommerce_template_loop_add_to_cart', 15 );
		add_action('woocommerce_before_shop_loop_item_title', 'florial_add_countdownt_item', 15 ); 
	?>
	<div class="products-entry content-product5 clearfix product-wapper">
		<div class="products-thumb">
			<?php
				/**
				 * woocommerce_before_shop_loop_item_title hook
				 *
				 * @hooked woocommerce_show_product_loop_sale_flash - 10
				 * @hooked woocommerce_template_loop_product_thumbnail - 10
				 */
				do_action( 'woocommerce_before_shop_loop_item_title' );
			?>
			<div class='product-button'>
				<?php do_action('woocommerce_after_shop_loop_item'); ?>
			</div>
		</div>
		<div class="products-content">
			<div class="contents">
				<div class="content-top">
					<?php woocommerce_template_loop_rating(); ?>
				</div>
				<h3 class="product-title"><a href="<?php esc_url(the_permalink()); ?>"><?php esc_html(the_title()); ?></a></h3>
				<?php do_action( 'woocommerce_after_shop_loop_item_title' ); ?>
				<div class="btn-atc">
					<?php florial_woocommerce_template_loop_add_to_cart(); ?>
				</div>
			</div>
		</div>
	</div>
<?php } ?>