<?php 
global $post, $woocommerce, $product;
$post_thumbnail_id = get_post_thumbnail_id( $post->ID );
$video_style = florial_get_config("video-style","inner");
$video  = (get_post_meta( $product->get_id(), 'video_product', true )) ? get_post_meta($product->get_id(), 'video_product', true ) : "";
$data_product = $product->get_data();
$image_id = $data_product['image_id'] ? $data_product['image_id'] : array();
$attachment_ids = $product->get_gallery_image_ids();
if($image_id )
	array_unshift ($attachment_ids,$image_id);
$full_size_image   = wp_get_attachment_image_src( $post_thumbnail_id, 'full' );
$image_title       = get_post_field( 'post_excerpt', $post_thumbnail_id );
$placeholder       = has_post_thumbnail() ? 'with-images' : 'without-images';
$wrapper_classes   = apply_filters( 'woocommerce_single_product_image_gallery_classes', array(
	'woocommerce-product-gallery',
	'woocommerce-product-gallery--' . $placeholder,
	'images',
) );
$class= "";
if(florial_image_single_product()->show_thumb && (florial_image_single_product()->position == "left" || florial_image_single_product()->position == "right"))
	$class = "vertical";
?>
<div class="images <?php echo esc_attr($class); ?>">
	<figure class="<?php echo esc_attr( implode( ' ', array_map( 'sanitize_html_class', $wrapper_classes ) ) ); ?>">
		<div class="row">
			<?php if(florial_image_single_product()->show_thumb && florial_image_single_product()->position == "left") : ?>
				<div class="<?php echo esc_attr(florial_image_single_product()->class_thumb); ?>">
				<?php do_action( 'woocommerce_product_thumbnails' ); ?>
				</div>
			<?php endif; ?>
			<div class="<?php echo esc_attr(florial_image_single_product()->class_image); ?>">
				<div class="image-additional text-center active">
				<?php
				if ( has_post_thumbnail() && $full_size_image ) {
					$attributes = array(
						'id'						=> "image", 	
						'title'                   => $image_title,
						'data-src'                => $full_size_image[0],
						'data-large_image'        => $full_size_image[0],
						'data-large_image_width'  => $full_size_image[1],
						'data-large_image_height' => $full_size_image[2],
					);
					$html  = '<div data-thumb="' . get_the_post_thumbnail_url( $post->ID, 'shop_thumbnail' ) . '" class="img-thumbnail woocommerce-product-gallery__image">
					<a data-elementor-open-lightbox="default" data-elementor-lightbox-slideshow="image-additional" href="' . esc_url( $full_size_image[0] ) . '">';
						$html .= get_the_post_thumbnail( $post->ID, 'shop_single', $attributes );
						$html .= '</a>
					</div>';
				} else {
					$html  = '<div class="woocommerce-product-gallery__image--placeholder">';
					$html .= sprintf( '<img src="%s" alt="%s" class="wp-post-image" />', esc_url( wc_placeholder_img_src() ), esc_html__( 'Awaiting product image', 'florial' ) );
					$html .= '</div>';
				} 
				echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', $html, get_post_thumbnail_id( $post->ID ) ); ?>
				<?php if($video_style == 'popup'){ florial_get_video_product(); } ?>
				<?php florial_view_product(); ?>
				<?php if( count($attachment_ids) > 1 && florial_image_single_product()->show_thumb ): ?>
					<div class="view-gallery"></div>
				<?php endif; ?>
				</div>
				<?php if($video_style == 'inner' && $video){ ?>
					<div class="video-additional text-center">
						<?php florial_display_video_product($full_size_image); ?>
					</div>
				<?php } ?>
			</div>
			<?php if(florial_image_single_product()->show_thumb && (florial_image_single_product()->position == "right" || florial_image_single_product()->position == "bottom")) : ?>
				<div class="<?php echo esc_attr(florial_image_single_product()->class_thumb); ?>">
				<?php do_action( 'woocommerce_product_thumbnails' ); ?>
				</div>
			<?php endif; ?>	
		</div>
	</figure>
</div>