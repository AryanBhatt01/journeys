import type {
	SessionState,
	Rotation,
	AnimationDefsMap,
	ViewportManager,
	ScrubAnimationDef,
	EffectTriggerData,
	VariantValidator,
} from './types'
import type { BreakpointRange, AnimationDef } from '@wix/thunderbolt-becky-types'
import type {
	AnimatorManager,
	PointerManager,
	ScrollManager,
	ScrubSceneFactoryMap,
	ExtendedPointerScene,
} from 'feature-animations'
import { Pointer } from 'kuliso'
import { TriggerVariant } from '@wix/thunderbolt-becky-types'

const CLEAR_PROPS = 'clip,clipPath,webkitClipPath,willChange,opacity,transform,transformOrigin,filter'
const getStateId = (id: string) => `${id}-motionEffects`

type Triggers = {
	play?: Array<EffectTriggerData>
	hold?: Array<EffectTriggerData>
	resume?: Array<EffectTriggerData>
} & {
	scrub?: { [effectId: string]: TriggerVariant }
}

const getMatchMediaString = (range: BreakpointRange): string => {
	const mediaString = []

	if (range.max) {
		mediaString.push(`(max-width:${range!.max}px)`)
	}
	if (range.min) {
		mediaString.push(`(min-width:${range!.min}px)`)
	}

	return mediaString.join(' and ')
}

// @ts-ignore
if (!Array.prototype.findLast) {
	// eslint-disable-next-line no-extend-native
	Object.defineProperty(Array.prototype, 'findLast', {
		value(predicate: (value: any, key: number) => any, thisArg: any) {
			return this.slice(0)
				.reverse()
				.find(thisArg ? predicate.bind(thisArg) : predicate)
		},
	})
}

export class MotionEffectsManager {
	private animator: AnimatorManager
	private definitions: AnimationDefsMap
	private scrubScenes: ScrubSceneFactoryMap
	private scrubTriggers: Record<string, TriggerVariant>
	private callbacks: Record<string, { end?: Array<(event: any) => void>; start?: Array<(event: any) => void> }>
	private sessionState: SessionState
	private scrubManagers: Array<ScrollManager | PointerManager>
	private isResponsive: boolean
	private breakpointRanges: Array<BreakpointRange>
	private activeListeners: Array<MediaQueryList>
	private disabledPointerScenes: Record<string, Array<PointerScene>>
	private breakpointChangeHandler: (event: MediaQueryListEvent) => void
	private variantValidator: VariantValidator
	public motionViewport: ViewportManager | undefined

	constructor(animationsManager: AnimatorManager, isResponsive: boolean, variantValidator: VariantValidator) {
		this.isResponsive = isResponsive
		this.breakpointRanges = []
		this.animator = animationsManager
		this.definitions = {}
		this.scrubScenes = {}
		this.scrubTriggers = {}
		this.callbacks = {}
		this.sessionState = {
			played: new Map(),
			running: new WeakMap(),
		}
		this.scrubManagers = []
		this.activeListeners = []
		this.disabledPointerScenes = {}
		this.variantValidator = variantValidator

		this.breakpointChangeHandler = this._breakpointChangeHandler.bind(this)
	}

	_shouldSkipPlayedAnimation(stateId: string) {
		const wasPlayedInSession = this.sessionState.played.has(stateId)
		const { playOnce, persistOnNav } = this.sessionState.played.get(stateId) || {}
		return wasPlayedInSession && (playOnce || persistOnNav)
	}

	setAnimationStartState(compId: string | HTMLElement) {
		const element: any = typeof compId === 'string' ? document.getElementById(compId) : compId
		if (element) {
			element.dataset.motionEnter = 'done'
		}
	}

	_addAnimatingClass(el: HTMLElement | null) {
		if (el) {
			el.classList.add('is-animating')
			this.setAnimationStartState(el)
		}
	}

	_removeAnimatingClass(el: HTMLElement | null) {
		if (el) {
			el.classList.remove('is-animating')
			this.setAnimationStartState(el)
		}
	}

	updateDefinitions(animationDefsMap: AnimationDefsMap) {
		Object.assign(this.definitions, animationDefsMap)

		const newEffectIds = Object.keys(animationDefsMap)

		this.updateScrubScenes(newEffectIds)
	}

	updateScrubScenes(effectIds: Array<string>, clearExisting: boolean = false) {
		if (clearExisting) {
			const targetIds = new Set() as Set<string>

			// collect target ids and kill all animations
			for (const effectId in this.scrubScenes) {
				targetIds.add(this.scrubScenes[effectId].targetId)
				this.scrubScenes[effectId].animation?.kill()
			}
			this.scrubScenes = {}
			this.animator.clearScrubAnimations(targetIds)
		}

		const scrubAnimations: Record<string, ScrubAnimationDef> = {}
		const viewportWidth = this.isResponsive ? window.innerWidth : 0

		for (const effectId of effectIds) {
			const animation = this._getEffectVariationForCurrentBreakpoint(effectId, viewportWidth)

			if ((animation as ScrubAnimationDef).type === 'ScrubAnimationOptions') {
				scrubAnimations[effectId] = animation as ScrubAnimationDef
			}
		}

		this.scrubScenes = Object.assign(this.scrubScenes, this.animator.createScrubAnimations(scrubAnimations))
	}

	updateScrubManagers(triggers: Triggers['scrub'] = {}, clearExisting: boolean = false) {
		if (this.scrubManagers.length && clearExisting) {
			this._killScrubAnimations()
		}

		//  create new Scrub managers
		this.scrubManagers.push(...this.animator.startScrubAnimations(triggers, this.scrubScenes))

		this.scrubManagers.forEach((manager) => {
			if (manager instanceof Pointer) {
				manager.config.scenes.forEach((scene: ExtendedPointerScene) => {
					if (scene.target && scene.centeredToTarget && scene.isHitAreaRoot) {
						const container = scene.target.closest('[data-block-level-container]') as HTMLElement

						const effectId = scene.effectId
						if (container && this.motionViewport && effectId) {
							if (!this.disabledPointerScenes[effectId]) {
								this.disabledPointerScenes[effectId] = []
							}
							this.disabledPointerScenes[effectId].push(scene)
							this.motionViewport.observe(container, { effectId, targetId: scene.target.id })
						}
					}
				})
			}
		})
	}

	/**
	 * Add data-angle attr to component before animating to handle comp rotation
	 */
	handleRotation(el: HTMLElement, rotation: Rotation) {
		el.dataset.angle = String(rotation)
		el.dataset.angleStyleLocation = 'style'
	}

	/**
	 * Trigger screenIn on all trigger descriptors passed
	 */
	trigger(triggers: Triggers = {}, isBreakpointChange?: boolean) {
		let viewportWidth = 0

		if (triggers.scrub) {
			if (isBreakpointChange) {
				// reset triggers state
				this.scrubTriggers = triggers.scrub
				// make sure managers are updated after scenes are updated
				requestAnimationFrame(() => this.updateScrubManagers(triggers.scrub, isBreakpointChange))
			} else {
				Object.assign(this.scrubTriggers, triggers.scrub)
				this.updateScrubManagers(triggers.scrub)
			}
		} else {
			viewportWidth = this.isResponsive ? window.innerWidth : 0
		}

		if (triggers.play?.length) {
			triggers.play.forEach(({ effectId, targetId }) => {
				const animation = this._getEffectVariationForCurrentBreakpoint(effectId, viewportWidth) as AnimationDef

				if (animation.name) {
					this.playAnimation(animation as AnimationDef, effectId, { targetId })
				}
			})
		}

		if (triggers.resume?.length) {
			triggers.resume.forEach(({ effectId, targetId }) => {
				if (this.disabledPointerScenes[effectId]) {
					this.disabledPointerScenes[effectId].forEach((scene) => (scene.disabled = false))
					return
				}

				const animation = this._getEffectVariationForCurrentBreakpoint(effectId, viewportWidth) as AnimationDef

				if (animation.name) {
					this.resumeOrPlayAnimation(animation as AnimationDef, effectId, { targetId })
				}
			})
		}

		if (triggers.hold?.length) {
			triggers.hold.forEach(({ effectId, targetId }) => {
				if (this.disabledPointerScenes[effectId]) {
					this.disabledPointerScenes[effectId].forEach((scene) => (scene.disabled = true))
					return
				}

				const animation = this._getEffectVariationForCurrentBreakpoint(effectId, viewportWidth) as AnimationDef

				if (animation.name) {
					this.pauseAnimation({ ...animation, targetId } as AnimationDef)
				}
			})
		}
	}

	init(animationDefs: AnimationDefsMap, scrubAnimationBreakpoints: Array<BreakpointRange>) {
		this.breakpointRanges = scrubAnimationBreakpoints
		this.stopAnimations()
		this.definitions = {}
		this.observeBreakpointChange()
		this.updateDefinitions(animationDefs)
	}

	addDefinition(animationDef: AnimationDefsMap, compElement: HTMLElement, compRotation: Rotation) {
		this.handleRotation(compElement, compRotation)
		this.updateDefinitions(animationDef)
	}

	addEffectCallback(effectId: string, triggerType: string, callback: () => void) {
		const eventName = triggerType === 'animation-end' ? 'end' : 'start'
		this.callbacks[effectId] = this.callbacks[effectId] || { end: [], start: [] }
		this.callbacks[effectId][eventName]?.push(callback)
	}

	clearEffectCallbacks(effectId: string) {
		delete this.callbacks[effectId]
	}

	observeTargetPlaybackInViewport(effectId: string, targetId: string) {
		const targetElement = document.getElementById(targetId)
		if (targetElement && this.motionViewport) {
			const observedParent = (targetElement.closest('[data-block-level-container]') ||
				targetElement) as HTMLElement
			this.motionViewport.observe(observedParent, { effectId, targetId })
		}
	}

	/**
	 * Play an animation
	 */
	playAnimation(
		animation: Omit<AnimationDef, 'action'>,
		effectId: string,
		overrides: Partial<Omit<AnimationDef, 'action'>> = {}
	) {
		const updatedAnimation = { ...animation, ...overrides }
		const { targetId, iterations } = updatedAnimation
		const stateId = getStateId(targetId)
		// Skip if played in current page or played in current session and marked as play once
		if (this._shouldSkipPlayedAnimation(stateId)) {
			this.setAnimationStartState(targetId)
			return
		}

		if (iterations === 0) {
			this.observeTargetPlaybackInViewport(effectId, targetId)
			return
		}

		this._createAndRunSequence(updatedAnimation, effectId)
	}

	_createAndRunSequence(animation: Omit<AnimationDef, 'action'>, effectId: string = '') {
		const { name, targetId, duration, delay, easing, params, playOnce, persistOnNav, iterations = 1 } = animation
		const stateId = getStateId(targetId)

		const clearParams = { props: CLEAR_PROPS, immediateRender: false }
		const animationData = { name, targetId, duration, delay, params: { ...params, easing } }

		const baseClearData = {
			name: 'BaseClear',
			targetId,
			duration: 0,
			delay: 0,
			params: clearParams,
		}

		const sequence = this.animator.runSequence(
			[
				{ type: 'Animation', data: animationData },
				{ type: 'Animation', data: baseClearData },
			],
			{
				repeat: iterations - 1,
				callbacks: {
					onStart: (instance: any) => {
						const el = document.getElementById(targetId)
						if (el) {
							this._addAnimatingClass(el as HTMLElement)
							this.sessionState.running.set(el, instance)
						}

						effectId &&
							this.callbacks[effectId]?.start?.forEach((callback) => callback({ compId: targetId }))
					},
					onComplete: () => {
						const el = document.getElementById(targetId)
						if (el) {
							this._removeAnimatingClass(el)
							this.sessionState.running.delete(el)
						}

						effectId && this.callbacks[effectId]?.end?.forEach((callback) => callback({ compId: targetId }))
					},
					onInterrupt: () => {
						const el = document.getElementById(targetId)
						if (el) {
							this._removeAnimatingClass(el)
							this.sessionState.running.delete(el)
						}
					},
				},
			}
		)

		this.sessionState.played.set(stateId, { playOnce, persistOnNav, instance: sequence })
	}

	_getEffectVariationForCurrentBreakpoint(effectId: string, viewportWidth: number) {
		const defaultVariation = this.definitions[effectId].find((variation) => !variation.variants?.length) as
			| AnimationDef
			| ScrubAnimationDef

		return this.variantValidator(defaultVariation, effectId, viewportWidth)
	}

	/**
	 * kill all running animations
	 */
	stopAnimations({ skipPersistent = true }: { skipPersistent?: boolean } = {}) {
		this.sessionState.played.forEach(({ persistOnNav, instance }) => {
			const isPersistentToSkip = skipPersistent && persistOnNav
			if (!isPersistentToSkip) {
				this.animator.kill(instance.timeline, 1)
			}
		})

		this._killScrubAnimations()
	}

	getSequenceFromState(animationDef: Omit<AnimationDef, 'action'>) {
		const element = document.getElementById(animationDef.targetId)
		return element && this.sessionState.running.get(element)
	}

	/**
	 * resume a paused animation or create and run an animation if it doesn't exist in cache
	 */
	resumeOrPlayAnimation(
		animation: Omit<AnimationDef, 'action'>,
		effectId: string,
		overrides: Partial<Omit<AnimationDef, 'action'>> = {}
	) {
		const updateAnimation = { ...animation, ...overrides }
		const targetSequence = this.getSequenceFromState(updateAnimation)
		targetSequence ? targetSequence.play() : this._createAndRunSequence(updateAnimation, effectId)
	}

	/**
	 * pause a running animation
	 */
	pauseAnimation(animationDef: Omit<AnimationDef, 'action'>) {
		const targetSequence = this.getSequenceFromState(animationDef)
		targetSequence?.pause()
	}

	_killScrubAnimations() {
		if (this.scrubManagers.length) {
			this.scrubManagers.forEach((manager) => manager.destroy())
			this.scrubManagers.length = 0
			this.disabledPointerScenes = {}
		}
	}

	clearAnimations() {
		this.definitions = {}

		this._killScrubAnimations()

		this.motionViewport?.disconnect()

		this.activeListeners.forEach((listener) => listener.removeEventListener('change', this.breakpointChangeHandler))
		this.activeListeners.length = 0
		this.scrubTriggers = {}
	}

	clearState() {
		this.sessionState.played.clear()
		this.sessionState.running = new WeakMap()
	}

	observeBreakpointChange() {
		this.breakpointRanges.forEach((range) => {
			const matchMediaString = getMatchMediaString(range)
			const mediaQueryList = window.matchMedia(matchMediaString)
			this.activeListeners.push(mediaQueryList)
			mediaQueryList.addEventListener('change', this.breakpointChangeHandler)
		})
	}

	_breakpointChangeHandler(event: MediaQueryListEvent) {
		if (event.matches) {
			this.updateScrubScenes(Object.keys(this.definitions), true)
		}
	}
}
