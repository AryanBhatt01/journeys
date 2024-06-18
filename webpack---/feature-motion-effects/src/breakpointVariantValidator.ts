import type { AnimationDef, BreakpointRange, ScrubAnimationDef } from '@wix/thunderbolt-becky-types'
import type { VariantValidator } from './types'

export const breakpointVariantValidator: VariantValidator = function (defaultVariation, effectId, viewportWidth) {
	if (viewportWidth) {
		return (
			// @ts-expect-error
			this.definitions[effectId].findLast((variation: AnimationDef | ScrubAnimationDef) => {
				return (variation.variants as Array<BreakpointRange>)?.some((variant) => {
					if (variant.max && variant.max < viewportWidth) {
						return false
					}

					if (variant.min && variant.min > viewportWidth) {
						return false
					}

					return true
				})
			}) || defaultVariation
		)
	}

	return defaultVariation
}
