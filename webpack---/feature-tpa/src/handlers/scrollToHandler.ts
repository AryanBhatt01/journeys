import { withDependencies, optional } from '@wix/thunderbolt-ioc'
import {
	BrowserWindowSymbol,
	BrowserWindow,
	TpaHandlerProvider,
	ExperimentsSymbol,
	ReducedMotionSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { Animations, IAnimations } from 'feature-animations'

export type MessageData = {
	x: number
	y: number
	scrollAnimation?: boolean
}

export const ScrollToHandler = withDependencies(
	[BrowserWindowSymbol, ExperimentsSymbol, ReducedMotionSymbol, optional(Animations)],
	(window: BrowserWindow, experiments: Experiments, reducedMotion, animations?: IAnimations): TpaHandlerProvider => ({
		getTpaHandlers() {
			return {
				async scrollTo(compId, { x, y, scrollAnimation }: MessageData) {
					if (!animations) {
						return
					}
					const useAnimation = scrollAnimation && !reducedMotion
					const useNativeScrollTo = experiments && experiments['specs.thunderbolt.useNativeScrollTo']

					if (useAnimation) {
						if (useNativeScrollTo) {
							window!.scrollTo({ left: x, top: y, behavior: 'smooth' })
						} else {
							const duration = 1
							const delay = 0
							const animationInstance = await animations.getInstance()
							animationInstance.runAnimationOnElements(
								'BaseScroll',
								[(window! as unknown) as HTMLElement],
								duration,
								delay,
								{
									y,
									x,
									callbacks: {
										onComplete: () => Promise.resolve(),
									},
								}
							)
						}
					} else {
						window!.scrollTo(x, y)
					}
				},
			}
		},
	})
)
