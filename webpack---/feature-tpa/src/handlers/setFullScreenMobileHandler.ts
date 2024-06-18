import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	BrowserWindow,
	BrowserWindowSymbol,
	IPropsStore,
	PageFeatureConfigSymbol,
	Props,
	SiteFeatureConfigSymbol,
	TpaHandlerProvider,
} from '@wix/thunderbolt-symbols'
import { name as tpaCommonsName, TpaCommonsSiteConfig } from 'feature-tpa-commons'
import { name } from '../symbols'
import { PERMITTED_FULL_SCREEN_TPAS_IN_MOBILE } from '../utils/constants'
import { IMobileFullScreenModeApi, TpaFullScreenModeAPISymbol } from 'feature-mobile-full-screen'
import { TpaPageConfig } from '../types'
import { getIOSVersion } from '@wix/thunderbolt-commons'

export type MessageData = {
	isFullScreen: boolean
}

export const SetFullScreenMobileHandler = withDependencies(
	[
		named(SiteFeatureConfigSymbol, tpaCommonsName),
		named(PageFeatureConfigSymbol, name),
		Props,
		BrowserWindowSymbol,
		TpaFullScreenModeAPISymbol,
	],
	(
		{ widgetsClientSpecMapData, isMobileView }: TpaCommonsSiteConfig,
		{ widgets }: TpaPageConfig,
		props: IPropsStore,
		window: BrowserWindow,
		mobileFullScreenApi: IMobileFullScreenModeApi
	): TpaHandlerProvider => {
		const isComponentAllowedInFullScreenMode = (compId: string): boolean => {
			const widget: any = widgets[compId] || {}
			const { appDefinitionId } = widgetsClientSpecMapData[widget.widgetId] || {}
			return Object.values(PERMITTED_FULL_SCREEN_TPAS_IN_MOBILE).includes(appDefinitionId)
		}

		return {
			getTpaHandlers() {
				return {
					async setFullScreenMobile(compId: string, { isFullScreen }: MessageData) {
						if (!isMobileView) {
							throw new Error('show full screen is only available in Mobile view')
						}

						if (isComponentAllowedInFullScreenMode(compId)) {
							if (isFullScreen) {
								mobileFullScreenApi.setFullScreenMobile(compId, isFullScreen)

								props.update({
									[compId]: {
										iOSVersion: getIOSVersion(window!),
										isMobileFullScreenMode: true,
									},
								})
							} else {
								mobileFullScreenApi.setFullScreenMobile(compId, isFullScreen)
								props.update({
									[compId]: {
										isMobileFullScreenMode: false,
									},
								})
							}
						}
					},
				}
			},
		}
	}
)
