<?php
/**
 * Crido Settings Options
 */
if (!class_exists('Redux_Framework_florial_settings')) {
    class Redux_Framework_florial_settings {
        public $args        = array();
        public $sections    = array();
        public $theme;
        public $ReduxFramework;
        public function __construct() {
            if (!class_exists('ReduxFramework')) {
                return;
            }
            // This is needed. Bah WordPress bugs.  ;)
            if (  true == Redux_Helpers::isTheme(__FILE__) ) {
                $this->initSettings();
            } else {
                add_action('plugins_loaded', array($this, 'initSettings'), 10);
            }
        }
        public function initSettings() {
            $this->theme = wp_get_theme();
            // Set the default arguments
            $this->setArguments();
            // Set a few help tabs so you can see how it's done
            $this->setHelpTabs();
            // Create the sections and fields
            $this->setSections();
            if (!isset($this->args['opt_name'])) { // No errors please
                return;
            }
            $this->ReduxFramework = new ReduxFramework($this->sections, $this->args);
			$custom_font = florial_get_config('custom_font',false);
			if($custom_font != 1){
				remove_action( 'wp_head', array( $this->ReduxFramework, '_output_css' ),150 );
			}
        }
        function compiler_action($options, $css, $changed_values) {
        }
        function dynamic_section($sections) {
            return $sections;
        }
        function change_arguments($args) {
            return $args;
        }
        function change_defaults($defaults) {
            return $defaults;
        }
        function remove_demo() {
        }
        public function setSections() {
			$shop_hover = florial_options_hover_style();
            $page_layouts = florial_options_layouts();
            $florial_header_type = florial_options_header_types();
            $florial_banners_effect = florial_options_banners_effect();
            // General Settings  ------------
            $this->sections[] = array(
                'icon' => 'feather-layers',
                'title' => esc_html__('General', 'florial'),
                'fields' => array(                
                )
            );  
            // Layout Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Layout', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id' => 'background_img',
                        'type' => 'media',
                        'title' => esc_html__('Background Image', 'florial'),
                        'sub_desc' => '',
                        'default' => ''
                    ),
                    array(
                        'id'=>'show-newletter',
                        'type' => 'switch',
                        'title' => esc_html__('Show Newletter Form', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id' => 'background_newletter_img',
                        'type' => 'media',
                        'title' => esc_html__('Popup Newletter Image', 'florial'),
                        'url'=> true,
                        'readonly' => false,
                        'sub_desc' => '',
                        'default' => array(
                            'url' => get_template_directory_uri() . '/images/newsletter-image.jpg'
                        )
                    ),
                    array(
						'id' => 'back_active',
						'type' => 'switch',
						'title' => esc_html__('Back to top', 'florial'),
						'sub_desc' => '',
						'desc' => '',
						'default' => '1'// 1 = on | 0 = off
					),
					array(
                        'id'=>'direction',
						'type' => 'button_set',
                        'title' => esc_html__('Direction', 'florial'),
                        'options' => array('ltr' => esc_html__('Left to Right', 'florial'),
											'rtl' => esc_html__('Right to Left', 'florial')),
						'default' => 'ltr',
                    )       
                )
            );
            // Logo & Icons Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Logo & Icons', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'sitelogo',
                        'type' => 'media',
                        'compiler'  => 'true',
                        'mode'      => false,
                        'title' => esc_html__('Logo', 'florial'),
                        'desc'      => esc_html__('Upload Logo image default here.', 'florial'),
                        'default' => array(
                            'url' => get_template_directory_uri() . '/images/logo/logo.png'
                        )
                    )
                )
            );
            // Header Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Header', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'header_style',
                        'type' => 'image_select',
                        'full_width' => true,
                        'title' => esc_html__('Header Type', 'florial'),
                        'options' => $florial_header_type,
                        'default' => '4'
                    ),
                    array(
                        'id'=>'show-header-top',
                        'type' => 'switch',
                        'title' => esc_html__('Show Header Top', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'show-searchform',
                        'type' => 'switch',
                        'title' => esc_html__('Show Search Form', 'florial'),
                        'default' => false,
                       'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'show-ajax-search',
                        'type' => 'switch',
                        'title' => esc_html__('Show Ajax Search', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'limit-ajax-search',
                        'type' => 'text',
                        'title' => esc_html__('Limit Of Result Search', 'florial'),
						'default' => 6,
						'required' => array('show-ajax-search','equals',true)
                    ),					
                    array(
                        'id'=>'search-cats',
                        'type' => 'switch',
                        'title' => esc_html__('Show Categories', 'florial'),
                        'required' => array('search-type','equals',array('post', 'product')),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'show-wishlist',
                        'type' => 'switch',
                        'title' => esc_html__('Show Wishlist', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					array(
                        'id'=>'show-campbar',
                        'type' => 'switch',
                        'title' => esc_html__('Show Campbar', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					array(
                        'id'=>'content-campbar',
                        'type' => 'text',
                        'title' => esc_html__('Content Campbar', 'florial'),
						'default' => '20% OFF EVERYTHING – USE CODE:FLASH20 – ENDS SUNDAY',
						'required' => array('show-campbar','equals',true),
                    ),
					array(
                        'id'=>'link-campbar',
                        'type' => 'text',
                        'title' => esc_html__('Url Campbar', 'florial'),
						'default' => '#',
						'required' => array('show-campbar','equals',true),
                    ),
					array(
						'id' => 'img-campbar',
						'type' => 'media',
						'title' => esc_html__('Image Campbar', 'florial'),
						'url'=> true,
						'readonly' => false,
						'required' => array('show-campbar','equals',true),
						'sub_desc' => '',
						'default' => array(
							'url' => ""
						)
					),
					 array(
                      'id' => 'color-campbar',
                      'type' => 'color',
                      'title' => esc_html__('Color Campbar', 'florial'),
                      'subtitle' => esc_html__('Select a color for Campbar.', 'florial'),
                      'default' => '#424cc7',
                      'transparent' => false,
					  'required' => array('show-campbar','equals',true),
                    ),
					array(
                        'id'=>'show-menutop',
                        'type' => 'switch',
                        'title' => esc_html__('Show Menu Top', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					array(
                        'id'=>'show-minicart',
                        'type' => 'switch',
                        'title' => esc_html__('Show Mini Cart', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					array(
                        'id'=>'cart-layout',
						'type' => 'button_set',
                        'title' => esc_html__('Cart Layout', 'florial'),
                        'options' => array('dropdown' => esc_html__('Dropdown', 'florial'),
											'popup' => esc_html__('Popup', 'florial')),
						'default' => 'dropdown',
						'required' => array('show-minicart','equals',true),
                    ),
					array(
                        'id'=>'cart-style',
						'type' => 'button_set',
                        'title' => esc_html__('Cart Style', 'florial'),
                        'options' => array('dark' => esc_html__('Dark', 'florial'),
											'light' => esc_html__('Light', 'florial')),
						'default' => 'light',
						'required' => array('show-minicart','equals',true),
                    ),
					array(
                        'id'=>'cart-free',
						'type' => 'text',
                        'title' => esc_html__('Total price free shipping', 'florial'),
						'default' => '500',
						'required' => array('show-minicart','equals',true),
                    ),
                    array(
                        'id'=>'enable-sticky-header',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Sticky Header', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					array(
                        'id'=>'address',
                        'type' => 'text',
                        'title' => esc_html__('Address', 'florial'),
                        'default' => esc_html__('Find Store', 'florial'),
                    ),
                    array(
                        'id'=>'link_address',
                        'type' => 'text',
                        'title' => esc_html__('Link Address', 'florial'),
                        'default' => '#'
                    ),
					array(
                        'id'=>'phone',
                        'type' => 'text',
                        'title' => esc_html__('Phone', 'florial'),
                        'default' => '(+1)202-333-800'
                    ),
                    array(
                        'id'=>'delivery',
                        'type' => 'text',
                        'title' => esc_html__('Delivery', 'florial'),
                        'default' => 'Yes! We are Open and Delivering - Only $12.95 Delivery to all Sydney Suburbs'
                    ),
                )
            );
            // Footer Settings
            $footers = florial_get_footers();
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Footer', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id' => 'footer_style',
                        'type' => 'image_select',
                        'title' => esc_html__('Footer Style', 'florial'),
                        'sub_desc' => esc_html__( 'Select Footer Style', 'florial' ),
                        'desc' => '',
                        'options' => $footers,
                        'default' => '32'
                    ),
                )
            );
            // Copyright Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Copyright', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id' => "footer-copyright",
                        'type' => 'textarea',
                        'title' => esc_html__('Copyright', 'florial'),
                        'default' => sprintf( wp_kses('&copy; Copyright %s. All Rights Reserved.', 'florial'), date('Y') )
                    ),
                    array(
                        'id'=>'footer-payments',
                        'type' => 'switch',
                        'title' => esc_html__('Show Payments Logos', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'footer-payments-image',
                        'type' => 'media',
                        'url'=> true,
                        'readonly' => false,
                        'title' => esc_html__('Payments Image', 'florial'),
                        'required' => array('footer-payments','equals','1'),
                        'default' => array(
                            'url' => get_template_directory_uri() . '/images/payments.png'
                        )
                    ),
                    array(
                        'id'=>'footer-payments-image-alt',
                        'type' => 'text',
                        'title' => esc_html__('Payments Image Alt', 'florial'),
                        'required' => array('footer-payments','equals','1'),
                        'default' => ''
                    ),
                    array(
                        'id'=>'footer-payments-link',
                        'type' => 'text',
                        'title' => esc_html__('Payments Link URL', 'florial'),
                        'required' => array('footer-payments','equals','1'),
                        'default' => ''
                    )
                )
            );
            // Page Title Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Page Title', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'page_title',
                        'type' => 'switch',
                        'title' => esc_html__('Show Page Title', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
					 array(
                        'id' => 'show_page_title_bg',
                        'type' => 'switch',
                        'title' => esc_html__('Show Background Breadcrumb', 'florial'),
                        'default' => false,
						'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                        'required' => array('page_title','equals', true),
                    ),
                    array(
                        'id'=>'page_title_bg',
                        'type' => 'media',
                        'url'=> true,
                        'readonly' => false,
                        'title' => esc_html__('Background', 'florial'),
                        'required' => array('show_page_title_bg','equals', true),
	                    'default' => array(
                            'url' => get_template_directory_uri() . '/images/bg-breadcrumb.jpg'
                        )							
                    ),
                    array(
                        'id' => 'breadcrumb',
                        'type' => 'switch',
                        'title' => esc_html__('Show Breadcrumb', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                        'required' => array('page_title','equals', true),
                    ),
                )
            );
            // 404 Page Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('404 Error', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'title-error',
                        'type' => 'text',
                        'title' => esc_html__('Title Page 404', 'florial'),
                        'desc' => esc_html__('Input a block slug name', 'florial'),
                        'default' => '404'
                    ),
					array(
                        'id'=>'sub-title',
                        'type' => 'textarea',
                        'title' => esc_html__('Subtitle Page 404', 'florial'),
                        'desc' => esc_html__('Input a block slug name', 'florial'),
                        'default' => "Oops! That page can't be found."
                    ), 					
                    array(
                        'id'=>'sub-error',
                        'type' => 'textarea',
                        'title' => esc_html__('Content Page 404', 'florial'),
                        'desc' => esc_html__('Input a block slug name', 'florial'),
                        'default' => "We're really sorry but we can't seem to find the page you were looking for."
                    ),               
                    array(
                        'id'=>'btn-error',
                        'type' => 'text',
                        'title' => esc_html__('Button Page 404', 'florial'),
                        'desc' => esc_html__('Input a block slug name', 'florial'),
                        'default' => 'Back The Homepage'
                    )                      
                )
            );
            // Social Share Settings
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Social Share', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'social-share',
                        'type' => 'switch',
                        'title' => esc_html__('Show Social Links', 'florial'),
                        'desc' => esc_html__('Show social links in post and product, page, portfolio, etc.', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'share-fb',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Facebook Share', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'share-tw',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Twitter Share', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'share-linkedin',
                        'type' => 'switch',
                        'title' => esc_html__('Enable LinkedIn Share', 'florial'),
                        'default' => true,
						'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'share-pinterest',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Pinterest Share', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                )
            );
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Socials Link', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'socials_link',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Socials link', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'target_social_link',
                        'type' => 'switch',
                        'title' => esc_html__('Enable Target Socials Link', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'link-fb',
                        'type' => 'text',
                        'title' => esc_html__('Enter Facebook link', 'florial'),
						'default' => '#'
                    ),
                    array(
                        'id'=>'link-tw',
                        'type' => 'text',
                        'title' => esc_html__('Enter Twitter link', 'florial'),
						'default' => '#'
                    ),
                    array(
                        'id'=>'link-linkedin',
                        'type' => 'text',
                        'title' => esc_html__('Enter LinkedIn link', 'florial'),
						'default' => '#'
                    ),
                     array(
                        'id'=>'link-dribbble',
                        'type' => 'text',
                        'title' => esc_html__('Enter Dribbble link', 'florial'),
                        'default' => '#'
                    ),
                      array(
                        'id'=>'link-behance',
                        'type' => 'text',
                        'title' => esc_html__('Enter Behance link', 'florial'),
                        'default' => '#'
                    ),
                    array(
                        'id'=>'link-youtube',
                        'type' => 'text',
                        'title' => esc_html__('Enter Youtube link', 'florial'),
						'default' => '#'
                    ),
                    array(
                        'id'=>'link-pinterest',
                        'type' => 'text',
                        'title' => esc_html__('Enter Pinterest link', 'florial'),
						'default' => '#'
                    ),
                    array(
                        'id'=>'link-instagram',
                        'type' => 'text',
                        'title' => esc_html__('Enter Instagram link', 'florial'),
						'default' => '#'
                    ),
					array(
                        'id'=>'link-tiktok',
                        'type' => 'text',
                        'title' => esc_html__('Enter Tiktok link', 'florial'),
                        'default' => ''
                    ),
                )
            );			
            //     The end -----------
            // Styling Settings  -------------
            $this->sections[] = array(
                'icon' => 'feather-feather',
                'title' => esc_html__('Styling', 'florial'),
                'fields' => array(              
                )
            );  
            // Color & Effect Settings
            $this->sections[] = array(
				'class' => 'sub-content',
                'subsection' => true,
                'title' => esc_html__('Color & Effect', 'florial'),
                'fields' => array(
                    array(
                        'id'=>'compile-css',
                        'type' => 'switch',
                        'title' => esc_html__('Compile Css', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),					
                    array(
                      'id' => 'main_theme_color',
                      'type' => 'color',
                      'title' => esc_html__('Main Theme Color', 'florial'),
                      'subtitle' => esc_html__('Select a main color for your site.', 'florial'),
                      'default' => '#222222',
                      'transparent' => false,
					  'required' => array('compile-css','equals',array(true)),
                    ),      
                    array(
                        'id'=>'show-loading-overlay',
                        'type' => 'switch',
                        'title' => esc_html__('Loading Overlay', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'banners_effect',
                        'type' => 'image_select',
                        'full_width' => true,
                        'title' => esc_html__('Banner Effect', 'florial'),
                        'options' => $florial_banners_effect,
                        'default' => 'banners-effect-1'
                    )                   
                )
            );
            // Typography Settings
            $this->sections[] = array(
                'subsection' => true,
				'class' => 'sub-content',
                'title' => esc_html__('Typography', 'florial'),
                'fields' => array(
                    array(
                        'id'=>'custom_font',
                        'type' => 'switch',
                        'title' => esc_html__('Custom Font', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),				
                    array(
                        'id'=>'select-google-charset',
                        'type' => 'switch',
                        'title' => esc_html__('Select Google Font Character Sets', 'florial'),
                        'default' => false,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
						'required' => array('custom_font','equals',true),
                    ),
                    array(
                        'id'=>'google-charsets',
                        'type' => 'button_set',
                        'title' => esc_html__('Google Font Character Sets', 'florial'),
                        'multi' => true,
                        'required' => array('select-google-charset','equals',true),
                        'options'=> array(
                            'cyrillic' => 'Cyrrilic',
                            'cyrillic-ext' => 'Cyrrilic Extended',
                            'greek' => 'Greek',
                            'greek-ext' => 'Greek Extended',
                            'khmer' => 'Khmer',
                            'latin' => 'Latin',
                            'latin-ext' => 'Latin Extneded',
                            'vietnamese' => 'Vietnamese'
                        ),
                        'default' => array('latin','greek-ext','cyrillic','latin-ext','greek','cyrillic-ext','vietnamese','khmer')
                    ),
                    array(
                        'id'=>'family_font_body',
                        'type' => 'typography',
                        'title' => esc_html__('Body Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
						'output'      => array('body'),
                        'color' => false,
                        'default'=> array(
                            'color'=>"#777777",
                            'google'=>true,
                            'font-weight'=>'400',
                            'font-family'=>'Open Sans',
                            'font-size'=>'14px',
                            'line-height' => '22px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h1-font',
                        'type' => 'typography',
                        'title' => esc_html__('H1 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' 	=> false,
						'output'      => array('body h1'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'400',
                            'font-family'=>'Open Sans',
                            'font-size'=>'36px',
                            'line-height' => '44px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h2-font',
                        'type' => 'typography',
                        'title' => esc_html__('H2 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' => false,
						'output'      => array('body h2'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'300',
                            'font-family'=>'Open Sans',
                            'font-size'=>'30px',
                            'line-height' => '40px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h3-font',
                        'type' => 'typography',
                        'title' => esc_html__('H3 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' => false,
						'output'      => array('body h3'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'400',
                            'font-family'=>'Open Sans',
                            'font-size'=>'25px',
                            'line-height' => '32px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h4-font',
                        'type' => 'typography',
                        'title' => esc_html__('H4 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' => false,
						'output'      => array('body h4'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'400',
                            'font-family'=>'Open Sans',
                            'font-size'=>'20px',
                            'line-height' => '27px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h5-font',
                        'type' => 'typography',
                        'title' => esc_html__('H5 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' => false,
						'output'      => array('body h5'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'600',
                            'font-family'=>'Open Sans',
                            'font-size'=>'14px',
                            'line-height' => '18px'
                        ),
						'required' => array('custom_font','equals',true)
                    ),
                    array(
                        'id'=>'h6-font',
                        'type' => 'typography',
                        'title' => esc_html__('H6 Font', 'florial'),
                        'google' => true,
                        'subsets' => false,
                        'font-style' => false,
                        'text-align' => false,
                        'color' => false,
						'output'      => array('body h6'),
                        'default'=> array(
                            'color'=>"#1d2127",
                            'google'=>true,
                            'font-weight'=>'400',
                            'font-family'=>'Open Sans',
                            'font-size'=>'14px',
                            'line-height' => '18px'
                        ),
						'required' => array('custom_font','equals',true)
                    )
                )
            );
            //     The end -----------          
            if ( class_exists( 'Woocommerce' ) ) :
                $this->sections[] = array(
                    'icon' => 'feather-shopping-bag',
                    'title' => esc_html__('Ecommerce', 'florial'),
                    'fields' => array(              
                    )
                );
                $this->sections[] = array(
                    'subsection' => true,
                    'title' => esc_html__('Product Archives', 'florial'),
					'class' => 'sub-content',
                    'fields' => array(
						array(
                            'id'=>'category_style',
                            'type' => 'button_set',
							'class' => 'button_layout_shop',
                            'title' => esc_html__('Layout Shop Page', 'florial'),
							'options' => array(
								'sidebar' => esc_html__('Sidebar', 'florial'),
								'filter_ontop' => esc_html__('Filter On Top', 'florial'),
								'filter_dropdown' => esc_html__('Filter Dropdown', 'florial'),
								'filter_sideout' => esc_html__('Filter Side Out', 'florial'),
								'filter_drawer' => esc_html__('Filter Drawer', 'florial'),
								'only_categories' => esc_html__('Shop Only Categories', 'florial'),
								),
                           'default' => 'sidebar',
                        ),
						array(
                            'id'=>'shop-layout',
                            'type' => 'button_set',
                            'title' => esc_html__('Shop Layout', 'florial'),
							'options' => array(
								'full' => esc_html__('Full', 'florial'),
								'boxed' => esc_html__('Boxed', 'florial'),
								),
                            'default' => 'boxed',
                        ),
						array(
                            'id'=>'shop_paging',
							'title' => esc_html__('Shop Paging', 'florial'),
                            'type' => 'button_set',
							'options' => array(
								'shop-pagination' => esc_html__('Pagination', 'florial'),
								'shop-infinity' => esc_html__('Infinity', 'florial'),
								'shop-loadmore' => esc_html__('Load More', 'florial'),
								),
                             'default' => 'shop-pagination',
                        ),
						array(
                            'id'=>'show-subcategories',
                            'type' => 'button_set',
                            'title' => esc_html__('Show Sub Categories', 'florial'),
							'class' => 'button_swith',
							'options' => array(
								'show' => esc_html__('on', 'florial'),
								'hide' => esc_html__('off', 'florial'),
								),
                            'default' => 'show',
                        ),
						array(
                            'id'=>'style-subcategories',
							'title' => esc_html__('Style Sub Categories', 'florial'),
							'type' => 'button_set',
							'options' => array(
								'shop_mini_categories' => esc_html__('Mini Categories', 'florial'),
								'icon_categories' => esc_html__('Icon Categories', 'florial'),
								'image_categories' => esc_html__('Image Categories', 'florial'),
                             ),
                            'default' => 'mini',
							'required' => array('show-subcategories','equals','show'),
                        ),
						array(
                            'id' => 'sub_col_large',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Sub Categories column Desktop', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4',  
									'5' => '5',
                                    '6' => '6'                          
                                ),
                            'default' => '4',
							'required' => array('show-subcategories','equals','show'),
                            'sub_desc' => esc_html__( 'Select number of column on Desktop Screen', 'florial' ),
                        ),
                        array(
                            'id' => 'sub_col_medium',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Sub Categories column Medium Desktop', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4',  
									'5' => '5',
                                    '6' => '6'                          
                                ),
                            'default' => '3',
							'required' => array('show-subcategories','equals','show'),
                            'sub_desc' => esc_html__( 'Select number of column on Medium Desktop Screen', 'florial' ),
                        ),
                        array(
                            'id' => 'sub_col_sm',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Sub Categories column Ipad Screen', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4',  
									'5' => '5',
                                    '6' => '6'                          
                                ),
                            'default' => '3',
							'required' => array('show-subcategories','equals','show'),
                            'sub_desc' => esc_html__( 'Select number of column on Ipad Screen', 'florial' ),
                        ),
						 array(
                            'id' => 'sub_col_xs',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Sub Categories column Mobile Screen', 'florial'),
                            'options' => array(
                                    '1' => '1',
									'2' => '2',
                                    '3' => '3',
                                    '4' => '4',  
									'5' => '5'         
                                ),
                            'default' => '1',
							'required' => array('show-subcategories','equals','show'),
                            'sub_desc' => esc_html__( 'Select number of column on Mobile Screen', 'florial' ),
                        ),
						array(
                            'id'=>'layout_shop',
							'title' => esc_html__('Shop Hover Style', 'florial'),
                            'type' => 'image_select',
							'class' => 'img_option',
							'options' => $shop_hover,
                            'default' => '1',
                        ),						
                        array(
                            'id'=>'category-view-mode',
                            'type' => 'button_set',
							'class' => 'style_listgrid',
                            'title' => esc_html__('View Mode', 'florial'),
                            'options' => florial_ct_category_view_mode(),
                            'default' => 'grid',
                        ),
                        array(
                            'id' => 'product_col_large',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Product Listing column Desktop', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4'                        
                                ),
                            'default' => '4',
							'required' => array('category-view-mode','equals','grid'),
                            'sub_desc' => esc_html__( 'Select number of column on Desktop Screen', 'florial' ),
                        ),
                        array(
                            'id' => 'product_col_medium',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Product Listing column Medium Desktop', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4'                          
                                ),
                            'default' => '3',
							'required' => array('category-view-mode','equals','grid'),
                            'sub_desc' => esc_html__( 'Select number of column on Medium Desktop Screen', 'florial' ),
                        ),
                        array(
                            'id' => 'product_col_sm',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Product Listing column Ipad Screen', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4'                          
                                ),
                            'default' => '3',
							'required' => array('category-view-mode','equals','grid'),
                            'sub_desc' => esc_html__( 'Select number of column on Ipad Screen', 'florial' ),
                        ),
						array(
                            'id' => 'product_col_xs',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Product Listing column Mobile Screen', 'florial'),
                            'options' => array(
									'1' => '1',
                                    '2' => '2',
                                    '3' => '3'                        
                                ),
                            'default' => '2',
							'required' => array('category-view-mode','equals','grid'),
                            'sub_desc' => esc_html__( 'Select number of column on Mobile Screen', 'florial' ),
                        ),
                        array(
                            'id'=>'woo-show-rating',
                            'type' => 'switch',
                            'title' => esc_html__('Show Rating in Woocommerce Products Widget', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),						
						array(
                            'id'=>'show-category',
                            'type' => 'switch',
                            'title' => esc_html__('Show Category', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id' => 'product_count',
                            'type' => 'text',
                            'title' => esc_html__('Shop pages show at product', 'florial'),
                            'default' => '12',
                            'sub_desc' => esc_html__( 'Type Count Product Per Shop Page', 'florial' ),
                        ),						
                        array(
                            'id'=>'category-image-hover',
                            'type' => 'switch',
                            'title' => esc_html__('Enable Image Hover Effect', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'category-hover',
                            'type' => 'switch',
                            'title' => esc_html__('Enable Hover Effect', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'product-wishlist',
                            'type' => 'switch',
                            'title' => esc_html__('Show Wishlist', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
							'id'=>'product-compare',
							'type' => 'switch',
							'title' => esc_html__('Show Compare', 'florial'),
							'default' => false,
							'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
						),						
                        array(
                            'id'=>'product_quickview',
                            'type' => 'switch',
                            'title' => esc_html__('Show Quick View', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'product-quickview-label',
                            'type' => 'text',
                            'required' => array('product-quickview','equals',true),
                            'title' => esc_html__('"Quick View" Text', 'florial'),
                            'default' => ''
                        ),
						array(
                            'id'=>'product-countdown',
                            'type' => 'switch',
                            'title' => esc_html__('Show Product Countdown', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'product-attribute',
                            'type' => 'switch',
                            'title' => esc_html__('Show Product Attribute', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'checkout_page_style',
                            'title' => esc_html__('Checkout Page Style', 'florial'),
                            'type' => 'image_select',
							'class' => 'img_option',
                            'options' => array(
									"checkout-page-style-1" => array('alt' => esc_html__("Style 1", 'florial'), 'img' => get_template_directory_uri().'/inc/admin/theme_options/layouts/checkout_1.jpg'),
                                    "checkout-page-style-2" => array('alt' => esc_html__("Style 2", 'florial'), 'img' => get_template_directory_uri().'/inc/admin/theme_options/layouts/checkout_2.jpg'),                        
                                ),
                            'default' => 'checkout-page-style-1',
                        ),
                    )
                );
                $this->sections[] = array(
                    'subsection' => true,
                    'title' => esc_html__('Single Product', 'florial'),
					'class' => 'sub-content',
                    'fields' => array(
                        array(
                            'id'=>'product-stock',
                            'type' => 'switch',
                            'title' => esc_html__('Show "Out of stock" Status', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'show-sticky-cart',
                            'type' => 'switch',
                            'title' => esc_html__('Show Sticky Cart Product', 'florial'),
                            'default' => false,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),						
						array(
                            'id'=>'show-countdown',
                            'type' => 'switch',
                            'title' => esc_html__('Show CountDown', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'show-quick-buy',
                            'type' => 'switch',
                            'title' => esc_html__('Show Button Buy Now', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'product-short-desc',
                            'type' => 'switch',
                            'title' => esc_html__('Show Short Description', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
							'id' => 'length-product-short-desc',
							'type' => 'text',
							'title' => esc_html__('Length Short Description Quickview', 'florial'),
							'required' => array('product-short-desc','equals',true),
							'default' =>'25',
						),					
                        array(
                            'id'=>'product-related',
                            'type' => 'switch',
                            'title' => esc_html__('Show Related Product', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'product-related-count',
                            'type' => 'text',
                            'required' => array('product-related','equals',true),
                            'title' => esc_html__('Related Product Count', 'florial'),
                            'default' => '10'
                        ),
                        array(
                            'id'=>'product-related-cols',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'required' => array('product-related','equals',true),
                            'title' => esc_html__('Related Product Columns', 'florial'),
                            'options' => florial_ct_related_product_columns(),
                            'default' => '4',
                        ),
                        array(
                            'id'=>'product-upsell',
                            'type' => 'switch',
                            'title' => esc_html__('Show Upsell Products', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),                      
                        array(
                            'id'=>'product-upsell-count',
                            'type' => 'text',
                            'required' => array('product-upsell','equals',true),
                            'title' => esc_html__('Upsell Products Count', 'florial'),
                            'default' => '10'
                        ),
                        array(
                            'id'=>'product-upsell-cols',
                            'type' => 'button_set',
                            'required' => array('product-upsell','equals',true),
							'class' => 'select_col',
                            'title' => esc_html__('Upsell Product Columns', 'florial'),
                            'options' => florial_ct_related_product_columns(),
                            'default' => '3',
                        ),
                        array(
                            'id'=>'product-crosssells',
                            'type' => 'switch',
                            'title' => esc_html__('Show Crooss Sells Products', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),                      
                        array(
                            'id'=>'product-crosssells-count',
                            'type' => 'text',
                            'required' => array('product-crosssells','equals',true),
                            'title' => esc_html__('Crooss Sells Products Count', 'florial'),
                            'default' => '10'
                        ),
                        array(
                            'id'=>'product-crosssells-cols',
                            'type' => 'button_set',
                            'required' => array('product-crosssells','equals',true),
							'class' => 'select_col',
                            'title' => esc_html__('Crooss Sells Product Columns', 'florial'),
                            'options' => florial_ct_related_product_columns(),
                            'default' => '3',
                        ),						
                        array(
                            'id'=>'product-hot',
                            'type' => 'switch',
                            'title' => esc_html__('Show "Hot" Label', 'florial'),
                            'desc' => esc_html__('Will be show in the featured product.', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                        array(
                            'id'=>'product-hot-label',
                            'type' => 'text',
                            'required' => array('product-hot','equals',true),
                            'title' => esc_html__('"Hot" Text', 'florial'),
                            'default' => ''
                        ),
                        array(
                            'id'=>'product-sale',
                            'type' => 'switch',
                            'title' => esc_html__('Show "Sale" Label', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
                         array(
                            'id'=>'product-sale-percent',
                            'type' => 'switch',
                            'required' => array('product-sale','equals',true),
                            'title' => esc_html__('Show Sale Price Percentage', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),  
                        array(
                            'id'=>'product-share',
                            'type' => 'switch',
                            'title' => esc_html__('Show Social Share Links', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'prevnext-single',
                            'type' => 'switch',
                            'title' => esc_html__('Show Prev-Next', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'size-guide',
                            'type' => 'switch',
                            'title' => esc_html__('Show Size Guide', 'florial'),
                            'default' => false,
							'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
							'id' => 'img-size-guide',
							'type' => 'media',
							'title' => esc_html__('Image Size Guide', 'florial'),
							'url'=> true,
							'readonly' => false,
							'required' => array('size-guide','equals',true),
							'sub_desc' => '',
							'default' => array(
								'url' => ""
							)
						),
						array(
							'id'=>'description-style',
							'type' => 'button_set',
							'title' => esc_html__('Description Style', 'florial'),
							'options' => array(
										'accordion' => esc_html__('Accordion', 'florial'),
										'full-content' => esc_html__('Full Content', 'florial'),
										'tab' => esc_html__('Tab', 'florial'),
										'vertical' => esc_html__('Vertical', 'florial'),
										),
							'default' => 'tab',
						),
                    )
                );
                $this->sections[] = array(
                    'subsection' => true,
                    'title' => esc_html__('Image Product', 'florial'),
					'class' => 'sub-content',
                    'fields' => array(
                        array(
                            'id'=>'product-thumbs',
                            'type' => 'switch',
                            'title' => esc_html__('Show Thumbnails', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
                            'id'=>'layout-thumbs',
                            'type' => 'button_set',
                            'title' => esc_html__('Layouts Product', 'florial'),
                            'options' => array('zoom' => esc_html__('Zoom', 'florial'),
												'scroll' => esc_html__('Scroll', 'florial'),
												'one_column' => esc_html__('One Column', 'florial'),
												'slider' => esc_html__('Slider', 'florial'),
												'grid' => esc_html__('Grid', 'florial'),
												'lagre_gallery' => esc_html__('Lagre Gallery', 'florial'),
												'clean' => esc_html__('Clean', 'florial'),
												'moderm' => esc_html__('Moderm', 'florial'),
												'full_width' => esc_html__('Full Width', 'florial'),
											),	
                            'default' => 'zoom',
                        ),
                        array(
                            'id'=>'position-thumbs',
                            'type' => 'button_set',
                            'title' => esc_html__('Position Thumbnails', 'florial'),
                            'options' => array('left' => esc_html__('Left', 'florial'),
												'right' => esc_html__('Right', 'florial'),
												'bottom' => esc_html__('Bottom', 'florial'),
												'outsite' => esc_html__('Outsite', 'florial')),
                            'default' => 'bottom',
							'required' => array('product-thumbs','equals',true),
                        ),						
                        array(
                            'id' => 'product-thumbs-count',
                            'type' => 'button_set',
							'class' => 'select_col',
                            'title' => esc_html__('Thumbnails Count', 'florial'),
                            'options' => array(
                                    '2' => '2',
                                    '3' => '3',
                                    '4' => '4', 
									'5' => '5', 									
                                    '6' => '6'                          
                                ),
							'default' => '4',
							'required' => array('product-thumbs','equals',true),
                        ),
						array(
                            'id' => 'video-style',
                            'type' => 'button_set',
                            'title' => esc_html__('Video Style', 'florial'),
                            'options' => array(
                                    'popup' => 'Popup',
                                    'inner' => 'Inner',                          
                                ),
							'default' => 'inner',
                        ),
						array(
                            'id'=>'single_background',
                            'type' => 'switch',
                            'title' => esc_html__('Show Background Product Image', 'florial'),
                            'default' => false,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
                        ),
						array(
						  'id' => 'single_background_color',
						  'type' => 'button_set',
						  'title' => esc_html__('Background Single Color', 'florial'),
						  'options' => array(
										'dark' => esc_html__('Dark', 'florial'),
										'light' => esc_html__('Light', 'florial')),
						  'default' => 'light',
						  'required' => array('single_background','equals',array(true)),
						),
						array(
                            'id'=>'zoom-type',
                            'type' => 'button_set',
                            'title' => esc_html__('Zoom Type', 'florial'),
                            'options' => array(
									'inner' => esc_html__('Inner', 'florial'),
									'window' => esc_html__('Window', 'florial'),
									'lens' => esc_html__('Lens', 'florial')
									),
                            'default' => 'inner',
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-scroll',
                            'type' => 'switch',
                            'title' => esc_html__('Scroll Zoom', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-border',
                            'type' => 'text',
                            'title' => esc_html__('Border Size', 'florial'),
                            'default' => '2',
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-border-color',
                            'type' => 'color',
                            'title' => esc_html__('Border Color', 'florial'),
                            'default' => '#f9b61e',
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),                      
                        array(
                            'id'=>'zoom-lens-size',
                            'type' => 'text',
                            'required' => array('zoom-type','equals',array('lens')),
                            'title' => esc_html__('Lens Size', 'florial'),
                            'default' => '200',
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-lens-shape',
                            'type' => 'button_set',
                            'required' => array('zoom-type','equals',array('lens')),
                            'title' => esc_html__('Lens Shape', 'florial'),
                            'options' => array('round' => esc_html__('Round', 'florial'), 'square' => esc_html__('Square', 'florial')),
                            'default' => 'square',
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-contain-lens',
                            'type' => 'switch',
                            'required' => array('zoom-type','equals',array('lens')),
                            'title' => esc_html__('Contain Lens Zoom', 'florial'),
                            'default' => true,
                            'on' => esc_html__('on', 'florial'),
                            'off' => esc_html__('off', 'florial'),
							'required' => array('layout-thumbs','equals',"zoom"),
                        ),
                        array(
                            'id'=>'zoom-lens-border',
                            'type' => 'text',
                            'required' => array('zoom-type','equals',array('lens')),
                            'title' => esc_html__('Lens Border', 'florial'),
                            'default' => true,
							'required' => array('layout-thumbs','equals',"zoom")
                        ),
                    )
                );
            endif;
            // Blog Settings  -------------
            $this->sections[] = array(
                'icon' => 'feather-file-text',
                'title' => esc_html__('Blog', 'florial'),
                'fields' => array(              
                )
            );      
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Blog & Post Archives', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'post-format',
                        'type' => 'switch',
                        'title' => esc_html__('Show Post Format', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'hot-label',
                        'type' => 'text',
                        'title' => esc_html__('"HOT" Text', 'florial'),
                        'desc' => esc_html__('Hot post label', 'florial'),
                        'default' => ''
                    ),
                    array(
                        'id'=>'sidebar_blog',
                        'type' => 'image_select',
						'class' => 'img_option',
                        'title' => esc_html__('Page Layout', 'florial'),
                        'options' => $page_layouts,
                        'default' => 'left'
                    ),
                    array(
                        'id' => 'layout_blog',
                        'type' => 'button_set',
                        'title' => esc_html__('Layout Blog', 'florial'),
                        'options' => array(
                                'list'  =>  esc_html__( 'List', 'florial' ),
                                'grid' =>  esc_html__( 'Grid', 'florial' ),
								'modern' =>  esc_html__( 'Modern', 'florial' ),
								'standar' =>  esc_html__( 'Standar', 'florial' )
                        ),
                        'default' => 'standar',
                        'sub_desc' => esc_html__( 'Select style layout blog', 'florial' ),
                    ),
                    array(
                        'id' => 'blog_col_large',
                        'type' => 'button_set',
						'class' => 'select_col',
                        'title' => esc_html__('Blog Listing column Desktop', 'florial'),
                        'required' => array('layout_blog','equals','grid'),
                        'options' => array(
                                '2' => '2',
                                '3' => '3',
                                '4' => '4',                         
                                '6' => '6'                          
                            ),
                        'default' => '4',
                        'sub_desc' => esc_html__( 'Select number of column on Desktop Screen', 'florial' ),
                    ),
                    array(
                        'id' => 'blog_col_medium',
                        'type' => 'button_set',
						'class' => 'select_col',
                        'title' => esc_html__('Blog Listing column Medium Desktop', 'florial'),
                        'required' => array('layout_blog','equals','grid'),
                        'options' => array(
                                '2' => '2',
                                '3' => '3',
                                '4' => '4',                         
                                '6' => '6'                          
                            ),
                        'default' => '3',
                        'sub_desc' => esc_html__( 'Select number of column on Medium Desktop Screen', 'florial' ),
                    ),   
                    array(
                        'id' => 'blog_col_sm',
                        'type' => 'button_set',
						'class' => 'select_col',
                        'title' => esc_html__('Blog Listing column Ipad Screen', 'florial'),
                        'required' => array('layout_blog','equals','grid'),
                        'options' => array(
                                '2' => '2',
                                '3' => '3',
                                '4' => '4',                         
                                '6' => '6'                          
                            ),
                        'default' => '3',
                        'sub_desc' => esc_html__( 'Select number of column on Ipad Screen', 'florial' ),
                    ),   					
                    array(
                        'id'=>'archives-author',
                        'type' => 'switch',
                        'title' => esc_html__('Show Author', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'archives-comments',
                        'type' => 'switch',
                        'title' => esc_html__('Show Count Comments', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),                  
                    array(
                        'id'=>'blog-excerpt',
                        'type' => 'switch',
                        'title' => esc_html__('Show Excerpt', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'list-blog-excerpt-length',
                        'type' => 'text',
                        'required' => array('blog-excerpt','equals',true),
                        'title' => esc_html__('List Excerpt Length', 'florial'),
                        'desc' => esc_html__('The number of words', 'florial'),
                        'default' => '50',
                    ),
                    array(
                        'id'=>'grid-blog-excerpt-length',
                        'type' => 'text',
                        'required' => array('blog-excerpt','equals',true),
                        'title' => esc_html__('Grid Excerpt Length', 'florial'),
                        'desc' => esc_html__('The number of words', 'florial'),
                        'default' => '12',
                    ),                  
                )
            );
            $this->sections[] = array(
                'subsection' => true,
                'title' => esc_html__('Single Post', 'florial'),
				'class' => 'sub-content',
                'fields' => array(
                    array(
                        'id'=>'post-single-layout',
                        'type' => 'button_set',
                        'title' => esc_html__('Page Layout', 'florial'),
                        'options' => array(
								'sidebar' =>  esc_html__( 'Sidebar', 'florial' ),
                                'one_column' =>  esc_html__( 'One Column', 'florial' ),
								'prallax_image' =>  esc_html__( 'Prallax Image', 'florial' ),
								'simple_title' =>  esc_html__( 'Simple Title', 'florial' ),
								'sticky_title' =>  esc_html__( 'Sticky Title', 'florial' )
                        ),
                        'default' => 'sidebar'
                    ),
                    array(
                        'id'=>'post-title',
                        'type' => 'switch',
                        'title' => esc_html__('Show Title', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'post-author',
                        'type' => 'switch',
                        'title' => esc_html__('Show Author Info', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
                    ),
                    array(
                        'id'=>'post-comments',
                        'type' => 'switch',
                        'title' => esc_html__('Show Comments', 'florial'),
                        'default' => true,
                        'on' => esc_html__('on', 'florial'),
                        'off' => esc_html__('off', 'florial'),
					)
				)
			);	
            $this->sections[] = array(
				'id' => 'wbc_importer_section',
				'class' => 'info_import',
				'title'  => esc_html__( 'Demo Importer', 'florial' ),
				'icon'   => 'feather-upload',
				'fields' => array(
					array(
						'desc'   => wp_kses( 'Increase your max execution time, try 600 I know its high but trust me.<br>
						Increase your PHP memory limit, try 512MB.<br>
						1. The import process will work best on a clean install. You can use a plugin such as WordPress Reset to clear your data for you.<br>
						2. Ensure all plugins are installed beforehand, e.g. WooCommerce - any plugins that you add content to.<br>
						3. Be patient and wait for the import process to complete. It can take up to 3-5 minutes.<br>
						4. Enjoy','social' ),
						'id'   => 'wbc_demo_importer',
						'type' => 'wbc_importer'
					)
				)
            );			
        }
        public function setHelpTabs() {
        }
        public function setArguments() {
            $theme = wp_get_theme(); // For use with some settings. Not necessary.
            $this->args = array(
                'opt_name'          => 'florial_settings',
                'display_name'      => $theme->get('Name') . ' ' . wp_kses('<br>Theme Options', 'social'),
                'display_version'   => esc_html__('Theme Version: ', 'florial') . florial_version,
                'menu_type'         => 'submenu',
                'allow_sub_menu'    => true,
                'menu_title'        => esc_html__('Theme Options', 'florial'),
                'page_title'        => esc_html__('Theme Options', 'florial'),
                'footer_credit'     => esc_html__('Theme Options', 'florial'),
                'google_api_key' => 'AIzaSyAX_2L_UzCDPEnAHTG7zhESRVpMPS4ssII',
                'disable_google_fonts_link' => true,
                'async_typography'  => false,
                'admin_bar'         => false,
                'admin_bar_icon'       => 'dashicons-admin-generic',
                'admin_bar_priority'   => 50,
                'global_variable'   => '',
                'dev_mode'          => false,
                'customizer'        => false,
                'compiler'          => false,
                'page_priority'     => null,
                'page_parent'       => 'themes.php',
                'page_permissions'  => 'manage_options',
                'menu_icon'         => '',
                'last_tab'          => '',
                'page_icon'         => 'icon-themes',
                'page_slug'         => 'florial_settings',
                'save_defaults'     => true,
                'default_show'      => false,
                'default_mark'      => '',
                'show_import_export' => true,
                'show_options_object' => false,
                'transient_time'    => 60 * MINUTE_IN_SECONDS,
                'output'            => true,
                'output_tag'        => true,
                'database'              => '',
                'system_info'           => false,
                'hints' => array(
                    'icon'          => 'icon-question-sign',
                    'icon_position' => 'right',
                    'icon_color'    => 'lightgray',
                    'icon_size'     => 'normal',
                    'tip_style'     => array(
                        'color'         => 'light',
                        'shadow'        => true,
                        'rounded'       => false,
                        'style'         => '',
                    ),
                    'tip_position'  => array(
                        'my' => 'top left',
                        'at' => 'bottom right',
                    ),
                    'tip_effect'    => array(
                        'show'          => array(
                            'effect'        => 'slide',
                            'duration'      => '500',
                            'event'         => 'mouseover',
                        ),
                        'hide'      => array(
                            'effect'    => 'slide',
                            'duration'  => '500',
                            'event'     => 'click mouseleave',
                        ),
                    ),
                ),
                'ajax_save'                 => true,
                'use_cdn'                   => true,
            );
            // Panel Intro text -> before the form
            if (!isset($this->args['global_variable']) || $this->args['global_variable'] !== false) {
                if (!empty($this->args['global_variable'])) {
                    $v = $this->args['global_variable'];
                } else {
                    $v = str_replace('-', '_', $this->args['opt_name']);
                }
            }
            $this->args['intro_text'] = sprintf('<p>'.wp_kses('Please regenerate again default css files in <strong>Skin > Compile Default CSS</strong> after <strong>update theme</strong>.', 'florial').'</p>', $v);
        }           
    }
	if ( !function_exists( 'wbc_extended_example' ) ) {
		function wbc_extended_example( $demo_active_import , $demo_directory_path ) {
			reset( $demo_active_import );
			$current_key = key( $demo_active_import );	
			if ( isset( $demo_active_import[$current_key]['directory'] ) && !empty( $demo_active_import[$current_key]['directory'] )) {		
				// Import Template Kit
				if ( class_exists( '\Elementor\Plugin' ) ) {
					$import_settings = [];
					$import_settings['referrer'] = "kit-library";
					$zip_path = $demo_directory_path."elementor-kit.zip";
					$import_export_module = \Elementor\Plugin::$instance->app->get_component( 'import-export' );
					$import = $import_export_module->import_kit( $zip_path, $import_settings );
				}
				// Replace URL
				if ( class_exists( '\Elementor\Utils' ) ) {
					\Elementor\Utils::replace_urls( url_demo, site_url() );
				}
				// Setting Menus
				$primary = get_term_by( 'name', 'Main menu', 'nav_menu' );
				$primary_topbar   = get_term_by( 'name', 'Menu Topbar', 'nav_menu' );
				$primary_vertical   = get_term_by( 'name', 'Vertical Menu', 'nav_menu' );
				if ( isset( $primary->term_id ) && isset( $primary_topbar->term_id ) && isset( $primary_vertical->term_id ) ) {
					set_theme_mod( 'nav_menu_locations', array(
							'main_navigation' => $primary->term_id,
							'topbar_menu' => $primary_topbar->term_id,
							'vertical_menu' => $primary_vertical->term_id
						)
					);
				}
				// Set HomePage
				$home_page = 'Home Clean';
				$page = get_page_by_title( $home_page );
				if ( isset( $page->ID ) ) {
					update_option( 'page_on_front', $page->ID );
					update_option( 'show_on_front', 'page' );
				}					
			}
		}
		// Uncomment the below
		add_action( 'wbc_importer_after_content_import', 'wbc_extended_example', 10, 2 );
	}
    global $reduxflorialSettings;
    $reduxflorialSettings = new Redux_Framework_florial_settings();
}