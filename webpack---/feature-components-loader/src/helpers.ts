import { ViewerModel } from '@wix/thunderbolt-symbols'

export const isLazyLoadCompatible = (viewerModel: ViewerModel) =>
	viewerModel.react18Compatible &&
	viewerModel.react18HydrationCompatible &&
	process.env.PACKAGE_NAME !== 'thunderbolt-ds'
