<?php 
	get_header(); 
	$florial_settings = florial_global_settings();
?>
<div class="page-404">
	<div class="content-page-404">
		<div class="title-error">
			<?php if(isset($florial_settings['title-error']) && $florial_settings['title-error']){
				echo esc_html($florial_settings['title-error']);
			}else{
				echo esc_html__("404", "florial");
			}?>
		</div>
		<div class="sub-title">
			<?php if(isset($florial_settings['sub-title']) && $florial_settings['sub-title']){
				echo esc_html($florial_settings['sub-title']);
			}else{
				echo esc_html__("Oops! That page can't be found.", "florial");
			}?>
		</div>
		<div class="sub-error">
			<?php if(isset($florial_settings['sub-error']) && $florial_settings['sub-error']){
				echo esc_html($florial_settings['sub-error']);
			}else{
				echo esc_html__("We're really sorry but we can't seem to find the page you were looking for.", "florial");
			}?>
		</div>
		<a class="btn" href="<?php echo esc_url( home_url('/') ); ?>">
			<?php if(isset($florial_settings['btn-error']) && $florial_settings['btn-error']){
				echo esc_html($florial_settings['btn-error']);}
			else{
				echo esc_html__("Back The Homepage", "florial");
			}?>
		</a>
	</div>
</div>
<?php
get_footer();