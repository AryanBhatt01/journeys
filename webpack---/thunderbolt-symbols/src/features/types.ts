import type { RenderConfig } from '../types/becky'

export const InitSymbol = Symbol('InitSymbol')

export type FeatureName =
	| 'accessibility'
	| 'activePopup'
	| 'activeVariantsApi'
	| 'addressInput'
	| 'animations'
	| 'animationsWixCodeSdk'
	| 'applePay'
	| 'assetsLoader'
	| 'authenticationWixCodeSdk'
	| 'autoDisplayLightbox'
	| 'backgroundGroup'
	| 'backgroundScrub'
	| 'blockingLayer'
	| 'bookings'
	| 'breadcrumbs'
	| 'businessLogger'
	| 'businessManager'
	| 'captcha'
	| 'chat'
	| 'clickHandlerRegistrar'
	| 'clientSdk'
	| 'coBranding'
	| 'codeEmbed'
	| 'commonConfig'
	| 'components'
	| 'componentsLoader'
	| 'componentsMeasures'
	| 'componentsPreviewTooltip'
	| 'componentsQaApi'
	| 'componentsReact'
	| 'componentsRegistry'
	| 'componentsUpdatesManager'
	| 'consentPolicy'
	| 'containerSlider'
	| 'cookiesManager'
	| 'crmWixCodeSdk'
	| 'customCss'
	| 'customUrlMapper'
	| 'cyclicTabbing'
	| 'dashboardWixCodeSdk'
	| 'dataWixCodeSdk'
	| 'debug'
	| 'debugDs'
	| 'dynamicPages'
	| 'editorAnimations'
	| 'editorElementsDynamicTheme'
	| 'editorNavigation'
	| 'editorPopups'
	| 'editorRouter'
	| 'editorWixCodeSdk'
	| 'elementorySupportWixCodeSdk'
	| 'embeddedInIframe'
	| 'environment'
	| 'environmentWixCodeSdk'
	| 'experiments'
	| 'externalComponent'
	| 'builderComponent'
	| 'extraSiteHeight'
	| 'fedops'
	| 'fedopsWixCodeSdk'
	| 'fileUploader'
	| 'freemiumBanner'
	| 'headerContainer'
	| 'headerPlaceholderHeight'
	| 'hoverBox'
	| 'imagePlaceholder'
	| 'imageZoom'
	| 'landingPage'
	| 'lightbox'
	| 'locationWixCodeSdk'
	| 'loginButton'
	| 'measuresApi'
	| 'menuContainer'
	| 'menusCurrentPage'
	| 'mobileActionsMenu'
	| 'mobileFullScreen'
	| 'modelUpdatesInvoker'
	| 'motion'
	| 'motionEffects'
	| 'multilingual'
	| 'nativeMobileWixCodeSdk'
	| 'navigation'
	| 'navigationManager'
	| 'navigationPhases'
	| 'onloadCompsBehaviors'
	| 'ooi'
	| 'ooiTpaSharedConfig'
	| 'pageAnchors'
	| 'pageScroll'
	| 'pageTransitions'
	| 'pages'
	| 'paidPlansWixCodeSdk'
	| 'panorama'
	| 'passwordProtectedPage'
	| 'platform'
	| 'platformPubsub'
	| 'popupLink'
	| 'presenceApi'
	| 'pricingPlansWixCodeSdk'
	| 'protectedPages'
	| 'qaApi'
	| 'feedback'
	| 'quickActionBar'
	| 'realtimeWixCodeSdk'
	| 'render'
	| 'renderIndicator'
	| 'renderer'
	| 'repeaters'
	| 'reporter'
	| 'router'
	| 'routerFetch'
	| 'screenIn'
	| 'scrollRestoration'
	| 'scrollToAnchor'
	| 'scrollVar'
	| 'searchBox'
	| 'searchWixCodeSdk'
	| 'seo'
	| 'seoTpa'
	| 'seoWixCodeSdk'
	| 'sessionManager'
	| 'siteMembers'
	| 'siteMembersWixCodeSdk'
	| 'siteOverflow'
	| 'siteScrollBlocker'
	| 'siteWixCodeSdk'
	| 'sliderGallery'
	| 'sosp'
	| 'stickyToComponent'
	| 'stores'
	| 'storesWixCodeSdk'
	| 'structureApi'
	| 'telemetryWixCodeSdk'
	| 'testApi'
	| 'thunderboltInitializer'
	| 'thunderboltLogger'
	| 'tinyMenu'
	| 'tpa'
	| 'tpaCommons'
	| 'tpaModuleProvider'
	| 'tpaWorkerFeature'
	| 'translations'
	| 'triggersAndReactions'
	| 'viewMode'
	| 'viewerManagerActionApi'
	| 'viewerManagerActionsAndBehaviorsApi'
	| 'viewerManagerAnimationApi'
	| 'viewerManagerBlocksApi'
	| 'viewerManagerByRefApi'
	| 'viewerManagerComponentApi'
	| 'viewerManagerComponentDetectorApi'
	| 'viewerManagerCustomCss'
	| 'viewerManagerCustomElementsApi'
	| 'viewerManagerDataApi'
	| 'viewerManagerDiagnosticsApi'
	| 'viewerManagerDisplayedOnlyComponentsApi'
	| 'viewerManagerDocumentServicesModelApi'
	| 'viewerManagerExternalComponentsApi'
	| 'viewerManagerFontsApi'
	| 'viewerManagerLayoutApi'
	| 'viewerManagerLivePreviewApi'
	| 'viewerManagerMembersApi'
	| 'viewerManagerModesApi'
	| 'viewerManagerMultilingualApi'
	| 'viewerManagerNavigationApi'
	| 'viewerManagerPagesApi'
	| 'viewerManagerPlatformApi'
	| 'viewerManagerQueryApi'
	| 'viewerManagerRealTimeConfigApi'
	| 'viewerManagerRenderFlagsApi'
	| 'viewerManagerRendererModelApi'
	| 'viewerManagerResponsiveApi'
	| 'viewerManagerRuntimeApi'
	| 'viewerManagerRuntimeLayoutApi'
	| 'viewerManagerScopesApi'
	| 'viewerManagerScrollApi'
	| 'viewerManagerStructureApi'
	| 'viewerManagerStylableApi'
	| 'viewerManagerSvgApi'
	| 'viewerManagerTpaApi'
	| 'viewerManagerUpdateStatusApi'
	| 'viewerManagerVariantsApi'
	| 'viewerManagerVeloApi'
	| 'viewerManagerPathBuilderApi'
	| 'visibility'
	| 'warmupData'
	| 'welcomeScreen'
	| 'widget'
	| 'widgetWixCodeSdk'
	| 'windowMessageRegistrar'
	| 'windowScroll'
	| 'windowWixCodeSdk'
	| 'wixCustomElementComponent'
	| 'wixEmbedsApi'
	| 'wixEventsWixCodeSdk'
	| 'wixapps'
	| 'wrichtextWrapOnAdd'

export type FeaturesConfig = Partial<Record<FeatureName | '__componentsConfig__', any>>
export type PageFeaturesConfig = Partial<Omit<Record<FeatureName | '__componentsConfig__', any>, 'render'>> & {
	render: RenderConfig
}