import { named, optional, withDependencies } from '@wix/thunderbolt-ioc'
import {
	BrowserWindowSymbol,
	FeatureStateSymbol,
	PageFeatureConfigSymbol,
	pageIdSym,
	ReducedMotionSymbol,
} from '@wix/thunderbolt-symbols'
import { name } from './symbols'
import { MotionEffectsManager } from './MotionEffectsManager'
import { Animations } from 'feature-animations'
import { MotionEffectsInitFactory } from './types'
import { isSSR } from '@wix/thunderbolt-commons'
import viewport from './viewport'
import { breakpointVariantValidator } from './breakpointVariantValidator'

const motionEffectsInitFactory: MotionEffectsInitFactory = (
	featureConfig,
	featureState,
	pageId,
	browserWindow,
	reducedMotion,
	animationsProvider
) => {
	const motionEffectsManagerInitPromise: Promise<MotionEffectsManager | undefined> = new Promise((resolve) => {
		const { animationDefsByCompId, isResponsive, scrubAnimationBreakpoints } = featureConfig

		if (!animationsProvider || reducedMotion) {
			resolve(undefined)
		}

		animationsProvider!.getEffectsInstance().then((animationsManager) => {
			const motionEffectsManager =
				featureState.get()?.[pageId] ??
				new MotionEffectsManager(animationsManager, isResponsive, breakpointVariantValidator)

			const allCompsEffectsMap = Object.assign({}, ...Object.values(animationDefsByCompId))

			motionEffectsManager.motionViewport =
				motionEffectsManager.motionViewport ?? viewport({ manager: motionEffectsManager })

			motionEffectsManager.init(allCompsEffectsMap, scrubAnimationBreakpoints)

			featureState.update((state) => ({ ...state, [pageId]: motionEffectsManager }))

			resolve(motionEffectsManager)
		})
	})

	if (reducedMotion && !isSSR(browserWindow)) {
		return {
			name: 'motionEffectsInit',
			pageWillUnmount() {},
			getInstance() {
				return motionEffectsManagerInitPromise
			},
		}
	}

	return {
		name: 'motionEffectsInit',
		async pageWillUnmount() {
			const motionEffectsManager = await motionEffectsManagerInitPromise
			motionEffectsManager?.clearAnimations()
		},
		getInstance() {
			return motionEffectsManagerInitPromise
		},
	}
}

export const MotionEffectsInit = withDependencies(
	[
		named(PageFeatureConfigSymbol, name),
		named(FeatureStateSymbol, name),
		pageIdSym,
		BrowserWindowSymbol,
		ReducedMotionSymbol,
		optional(Animations),
	],
	motionEffectsInitFactory
)
