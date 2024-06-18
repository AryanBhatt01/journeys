import { WixCodeApiFactoryArgs } from '@wix/thunderbolt-symbols'
import createWixData from '@wix/wix-data-platformized-client'
import { namespace, DataWixCodeSdkSiteConfig } from '..'

export function DataSdkFactory({
	featureConfig,
	platformUtils,
	appEssentials,
	platformEnvData: { site },
}: WixCodeApiFactoryArgs<DataWixCodeSdkSiteConfig>) {
	const authHeaderProvider = {
		get() {
			return platformUtils.sessionService.getWixCodeInstance()
		},
	}

	const useDataItemService = Boolean(site.experiments['specs.thunderbolt.UseWixDataItemService'])
	const allowGetRequests = Boolean(site.experiments['specs.thunderbolt.UseWixDataGetRequests'])

	const { gridAppId, segment, cloudDataUrl } = featureConfig

	const { httpClient } = appEssentials

	return {
		[namespace]: createWixData({
			cloudDataUrl,
			httpClient,
			gridAppId,
			segment,
			authHeader: authHeaderProvider,
			shouldUseDataItemService: Promise.resolve(useDataItemService),
			allowGetRequests,
		}),
	}
}
