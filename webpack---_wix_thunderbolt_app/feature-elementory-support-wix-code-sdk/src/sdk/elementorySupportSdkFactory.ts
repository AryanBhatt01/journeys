import type { WixCodeApiFactoryArgs } from '@wix/thunderbolt-symbols'
import type { ElementorySupportWixCodeSdkWixCodeApi, ElementoryWixCodeSdkSiteConfig } from '../types'
import { namespace } from '../symbols'
import elementorySupport from './elementorySupport'
import { createElementorySupportQueryParams } from './queryParams'

export const ElementorySupportSdkFactory = ({
	featureConfig,
	platformUtils: { sessionService, commonConfig },
	appEssentials: { httpClient },
	platformEnvData: {
		window: { csrfToken },
		site,
		mainGridAppId,
	},
	appDefinitionId,
	blocksAppsUtils,
}: WixCodeApiFactoryArgs<ElementoryWixCodeSdkSiteConfig>): {
	[namespace]: ElementorySupportWixCodeSdkWixCodeApi
} => {
	const { viewMode, baseUrl, relativePath, gridAppId, siteRevision } = featureConfig
	const isSiteViewMode = viewMode === 'site'
	const useRelativePath = isSiteViewMode && Boolean(site.experiments['specs.thunderbolt.useElementoryRelativePath'])

	const additionalHeaders: Record<string, string> = {}
	const overrideGridAppId = mainGridAppId || gridAppId
	const wixCodeInstance =
		isSiteViewMode && Boolean(site.experiments['specs.thunderbolt.excludeInstanceFromQueryParams'])
			? ''
			: sessionService.getWixCodeInstance()
	const getQueryParameters = () => createElementorySupportQueryParams(overrideGridAppId, viewMode, wixCodeInstance)

	function getAuthorizationHeader() {
		if (!blocksAppsUtils.isBlocksSignedInstanceExperimentOpen()) {
			return sessionService.getWixCodeInstance()
		}

		const appInstance = sessionService.getInstance(appDefinitionId)
		const isBlocksApp = blocksAppsUtils.isBlocksApp(appDefinitionId)

		if (isBlocksApp && blocksAppsUtils.canAppInstanceBeUsedForAuthorization(appInstance)) {
			return appInstance
		}

		return sessionService.getWixCodeInstance()
	}

	const getRequestOptions = () => ({
		headers: {
			'X-XSRF-TOKEN': csrfToken,
			'x-wix-site-revision': siteRevision.toString(),
			'x-wix-app-instance': sessionService.getInstance(appDefinitionId),
			commonConfig: commonConfig.getHeader(),
			Authorization: getAuthorizationHeader(),
			...additionalHeaders,
		},
	})

	const setHeader = (headerKey: string, headerValue: string) => {
		additionalHeaders[headerKey] = headerValue
	}

	return {
		[namespace]: elementorySupport(
			baseUrl,
			getQueryParameters,
			getRequestOptions,
			httpClient,
			sessionService,
			setHeader,
			useRelativePath,
			relativePath,
			isSiteViewMode
		),
	}
}
