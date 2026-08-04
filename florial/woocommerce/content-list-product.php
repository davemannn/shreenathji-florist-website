<?php 
global $product, $woocommerce_loop, $post;
$florial_settings = florial_global_settings();
remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 10 );
remove_action('woocommerce_after_shop_loop_item', 'florial_quickview', 35 );
add_action('woocommerce_before_shop_loop_item_title', 'florial_quickview', 35 );
remove_action('woocommerce_after_shop_loop_item_title', 'bwp_display_woocommerce_attribute', 20 );
if( function_exists("bwp_display_woocommerce_attribute") && isset($florial_settings['product-attribute']) && $florial_settings['product-attribute'] ){
	add_action('woocommerce_before_shop_loop_item_title', 'bwp_display_woocommerce_attribute', 20 );
}
?>
<div class="products-entry clearfix product-wapper">
	<div class="row">
		<div class="col-sm-4">
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
			</div>
		</div>
		<div class="col-sm-8">
			<div class="products-content">
				<?php woocommerce_template_loop_rating(); ?>
				<h3 class="product-title"><a href="<?php esc_url(the_permalink()); ?>"><?php esc_html(the_title()); ?></a></h3>
				<?php do_action( 'woocommerce_after_shop_loop_item_title' ); ?>
				<div class='product-button'>
					<?php do_action('woocommerce_after_shop_loop_item'); ?>
				</div>
				<?php florial_add_excerpt_in_product_archives(); ?>
			</div>
		</div>
	</div>
</div>