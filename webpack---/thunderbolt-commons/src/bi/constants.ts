/**
 A LIST CONTAIN THE EVENTS THAT WILL NOT BE MUTED
 */
export const ThunderboltMutingBlackList: Set<string> = new Set([
	'page-navigation',
	'page_features_loaded',
	'byoc-load-css',
	'byoc-load-component-retry',
	'byoc-load-component',
	'multilingual_init',
	'partially_visible',
	'widget_will_load',
	'script_loaded',
	'init_app_for_page',
	'create_controllers',
	'controller_page_ready',
	'await_controller_promise',
	'controller_script_loaded',
	'platform_error',
	'translationCorruption',
	'execute-fallback-thunderbolt-css',
	'execute-fallback-thunderbolt-platform',
	'execute-fallback-thunderbolt-features',
	'execute-fallback-thunderbolt-site-map',
	'execute-fallback-thunderbolt-byref',
	'platform_execute-fallback-thunderbolt-css',
	'platform_execute-fallback-thunderbolt-platform',
	'platform_execute-fallback-thunderbolt-features',
	'platform_execute-fallback-thunderbolt-site-map',
	'platform_execute-fallback-thunderbolt-byref',
	'react_render_error',
	'react_18',
	'components-under-fold',
	'partialRouteMatching',
	'app_instance_error',
])
/**
 A LIST CONTAIN THE EVENTS THAT WILL ALWAYS BE MUTED
 */
export const ThunderboltMutingWhiteList: Set<string> = new Set([
	// 'page_features_loaded', FOR EXAMPLE
])

export const AppsMutingWhiteList: Set<string> = new Set([
	'1380b703-ce81-ff05-f115-39571d94dfcd', // ECOM
])

export const FEDOPS_WHITE_LIST: Set<string> = new Set([
	'component_loader',
	'init_page',
	'main_loading',
	'load_environment',
	'load_renderer',
	'tb_client',
	'client_render',
	'dom_ready',
	'render_body',
	'script_loaded',
	'init_app_for_page',
	'create_controllers',
	'controller_page_ready',
	'await_controller_promise',
	'router_navigate',
	'structureAPI_addShellStructure',
	'features_appWillMount',
	'loadSiteFeatures_renderFeaturesOnly',
	'loadMasterPageFeaturesConfigs',
	'loadDynamicModel',
	'loadSiteFeatures',
	'container_get_phase',
	'thunderbolt_ready',
	'partially_visible',
	'hidden',
	'createComponentsRegistryCSR',
	'structureAPI_addShellStructure',
	'runThunderbolt-client',
	'browser_not_supported',
	'fetch_model',
	'load_main_assets',
	'page_features_loaded',
	'multilingual_init',
	'platform',
	'platform_initialisation',
	'platform_runApplications',
	'translationCorruption',
	'components-under-fold',
	'execute-fallback-thunderbolt-css',
	'execute-fallback-thunderbolt-platform',
	'execute-fallback-thunderbolt-features',
	'execute-fallback-thunderbolt-site-map',
	'execute-fallback-thunderbolt-byref',
	'platform_execute-fallback-thunderbolt-css',
	'platform_execute-fallback-thunderbolt-platform',
	'platform_execute-fallback-thunderbolt-features',
	'platform_execute-fallback-thunderbolt-site-map',
	'platform_execute-fallback-thunderbolt-byref',
	'byoc-load-component',
	'byoc-load-component-retry',
	'byoc-load-css',
	'react_render_error',
	'site_assets_execute_css',
	'page-navigation',
	'page_features_loaded',
	'multilingual_init',
])
