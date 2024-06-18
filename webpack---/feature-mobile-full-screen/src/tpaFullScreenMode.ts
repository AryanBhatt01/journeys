import { withDependencies } from '@wix/thunderbolt-ioc'
import {
	BrowserWindow,
	BrowserWindowSymbol,
	IPropsStore,
	Props,
	ComponentsStylesOverridesSymbol,
	IComponentsStylesOverrides,
} from '@wix/thunderbolt-symbols'
import { setFullScreenMode, removeFullScreenMode, hideSiteRoot } from '@wix/thunderbolt-commons'
import { IMobileFullScreenModeApi } from './types'

const omitBy = (obj: Record<string, string | null>, notAllowedKey: string) =>
	Object.keys(obj).reduce((result, cssKey) => {
		if (cssKey !== notAllowedKey) {
			result[cssKey] = obj[cssKey]
		}
		return result
	}, {} as Record<string, string | null>)

export const TpaFullScreenModeAPI = withDependencies(
	[Props, BrowserWindowSymbol, ComponentsStylesOverridesSymbol],
	(
		props: IPropsStore,
		window: BrowserWindow,
		componentsStylesOverrides: IComponentsStylesOverrides
	): IMobileFullScreenModeApi => {
		const enterFullScreenMode = (compId: string) => {
			setFullScreenMode(window)
			hideSiteRoot(window, true)

			// TODO: remove. temporary solution until LAYOUT-385 is implemented
			componentsStylesOverrides.set({
				[`${compId}-pinned-layer`]: { 'z-index': 'var(--above-all-z-index) !important' },
			})
		}

		const exitFullScreenMode = (compId: string) => {
			removeFullScreenMode(window)
			hideSiteRoot(window, false)

			// TODO: remove. temporary solution until LAYOUT-385 is implemented
			const pinnerLayerId = `${compId}-pinned-layer`
			const pinnerLayerStyle = componentsStylesOverrides.getCompStyle(pinnerLayerId)

			componentsStylesOverrides.set({
				[pinnerLayerId]: omitBy(pinnerLayerStyle, 'z-index'),
			})
		}

		return {
			setFullScreenMobile(compId: string, isFullScreen: boolean) {
				if (isFullScreen) {
					enterFullScreenMode(compId)
				} else {
					exitFullScreenMode(compId)
				}
			},
		}
	}
)
