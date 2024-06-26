import { withDependencies, named, optional } from '@wix/thunderbolt-ioc'
import {
	PageFeatureConfigSymbol,
	IPageWillMountHandler,
	IPropsStore,
	Props,
	SiteFeatureConfigSymbol,
	pageIdSym,
	PageScrollRegistrarSymbol,
	FeatureStateSymbol,
	IPageDidMountHandler,
	contextIdSymbol,
	DynamicActionsApiSymbol,
	IDynamicActionsApi,
} from '@wix/thunderbolt-symbols'
import { SiteScrollBlockerSymbol, ISiteScrollBlocker } from 'feature-site-scroll-blocker'
import { IWindowScrollAPI, WindowScrollApiSymbol } from 'feature-window-scroll'
import { IPageScrollRegistrar } from 'feature-page-scroll'
import {
	OoiTpaSharedConfigSymbol,
	IOoiTpaSharedConfig,
	OOICompDataSymbol,
	IOOICompData,
} from 'feature-ooi-tpa-shared-config'
import { IFeatureState } from 'thunderbolt-feature-state'
import { name } from './symbols'
import type { OOIPageConfig, OOISiteConfig } from './types'
import { createHostProps } from './hostProps'
import _ from 'lodash'
import { IViewportWidthProvider, OOIViewportWidthProviderSymbol } from './viewportWidthProvider'
import { IMobileFullScreenModeApi, TpaFullScreenModeAPISymbol } from 'feature-mobile-full-screen'

export const ooiPageWillMount = withDependencies(
	[
		pageIdSym,
		contextIdSymbol,
		named(PageFeatureConfigSymbol, name),
		named(SiteFeatureConfigSymbol, name),
		Props,
		SiteScrollBlockerSymbol,
		WindowScrollApiSymbol,
		PageScrollRegistrarSymbol,
		OoiTpaSharedConfigSymbol,
		named(FeatureStateSymbol, name),
		OOIViewportWidthProviderSymbol,
		OOICompDataSymbol,
		optional(DynamicActionsApiSymbol),
		optional(TpaFullScreenModeAPISymbol),
	],
	(
		pageId,
		contextId,
		{ ooiComponents, accessibilityEnabled }: OOIPageConfig,
		{ viewMode, formFactor }: OOISiteConfig,
		propsStore: IPropsStore,
		siteScrollBlocker: ISiteScrollBlocker,
		windowScrollApi: IWindowScrollAPI,
		{ registerToThrottledScroll }: IPageScrollRegistrar,
		{ getFontsConfig }: IOoiTpaSharedConfig,
		featureState: IFeatureState<{ [compId: string]: Array<Function> }>,
		{ getViewportWidth }: IViewportWidthProvider,
		ooiCompData?: IOOICompData,
		dynamicActionsApi?: IDynamicActionsApi,
		mobileFullScreenApi?: IMobileFullScreenModeApi
	): IPageWillMountHandler & IPageDidMountHandler => {
		const getUniqueCompIdPerContextId = (compId: string) => `${contextId}_${compId}`
		let isPageMounted = false // TODO - Remove this when we have a better solution for the appLoaded event in ooi
		ooiCompData?.updateOoiComponents(ooiComponents)
		return {
			name: 'ooi',
			pageWillMount() {
				_.forEach(ooiComponents, (compData) => {
					const compId = compData.compId
					const uniqueCompId = getUniqueCompIdPerContextId(compId)

					const registerToComponentDidLayout = (handler: Function) => {
						if (isPageMounted) {
							handler()
						}
						const componentDidLayoutHandlers = featureState.get()?.[uniqueCompId] || []
						componentDidLayoutHandlers.push(handler)
						// the handlers are stored on feature state and not on this module's state because
						// props.host.registerToComponentDidLayout(cb) may be invoked within the ooi react componentDidMount() lifecycle
						// which is triggered once per master page component.
						featureState.update((state) => ({ ...state, [uniqueCompId]: componentDidLayoutHandlers }))
					}

					const unregisterFromComponentDidLayout = () =>
						featureState.update((state) => {
							state && delete state[uniqueCompId]
							return state
						})

					const hostProps = createHostProps({
						compData,
						pageId,
						accessibilityEnabled,
						formFactor,
						viewMode,
						siteScrollBlocker,
						windowScrollApi,
						registerToThrottledScroll,
						fonts: getFontsConfig(),
						getViewportWidth,
						dynamicActionsApi,
						mobileFullScreenApi,
					})

					propsStore.update({
						[compId]: {
							host: {
								...hostProps,
								// TODO rename to "onComponentInteractive"
								registerToComponentDidLayout,
								unregisterFromComponentDidLayout,
							},
						},
					})
				})
			},
			pageDidMount() {
				isPageMounted = true
				_.forEach(ooiComponents, ({ compId }) => {
					const componentDidLayoutHandlers = featureState.get()?.[getUniqueCompIdPerContextId(compId)] || []
					componentDidLayoutHandlers.forEach((handler) => handler())
				})
			},
		}
	}
)
