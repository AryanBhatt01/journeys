import type { ContainerModuleLoader } from '@wix/thunderbolt-ioc'
import { MotionEffectsInit } from './motionEffectsInit'
import { LifeCycle } from '@wix/thunderbolt-symbols'
import { MotionEffectsInitSymbol } from './symbols'

export type { Actions, ViewMode, IMotionEffectsAPI, IMotionEffectsInit } from './types'
export { MotionEffectsInitSymbol } from './symbols'
export { MotionEffectsManager } from './MotionEffectsManager'
export { MotionEffectsInit } from './motionEffectsInit'

export const page: ContainerModuleLoader = (bind) => {
	bind(LifeCycle.PageWillUnmountHandler, MotionEffectsInitSymbol).to(MotionEffectsInit)
}
