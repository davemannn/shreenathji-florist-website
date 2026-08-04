<?php
add_action( 'init', 'florial_button_product' );
add_action( 'woocommerce_before_single_product', 'florial_woocommerce_single_product_summary' );
remove_action( 'woocommerce_shop_loop_subcategory_title', 'woocommerce_template_loop_category_title', 10 );
add_action( 'woocommerce_after_subcategory', 'florial_woocommerce_template_loop_category_title', 10 );
add_action( 'woocommerce_after_subcategory_only', 'florial_woocommerce_template_loop_only_category_title', 10 );
remove_action( 'woocommerce_before_subcategory_title', 'woocommerce_subcategory_thumbnail', 10 );
add_action( 'woocommerce_before_subcategory_title', 'florial_woocommerce_subcategory_thumbnail', 10 );
add_filter( 'florial_custom_category', 'florial_woocommerce_maybe_show_product_subcategories' );
add_filter( 'woocommerce_add_to_cart_redirect','florial_quick_buy_redirect');
remove_action( 'woocommerce_cart_collaterals', 'woocommerce_cross_sell_display');
add_action( 'woocommerce_after_cart', 'woocommerce_cross_sell_display');
add_filter('woocommerce_placeholder_img_src', 'florial_woocommerce_placeholder_img_src');
add_filter( 'woosw_button_position_single', function(){return '0';} );
add_filter( 'woosw_button_position_archive', function(){ return '0';} );
add_filter( 'woosc_button_position_single', '__return_false' );
add_filter( 'woosc_button_position_archive', '__return_false' );
function florial_quick_buy_redirect( $url_redirect ) {
	if ( ! isset( $_REQUEST['quick_buy'] ) || $_REQUEST['quick_buy'] == false ) {
		return $url_redirect;
	}
	return wc_get_checkout_url();
}
function florial_woocommerce_placeholder_img_src( $src ){
	$src = get_template_directory_uri().'/images/placeholder.jpg';
	return $src;
}
function florial_button_product(){
	$florial_settings = florial_global_settings();
	//Button List Product
	remove_action( 'woocommerce_after_shop_loop_item_title', 'woocommerce_template_loop_rating', 5 );
	//Category
	if(isset($florial_settings['show-category']) && $florial_settings['show-category'] ){
		add_action('woocommerce_before_shop_loop_item', 'florial_woocommerce_template_loop_category', 15 );
	}
	//Cart
		remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_add_to_cart');
		add_action('woocommerce_after_shop_loop_item', 'florial_woocommerce_template_loop_add_to_cart', 15 );
	//Whishlist
	if(isset($florial_settings['product-wishlist']) && $florial_settings['product-wishlist'] && class_exists( 'WPCleverWoosw' ) ){
		add_action('woocommerce_after_shop_loop_item', 'florial_add_loop_wishlist_link', 18 );
	}
	//Compare
	if(isset($florial_settings['product-compare']) && $florial_settings['product-compare'] && class_exists( 'WPCleverWoosc' ) ){
		add_action('woocommerce_after_shop_loop_item', 'florial_add_loop_compare_link', 20 );
	}	
	//Quickview
		add_action('woocommerce_after_shop_loop_item', 'florial_quickview', 35 );
	/* Remove sold by in product loops */
	if(class_exists("WCV_Vendors")){
		remove_action( 'woocommerce_after_shop_loop_item', array('WCV_Vendor_Shop', 'template_loop_sold_by'), 9);
		add_action('woocommerce_after_shop_loop_item_title', array('WCV_Vendor_Shop', 'template_loop_sold_by'), 5 );
	}
	//Attribute
	if( function_exists("bwp_display_woocommerce_attribute") && isset($florial_settings['product-attribute']) && $florial_settings['product-attribute'] ){
		add_action('woocommerce_after_shop_loop_item_title', 'bwp_display_woocommerce_attribute', 20 );
	}
	/* Remove result count in product shop */
	remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
}
function florial_woocommerce_single_product_summary(){
	global $product;
	$product_short_desc = florial_get_config('product-short-desc',true);
	remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_rating', 10 );
	add_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_rating', 0 );
	add_action( 'woocommerce_after_add_to_cart_button', 'florial_add_loop_wishlist_link', 35 );
	add_action( 'woocommerce_after_add_to_cart_button', 'florial_add_loop_compare_link', 36 );
	add_action( 'woocommerce_single_product_summary', 'florial_add_social', 45 );
	remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_sale_flash');
	add_action( 'woocommerce_single_product_summary', 'florial_label_stock', 25 );	
	add_action( 'woocommerce_single_product_summary', 'florial_get_countdown', 20 );
	add_action( 'woocommerce_single_product_summary', 'florial_size_guide', 20 );	
	add_action( 'woocommerce_single_product_summary', 'florial_sticky_cart', 50 );
	add_action( 'woocommerce_after_add_to_cart_button', 'florial_product_quick_buy_button', 35 );
}
function florial_woocommerce_template_loop_category() {
	global $product;
	$html = '';
	$category =  get_the_terms( $product->get_id(), 'product_cat' );
	if ( $category && ! is_wp_error( $category ) ) {	
		$html = '<div class="cat-products">';
			$html .= '<a href="'.get_term_link( $category[0]->term_id, 'product_cat' ).'">';
				$html .= $category[0]->name;
			$html .= '</a>';
		$html .= '</div>';
	}
	echo wp_kses($html,'social');
}
function florial_update_total_price() {
	global $woocommerce;
	$data = array(
		'total_price' => $woocommerce->cart->get_cart_total(),
	);
	wp_send_json($data);
}	
add_action( 'wp_ajax_florial_update_total_price', 'florial_update_total_price' );
add_action( 'wp_ajax_nopriv_florial_update_total_price', 'florial_update_total_price' );
/* Ajax Search */
add_action( 'wp_ajax_florial_search_products_ajax', 'florial_search_products_ajax' );
add_action( 'wp_ajax_nopriv_florial_search_products_ajax', 'florial_search_products_ajax' );
function florial_search_products_ajax(){
	$character = (isset($_GET['character']) && $_GET['character'] ) ? $_GET['character'] : '';
	$limit = (isset($_GET['limit']) && $_GET['limit'] ) ? $_GET['limit'] : 5;
	$category = (isset($_GET['category']) && $_GET['category'] ) ? $_GET['category'] : "";
	$args = array(
		'post_type' 			=> 'product',
		'post_status'    		=> 'publish',
		'ignore_sticky_posts'   => 1,	  
		's' 					=> $character,
		'posts_per_page'		=> $limit
	);
	
	if($category){
		$args['tax_query'] = array(
			array(
				'taxonomy'  => 'product_cat',
				'field'     => 'slug',
				'terms'     => $category ));
	}
	$list = new WP_Query( $args );
	$json = array();
	if ($list->have_posts()) {
		while($list->have_posts()): $list->the_post();
		global $product, $post;
		$image = wp_get_attachment_image_src( get_post_thumbnail_id( $product->get_id() ), 'shop_catalog' );
		$json[] = array(
			'product_id' => $product->get_id(),
			'name'       => $product->get_title(),		
			'image'		 =>  $image[0],
			'link'		 =>  get_permalink( $product->get_id() ),
			'price'      =>  $product->get_price_html(),
		);			
		endwhile;
	}
	die (json_encode($json));
}
function florial_label_stock(){
	global $product; 
	$stock = ( $product->is_in_stock() )? 'in-stock' : 'out-stock' ;
	$product_stock = florial_get_config('product-stock',true);
	if($product_stock){ ?>
		<?php if($stock == "out-stock"): ?>
			<div class="product-stock">    
				<span class="stock"><?php echo esc_html__( 'Out stock', 'florial' ); ?></span>
			</div>
		<?php endif; ?>
	<?php } ?>
<?php }
function florial_product_quick_buy_button() {
	$show_quick_buy = florial_get_config('show-quick-buy',true);
	if($show_quick_buy){
		global $product;
		if ( $product->get_type() == 'external' ) {
			return;
		}
		$html = '<button class="button quick-buy">'.esc_html__("Buy Now","florial").'</button>';
		echo wp_kses($html,'social');		
	}
}
function florial_quickview_short_desc(){
	global $post;
	if ( ! $post->post_excerpt ) {
		return;
	}
	$length_product_short_desc = florial_get_config('length-product-short-desc',true);
	?>
	<div itemprop="description" class="description">
		<?php echo apply_filters( 'woocommerce_short_description', wp_trim_words( $post->post_excerpt, $length_product_short_desc ) ) ?>
	</div>
<?php }
function florial_get_countdown(){
	global $product;
	$dates = time();
	$start_time = get_post_meta( $product->get_id(), '_sale_price_dates_from', true );
	$countdown_time = get_post_meta( $product->get_id(), '_sale_price_dates_to', true );
	$orginal_price = get_post_meta( $product->get_id(), '_regular_price', true );	
	$sale_price = get_post_meta( $product->get_id(), '_sale_price', true );	
	$symboy = get_woocommerce_currency_symbol( get_woocommerce_currency() );
	$show_countdown = florial_get_config('show-countdown',true);
	if($show_countdown && ( $dates >= $start_time )){
		if ( $countdown_time ):
			$date = bwp_timezone_offset( $countdown_time ); ?>
			<div class="countdown-single">
				<h2 class="title-countdown"><?php echo esc_html__("Hurry up ! Deal ends in :","florial") ?></h2>
				<div class="product-countdown"  data-day="<?php echo esc_attr__("Days","florial"); ?>" data-hour="<?php echo esc_attr__("Hours","florial"); ?>" data-min="<?php echo esc_attr__("Mins","florial"); ?>" data-sec="<?php echo esc_attr__("Secs","florial"); ?>" data-date="<?php echo esc_attr( $date ); ?>" data-price="<?php echo esc_attr( $symboy.$orginal_price ); ?>" data-sttime="<?php echo esc_attr( $start_time ); ?>" data-cdtime="<?php echo esc_attr( $countdown_time ); ?>" data-id="<?php echo esc_attr('product_'.$product->get_id()); ?>"></div>
			</div>
		<?php endif; ?>
	<?php } ?>
<?php }
function florial_size_guide(){
	global $product;
	$florial_settings = florial_global_settings();
	$size_guide = florial_get_config('size-guide',false);
	if($size_guide && $product->is_type( 'variable' )){
		if(isset($florial_settings['img-size-guide']['url']) && !empty($florial_settings['img-size-guide']['url'])):?>
		<div class="size-guide">
			<div class="title-size-guide"><i class="wpb-icon-ruler"></i><?php echo esc_html__("Size Guide","florial") ?></div>
			<div class="img-size-guide">
				<div class="title-size-guide"><i class="icon_close"></i></div>
				<img src="<?php echo esc_url($florial_settings['img-size-guide']['url']); ?>" alt="<?php echo esc_attr__( 'Image Size Guide','florial' ); ?>">
			</div>
		</div>
		<?php endif; ?>
	<?php } ?>
<?php }
function florial_sticky_cart(){
	global $product; 
	$show_sticky_cart = florial_get_config('show-sticky-cart',true);
	remove_action( 'woocommerce_after_add_to_cart_button', 'florial_add_loop_wishlist_link', 35 );
	if($show_sticky_cart){ ?>
	<div class="sticky-product">
		<div class="content">
			<div class="content-product">
				<div class="item-thumb">
					<a href="<?php echo get_permalink( $product->get_id() ); ?>"><img src="<?php echo wp_get_attachment_url( $product->get_image_id() ); ?>" /></a>
				</div>
				<div class="content-bottom">
					<div class="item-title">
						<a href="<?php echo esc_url(get_permalink( $product->get_id() )); ?>"><?php echo esc_html($product->get_title()); ?></a>
					</div>
					<div class="price">
						<?php echo wp_kses($product->get_price_html(),'social'); ?>
					</div>
				</div>
			</div>
			<div class="content-cart">
				<?php if ( $product->get_type() == 'simple' || $product->get_type() == 'external' ) {
					woocommerce_template_single_add_to_cart();
				}else{ ?>
					<div class="select-cart-option"><?php echo esc_html__("select option","florial") ?></div>
				<?php } ?>
			</div>
		</div>
	</div>
	<?php } ?>
<?php }
function florial_add_countdownt_item(){
	global $product;
	$dates = time();
	$item_id = 'item_countdown_'.rand().time();
	$start_time = get_post_meta( $product->get_id(), '_sale_price_dates_from', true );
	$countdown_time = get_post_meta( $product->get_id(), '_sale_price_dates_to', true );	
	$quickview = florial_get_config('product_quickview');
	if( $start_time && $countdown_time && ( $dates >= $start_time )) {
	$date = bwp_timezone_offset( $countdown_time );	
	?>
	<div class="countdown">
		<div class="item-countdown">
			<div class="product-countdown"  
				data-day="<?php echo esc_html__("d","florial"); ?>"
				data-hour="<?php echo esc_html__("h","florial"); ?>"
				data-min="<?php echo esc_html__("m","florial"); ?>"
				data-sec="<?php echo esc_html__("s","florial"); ?>"
				data-date="<?php echo esc_attr( $date ); ?>"  
				data-sttime="<?php echo esc_attr( $start_time ); ?>" 
				data-cdtime="<?php echo esc_attr( $countdown_time ); ?>"
				data-id="<?php echo esc_attr($item_id); ?>">
			</div>
		</div>
	</div>
	<?php }
}
function florial_woocommerce_template_loop_add_to_cart( $args = array() ) {
	global $product;
	if ( $product ) {
		$defaults = array(
			'quantity' => 1,
			'class'    => implode( ' ', array_filter( array(
					'button',
					'product_type_' . $product->get_type(),
					$product->is_purchasable() && $product->is_in_stock() ? 'add_to_cart_button' : 'read_more',
					$product->supports( 'ajax_add_to_cart' ) ? 'ajax_add_to_cart' : '',
			) ) ),
		);
		$args = apply_filters( 'woocommerce_loop_add_to_cart_args', wp_parse_args( $args, $defaults ), $product );
		wc_get_template( 'loop/add-to-cart.php', $args );
	}
}	
function florial_add_excerpt_in_product_archives() {
	global $post;
	if ( ! $post->post_excerpt ) return;		
	echo '<div class="item-description item-description2">'.wp_trim_words( $post->post_excerpt, 25 ).'</div>';
}	
/*add second thumbnail loop product*/
remove_action( 'woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail', 10 );
add_action( 'woocommerce_before_shop_loop_item_title', 'florial_woocommerce_template_loop_product_thumbnail', 10 );
if ( !function_exists( 'florial_product_thumbnail' ) ) {
	function florial_product_thumbnail( $size = 'woocommerce_thumbnail', $placeholder_width = 0, $placeholder_height = 0  ) {
		global $florial_settings,$product;
		$html = '';
		$attachment_ids = $product->get_gallery_image_ids();
			if(!empty($attachment_ids)) {
				$first_image_id = $attachment_ids[0];
				$attachment_image = wp_get_attachment_image($first_image_id , $size, false, array('class' => 'hover-image back', 'loading' => 'eager'));
			}
			if ( $attachment_image ){
				if( $attachment_image && isset($florial_settings['category-image-hover']) && $florial_settings['category-image-hover']){
					$html .= '<div class="product-thumb-hover">';
					$html .= '<a href="' . esc_attr($product->get_permalink()) . '" class="woocommerce-LoopProduct-link">';
					$html .= (get_the_post_thumbnail( $product->get_id(), $size )) ? get_the_post_thumbnail( $product->get_id(), $size, array('class' => 'fade-in lazyload', 'loading' => 'eager') ): '<img src="'.get_template_directory_uri().'/images/placeholder.jpg" alt="'. esc_attr__('No thumb', 'florial').'">';
					$html .= $attachment_image;
					$html .= '</a>';
					$html .= '</div>';				
				}else{
					$html .= '<a href="' . esc_attr($product->get_permalink()) . '" class="woocommerce-LoopProduct-link">';		
					$html .= (get_the_post_thumbnail( $product->get_id(), $size )) ? get_the_post_thumbnail( $product->get_id(), $size, array('class' => 'fade-in lazyload', 'loading' => 'eager') ): '<img src="'.get_template_directory_uri().'/images/placeholder.jpg" alt="'. esc_attr__('No thumb', 'florial').'">';
					$html .= '</a>';
				}		
			}else{
				$html .= '<a href="' . esc_attr($product->get_permalink()) . '" class="woocommerce-LoopProduct-link">';		
				$html .= (get_the_post_thumbnail( $product->get_id(), $size )) ? get_the_post_thumbnail( $product->get_id(), $size, array('class' => 'fade-in lazyload', 'loading' => 'eager') ): '<img src="'.get_template_directory_uri().'/images/placeholder.jpg" alt="'. esc_attr__('No thumb', 'florial').'">';
				$html .= '</a>';	
			}
		/* quickview */
		return $html;
	}
}
function florial_woocommerce_template_loop_product_thumbnail(){
	echo florial_product_thumbnail();
}
function florial_countdown_woocommerce_template_loop_product_thumbnail(){
	echo florial_product_thumbnail("shop_single");
}
//Button List Product
/*********QUICK VIEW PRODUCT**********/
function florial_product_quick_view_scripts() {	
	wp_enqueue_script('wc-add-to-cart-variation');
}
add_action( 'wp_enqueue_scripts', 'florial_product_quick_view_scripts' );	
function florial_quickview(){
	global $product;
	$quickview = florial_get_config('product_quickview'); 
	if( $quickview ) : 
		echo '<span class="product-quickview"><a href="#" data-product_id="'.esc_attr($product->get_id()).'" class="quickview quickview-button quickview-'.esc_attr($product->get_id()).'" >'.apply_filters( 'out_of_stock_add_to_cart_text', 'Quick View' ).' <i class="feather-search"></i>'.'</a></span>';
	endif;
}
add_action("wp_ajax_florial_quickviewproduct", "florial_quickviewproduct");
add_action("wp_ajax_nopriv_florial_quickviewproduct", "florial_quickviewproduct");
function florial_quickviewproduct(){
	echo florial_content_product();exit();
}
function florial_content_product(){
	$productid = (isset($_REQUEST["product_id"]) && $_REQUEST["product_id"]>0) ? $_REQUEST["product_id"] : 0;
	$query_args = array(
		'post_type'	=> 'product',
		'p'			=> $productid
	);
	$outputraw = $output = '';
	$r = new WP_Query($query_args);
	if($r->have_posts()){ 
		while ($r->have_posts()){ $r->the_post(); setup_postdata($r->post);
			ob_start();
			wc_get_template_part( 'content', 'quickview-product' );
			$outputraw = ob_get_contents();
			ob_end_clean();
		}
	}
	$output = preg_replace(array('/\s{2,}/', '/[\t\n]/'), ' ', $outputraw);
	return $output;	
}
//sale flash
function florial_add_sale_flash(){	
	wc_get_template( 'loop/sale-flash.php' );
}
//Wish list
function florial_add_loop_wishlist_link(){	
	global $product;
	$product_id = $product->get_id();
	if( class_exists( 'WPCleverWoosw' ) ){
		echo do_shortcode('[woosw id='.esc_attr($product_id).']');
	}
}
//Compare
function florial_add_loop_compare_link(){
	global $post;
	$product_id = $post->ID;	
	if( class_exists( 'WPCleverWoosc' ) ){
		echo do_shortcode('[woosc id='.esc_attr($product_id).']');
	}	
}
function florial_add_social() {
	$product_share	 = florial_get_config('product-share',true);
	if ( shortcode_exists( 'social_share' ) && $product_share) :
		echo '<div class="social-icon">';
			echo '<label>';
			echo esc_html__("Share : ","florial");
			echo '</label>';
			echo do_action( 'woocommerce_share' );
			echo do_shortcode( "[social_share]" );
		echo '</div>';
	endif;	
}
function florial_add_thumb_single_product() {
	echo '<div class="image-thumbnail-list">';
	do_action( 'woocommerce_product_thumbnails' );
	echo '</div>';
}
function florial_get_class_item_product(){
	$product_col_large = 12 /(florial_get_config('product_col_large',4));	
	$product_col_medium = 12 /(florial_get_config('product_col_medium',3));
	$product_col_sm 	= 12 /(florial_get_config('product_col_sm',1));
	$product_col_xs 	= 12 /(florial_get_config('product_col_xs',1));
	$class_item_product = 'col-lg-'.$product_col_large.' col-md-'.$product_col_medium.' col-sm-'.$product_col_sm.' col-'.$product_col_xs;
	return $class_item_product;
}
function florial_catalog_perpage(){
	$florial_settings = florial_global_settings();
	$query_string = florial_get_query_string();
	parse_str($query_string, $params);
	$query_string 	= '?'.$query_string;
	$per_page 	=   (isset($florial_settings['product_count']) && $florial_settings['product_count'])  ? (int)$florial_settings['product_count'] : 12;
	$product_count = (isset($params['product_count']) && $params['product_count']) ? ($params['product_count']) : $per_page;
	?>
	<div class="florial-woocommerce-sort-count">
		<div class="woocommerce-sort-count">
			<ul class="list-show">
				<li data-value="<?php echo esc_attr($per_page); 	?>"<?php if ($product_count == $per_page){?>class="active"<?php } ?>><a href="<?php echo add_query_arg('product_count', $per_page, $query_string); ?>"><?php echo esc_attr($per_page); ?></a></li>
				<li data-value="<?php echo esc_attr($per_page*2); 	?>"<?php if ($product_count == $per_page*2){?>class="active"<?php } ?>><a href="<?php echo add_query_arg('product_count', $per_page*2, $query_string); ?>"><?php echo esc_attr($per_page*2); ?></a></li>
				<li data-value="<?php echo esc_attr($per_page*3); 	?>"<?php if ($product_count == $per_page*3){?>class="active"<?php } ?>><a href="<?php echo add_query_arg('product_count', $per_page*3,$query_string); ?>"><?php echo esc_attr($per_page*3); ?></a></li>
			</ul>
		</div>
	</div>
<?php }	
add_filter('loop_shop_per_page', 'florial_loop_shop_per_page');
function florial_loop_shop_per_page() {
	$florial_settings = florial_global_settings();
	$query_string = florial_get_query_string();
	parse_str($query_string, $params);
	$per_page 	=   (isset($florial_settings['product_count']) && $florial_settings['product_count'])  ? (int)$florial_settings['product_count'] : 12;
	$product_count = (isset($params['product_count']) && $params['product_count']) ? ($params['product_count']) : $per_page;
	return $product_count;
}	
function florial_found_posts(){
	wc_get_template( 'loop/woocommerce-found-posts.php' );
}	
remove_action('woocommerce_before_main_content', 'florial_woocommerce_breadcrumb', 20);	
remove_action('woocommerce_before_main_content', 'woocommerce_breadcrumb', 20);
remove_action( 'woocommerce_before_shop_loop_item', 'woocommerce_template_loop_product_link_open', 10 );
remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_product_link_close', 5 );
function florial_search_form_product(){
	$query_string = florial_get_query_string();
	parse_str($query_string, $params);
	$category_slug = isset( $params['product_cat'] ) ? $params['product_cat'] : '';
	$terms =	get_terms( 'product_cat', 
	array(  
		'hide_empty' => true,	
		'parent' => 0	
	));
	$class_ajax_search 	= "";	 
	$ajax_search 		= florial_get_config('show-ajax-search',false);
	$limit_ajax_search 		= florial_get_config('limit-ajax-search',5);
	if($ajax_search){
		$class_ajax_search = "ajax-search";
	}
	?>
	<form role="search" method="get" class="search-from <?php echo esc_attr($class_ajax_search); ?>" action="<?php echo esc_url(home_url( '/' )); ?>" data-admin="<?php echo admin_url( 'admin-ajax.php', 'florial' ); ?>" data-noresult="<?php echo esc_html__("No Result","florial") ; ?>" data-limit="<?php echo esc_attr($limit_ajax_search); ?>">
		<?php if($terms && is_object($terms)){ ?>
		<div class="select_category pwb-dropdown dropdown">
			<span class="pwb-dropdown-toggle dropdown-toggle" data-toggle="dropdown"><?php echo esc_html__("Category","florial"); ?></span>
			<span class="caret"></span>
			<ul class="pwb-dropdown-menu dropdown-menu category-search">
			<li data-value="" class="<?php  echo (empty($category_slug) ?  esc_attr("active") : ""); ?>"><?php echo esc_html__("Browse Category","florial"); ?></li>
				<?php foreach($terms as $term){ ?>
					<?php if( $term && is_object($term) ){ ?>
						<li data-value="<?php echo esc_attr($term->slug); ?>" class="<?php  echo (($term->slug == $category_slug) ?  esc_attr("active") : ""); ?>"><?php echo esc_html($term->name); ?></li>
						<?php
							$terms_vl1 =	get_terms( 'product_cat', 
							array( 
									'parent' => '', 
									'hide_empty' => false,
									'parent' 		=> $term->term_id, 
							));						
						?>	
						<?php foreach ($terms_vl1 as $term_vl1) { ?>
							<?php if( $term_vl1 && is_object($term_vl1) ){ ?>
								<li data-value="<?php echo esc_attr($term_vl1->slug); ?>" class="<?php  echo (($term_vl1->slug == $category_slug) ?  esc_attr("active") : ""); ?>"><?php echo esc_html($term_vl1->name); ?></li>
								<?php
									$terms_vl2 =	get_terms( 'product_cat', 
									array( 
											'parent' => '', 
											'hide_empty' => false,
											'parent' 		=> $term_vl1->term_id, 
								));	?>					
								<?php foreach ($terms_vl2 as $term_vl2) { ?>
									<?php if( $term_vl2 && is_object($term_vl2) ){ ?>
										<li data-value="<?php echo esc_attr($term_vl2->slug); ?>" class="<?php  echo (($term_vl2->slug == $category_slug) ?  esc_attr("active") : ""); ?>"><?php echo esc_html($term_vl2->name); ?></li>
									<?php } ?>
								<?php } ?>
							<?php } ?>
						<?php } ?>
					<?php } ?>
				<?php } ?>
			</ul>	
			<input type="hidden" name="product_cat" class="product-cat" value="<?php echo esc_attr($category_slug); ?>"/>
		</div>	
		<?php } ?>	
		<div class="search-box">
			<button id="searchsubmit" class="btn" type="submit">
				<i class="icon-search"></i>
				<span><?php echo esc_html__('search','florial'); ?></span>
			</button>
			<input type="text" value="<?php echo get_search_query(); ?>" name="s" id="s" class="input-search s" placeholder="<?php echo esc_attr__( 'Search...', 'florial' ); ?>" />
			<div class="result-search-products-content">
				<ul class="result-search-products">
				</ul>
			</div>
		</div>
		<input type="hidden" name="post_type" value="product" />
	</form>
<?php }
function florial_top_cart(){
	global $woocommerce; ?>
	<div id="cart" class="top-cart">
		<a class="cart-icon" href="<?php echo get_permalink( wc_get_page_id( 'cart' ) ); ?>" title="<?php esc_attr_e('View your shopping cart', 'florial'); ?>">
			<i class="flaticon-bag"></i>
		</a>
	</div>
<?php }
function florial_button_filter(){
	$html = '<a class="button-filter-toggle"></a>';
	echo wp_kses($html,'social');
}	
function florial_image_single_product(){
	$class = new stdClass;
	$class->show_thumb = florial_get_config('product-thumbs',false);
	$position = florial_get_config('position-thumbs',"bottom");
	$product_layout_thumb 			= florial_get_config("layout-thumbs","zoom");
	$class->position = $position;
	if($class->show_thumb && $position == "outsite"){
		add_action( 'woocommerce_single_product_summary', 'florial_add_thumb_single_product', 40 );
	}	
	if(($position == 'left' || $position == "right") && ($product_layout_thumb=="scroll" || $product_layout_thumb=="zoom")){
		$class->class_thumb = "col-md-2";
		$class->class_data_image = 'data-vertical="true" data-verticalswiping="true"';
		$class->class_image = "col-md-10";
	}else{
		$class->class_thumb = $class->class_image = "col-sm-12";
		$class->class_data_image = "";
	}
	$product_count_thumb = florial_get_config("product-thumbs-count","") ? florial_get_config("product-thumbs-count","") : apply_filters( 'woocommerce_product_thumbnails_columns', 4 );
	$class->product_count_thumb =	$product_count_thumb;
	$product_layout_thumb = florial_get_config("layout-thumbs","zoom");
	$class->product_layout_thumb =	$product_layout_thumb;
	return $class;
}
function florial_category_top_bar(){
	add_action('woocommerce_before_shop_loop','woocommerce_result_count',40); 
	add_action('woocommerce_before_shop_loop','florial_display_view', 35);
	remove_action('woocommerce_before_shop_loop','florial_found_posts', 20);
	add_action('woocommerce_before_shop_loop','woocommerce_catalog_ordering', 30);
	$category_style  = florial_get_config('category_style','sidebar');
	add_action('woocommerce_before_shop_loop','florial_button_filter', 25);
	do_action( 'woocommerce_before_shop_loop' );
}
function florial_get_product_discount(){
	global $product;
	$discount = 0;
	if ($product->is_on_sale() && $product->is_type( 'variable' )){
		$available_variations = $product->get_available_variations();
		for ($i = 0; $i < count($available_variations); ++$i) {
			$variation_id=$available_variations[$i]['variation_id'];
			$variable_product1= new WC_Product_Variation( $variation_id );
			$regular_price = $variable_product1->get_regular_price();
			$sales_price = $variable_product1->get_sale_price();
			if(is_numeric($regular_price) && is_numeric($sales_price)){
				$percentage = round( (( $regular_price - $sales_price ) / $regular_price ) * 100 ) ;
				if ($percentage > $discount) {
					$discount = $percentage;
				}
			}
		}
	}elseif($product->is_on_sale() && $product->is_type( 'simple' )){
		$regular_price	= $product->get_regular_price();
		$sales_price	= $product->get_sale_price();
		if(is_numeric($regular_price) && is_numeric($sales_price)){
			$discount = round( ( ( $regular_price - $sales_price ) / $regular_price ) * 100 );
		}
	}
	if( $discount > 0 ){
		$text_discount = "-".$discount.'%';
	}else{
		$text_discount = '';
	}
	return 	$text_discount;
}
add_action( 'woocommerce_before_quantity_input_field', 'florial_display_quantity_plus' );
function florial_display_quantity_plus() {
   $html = '<button type="button" class="plus" >+</button>';
   echo wp_kses($html,'social');
}
add_action( 'woocommerce_after_quantity_input_field', 'florial_display_quantity_minus' );
function florial_display_quantity_minus() {
	$html = '<button type="button" class="minus" >-</button>';
	echo wp_kses($html,'social');
}
function florial_woocommerce_template_loop_category_title( $category ) { ?>
	<div class="woocommerce-loop-category">
		<h2 class="woocommerce-loop-category__title">
			<a href="<?php echo get_term_link( $category->term_id, 'product_cat' ); ?>"><?php echo esc_html( $category->name ); ?></a>
		</h2>
	</div>
	<?php
}
function florial_woocommerce_template_loop_only_category_title( $category ) { ?>
		<div class="woocommerce-loop-category">
			<h2 class="woocommerce-loop-category__title">
				<a href="<?php echo get_term_link( $category->term_id, 'product_cat' ); ?>"><?php echo esc_html( $category->name ); ?></a>
			</h2>
			<div class="count-product">
				<?php if ( $category->count == 1 ) {
					echo apply_filters( 'woocommerce_subcategory_count_html', esc_html( $category->count ) . '' . esc_html__(" product","florial"), $category );
				}else{
					echo apply_filters( 'woocommerce_subcategory_count_html', esc_html( $category->count ) . '' . esc_html__(" products","florial"), $category );
				} ?>
			</div>
			<div class="view-all">
				<a href="<?php echo get_term_link( $category->term_id, 'product_cat' ); ?>"><?php echo esc_html__("View all products","florial"); ?></a>
			</div>
		</div>
	<?php
}
function florial_woocommerce_subcategory_thumbnail( $category ){
	$subcategories_style = florial_get_config('style-subcategories','shop_mini_categories');
	if($subcategories_style == "icon_categories"){
		$icon_category = get_term_meta( $category->term_id, 'category_icon', true );
		if($icon_category){?>
			<i class="<?php echo esc_attr($icon_category); ?>"></i>
			<?php }
	}else{
		$thumbnail_id         = get_term_meta( $category->term_id, 'thumbnail_id', true );
		if ( $thumbnail_id ) {
			$image        = wp_get_attachment_image_src( $thumbnail_id, 'full' );
			if( is_array($image) && $image[0] ){
				$image        = $image[0];
			}else{
				$image = get_template_directory_uri().'/images/placeholder_cat.jpg';
			} ?>
			<img class="fade-in lazyloaded" src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $category->name ); ?>"/>
			<?php
		}
	}
}
function florial_get_video_product(){
	global $product;
	$video  = (get_post_meta( $product->get_id(), 'video_product', true )) ? get_post_meta($product->get_id(), 'video_product', true ) : "";
	if($video){ ?>
		<?php
			$youtube_id = florial_get_youtube_video_id($video);
			$vimeo_id = florial_get_vimeo_video_id($video);
			$url_video = "#";
			if($youtube_id){
				$url_video = "https://www.youtube.com/embed/".esc_attr($youtube_id);
			}elseif($vimeo_id){
				$url_video = "https://player.vimeo.com/video/".esc_attr($vimeo_id);
			}
		?>
		<div class="florial-product-button ">
			<div class="florial-bt-video">
				<div class="bwp-video modal" data-src="<?php echo esc_attr($url_video); ?>">
					<?php echo esc_html__( 'Play video', 'florial' ); ?>
				</div>
				<div class="content-video modal fade" id="myModal">
					<div class="remove-show-modal"></div>
					<div class="modal-dialog modal-dialog-centered">
						<?php florial_display_video_product(); ?>
					</div>
				</div>
			</div>
		</div>
	<?php }
}
function florial_display_video_product(){
	global $product;
	$video  = (get_post_meta( $product->get_id(), 'video_product', true )) ? get_post_meta($product->get_id(), 'video_product', true ) : "";
	if($video){
		$youtube_id = florial_get_youtube_video_id($video);
		$vimeo_id = florial_get_vimeo_video_id($video);
		?>
		<?php if($youtube_id){ ?>
			<iframe id="video" src="https://www.youtube.com/embed/<?php echo esc_attr($youtube_id); ?>" title="<?php echo esc_html__("YouTube video player","florial"); ?>" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
		<?php }elseif($vimeo_id){?>
			<iframe id="video" src="https://player.vimeo.com/video/<?php echo esc_attr($vimeo_id); ?>"  frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
		<?php } ?>
	<?php }
}
function florial_display_thumb_video(){
	global $product;
	$html = "";
	$video  = (get_post_meta( $product->get_id(), 'video_product', true )) ? get_post_meta($product->get_id(), 'video_product', true ) : "";
	if($video){
		$youtube_id = florial_get_youtube_video_id($video);
		$vimeo_id = florial_get_vimeo_video_id($video);		
		if($youtube_id){
			$html .= '<div class="img-thumbnail-video">';
				$html .= '<img src="http://img.youtube.com/vi/'.$youtube_id.'/sddefault.jpg"/>';
			$html .= '</div>';
		}elseif($vimeo_id){
			$arr_vimeo = unserialize(WP_Filesystem_Direct::get_contents("https://vimeo.com/api/v2/video/".esc_attr($vimeo_id).".php"));
			$html .= '<div class="img-thumbnail-video">';
				$html .= '<img src="'.esc_attr($arr_vimeo[0]['thumbnail_large']).'"/>';
			$html .= '</div>';
		}
	}
	if($html){
		echo wp_kses($html,'social');
	}
}
function florial_get_vimeo_video_id($url){
	$regs = array();
	$video_id = '';
	if (preg_match('%^https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)(?:[?]?.*)$%im', $url, $regs)) {
	$video_id = $regs[3];
	}
	return $video_id;
}
function florial_get_youtube_video_id($url){
	$video_id = false;
	$url = parse_url($url);
	if (strcasecmp($url['host'], 'youtu.be') === 0)
	{
		$video_id = substr($url['path'], 1);
	}
	elseif (strcasecmp($url['host'], 'www.youtube.com') === 0)
	{
		if (isset($url['query'])){
			parse_str($url['query'], $url['query']);
			if (isset($url['query']['v'])){
				$video_id = $url['query']['v'];
			}
		}
		if ($video_id == false){
			$url['path'] = explode('/', substr($url['path'], 1));
			if (in_array($url['path'][0], array('e', 'embed', 'v'))){
				$video_id = $url['path'][1];
			}
		}
	}else{
		return false;
	}
	return $video_id;
}
function florial_view_product(){
	global $product;
	$view  = (get_post_meta( $product->get_id(), 'view_product', true )) ? get_post_meta($product->get_id(), 'view_product', true ) : "";
	if($view == 'true'){ $j=0; ?>
	<?php $attachment_ids = $product->get_gallery_image_ids(); ?>
	<div class="florial-360-button"><i class="wpb-icon-d-design"></i><?php echo esc_html__("360 Degree","florial") ?></div>
	<div class="content-product-360-view">
		<div class="product-360-view" data-count="<?php echo esc_attr(count($attachment_ids)-1); ?>">
			<div class="florial-360-button"></div>
			<div class="images-display">
				<ul class="images-list">
				<?php
					foreach ( $attachment_ids as $attachment_id ) {		
						$image_link = wp_get_attachment_url( $attachment_id );
						if ( ! $image_link )
							continue;
						$image_title 	= esc_attr( get_the_title( $attachment_id ) );
						$image_caption 	= esc_attr( get_post_field( 'post_excerpt', $attachment_id ) );
						$image       = wp_get_attachment_image( $attachment_id, apply_filters( 'single_product_small_thumbnail_size', 'shop_catalog' ), 0, $attr = array(
							'title' => $image_title,
							'alt'   => $image_title
							) ); ?>
						<li class="images-display image-<?php echo esc_attr($j); ?> <?php if($j==0){ ?>active<?php } ?>"><?php echo wp_kses($image,'social'); ?></li>
						<?php $j++;
					}
				?>
				</ul>
			</div>
		</div>
	</div>
	<?php }
}
function florial_woocommerce_maybe_show_product_subcategories( $loop_html = '' ) {
	if(class_exists( 'WooCommerce' )){
		$product_categories = get_terms( 'product_cat', array('hide_empty' => true) );
		ob_start();
		foreach ( $product_categories as $category ) {
			wc_get_template(
				'content-product_cat.php',
				array(
					'category' => $category,
				)
			);
		}
		$loop_html .= ob_get_clean();
		return $loop_html;
	}
}
function florial_woocommerce_output_product_categories( ){
	if(class_exists( 'WooCommerce' )){ 
		$product_categories = get_terms( 'product_cat', array('hide_empty' => true) );
		if ( ! $product_categories ) {
			return false;
		}
		foreach ( $product_categories as $category ) {
			wc_get_template(
				'content-only-product_cat.php',
				array(
					'category' => $category,
				)
			);
		}
		return true;
	}
}
function florial_gallery_product(){ ?>
	<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="pswp__bg"></div>
		<div class="pswp__scroll-wrap">
			<div class="pswp__container">
				<div class="pswp__item"></div>
				<div class="pswp__item"></div>
				<div class="pswp__item"></div>
			</div>
			<div class="pswp__ui pswp__ui--hidden">
				<div class="pswp__top-bar">
					<div class="pswp__counter"></div>
					<button class="pswp__button pswp__button--close" title="<?php echo esc_attr__( 'Close (Esc)','florial' ); ?>"></button>
					<button class="pswp__button pswp__button--fs" title="<?php echo esc_attr__( 'Toggle fullscreen','florial' ); ?>"></button>
					<div class="pswp__preloader">
						<div class="pswp__preloader__icn">
						  <div class="pswp__preloader__cut">
							<div class="pswp__preloader__donut"></div>
						  </div>
						</div>
					</div>
				</div>
				<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
					<div class="pswp__share-tooltip"></div> 
				</div>
				<button class="pswp__button pswp__button--arrow--left" title="<?php echo esc_attr__( 'Previous (arrow left)','florial' ); ?>"></button>
				<button class="pswp__button pswp__button--arrow--right" title="<?php echo esc_attr__( 'Next (arrow right)','florial' ); ?>"></button>
				<div class="pswp__caption">
					<div class="pswp__caption__center"></div>
				</div>
			</div>
		</div>
	</div>
<?php }
?>