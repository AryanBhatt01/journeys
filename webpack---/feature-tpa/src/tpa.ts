import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	IPageDidMountHandler,
	IPropsStore,
	PageFeatureConfigSymbol,
	contextIdSymbol,
	Props,
	SiteFeatureConfigSymbol,
} from '@wix/thunderbolt-symbols'
import type { ITpa, ITpaComponentApi, TpaPageConfig } from './types'
import { name, TpaComponentApiSymbol } from './symbols'
import {
	name as tpaCommonsName,
	TpaCommonsSiteConfig,
	TpaContextMappingSymbol,
	ITpaContextMapping,
} from 'feature-tpa-commons'
import { ISessionManager, SessionManagerSymbol } from 'feature-session-manager'
import _ from 'lodash'
import { registerTpasForContext } from './utils/tpaContextMappingUtils'

export const Tpa = withDependencies(
	[
		Props,
		named(SiteFeatureConfigSymbol, tpaCommonsName),
		named(PageFeatureConfigSymbol, name),
		SessionManagerSymbol,
		contextIdSymbol,
		TpaContextMappingSymbol,
		TpaComponentApiSymbol,
	],
	(
		props: IPropsStore,
		{ widgetsClientSpecMapData }: TpaCommonsSiteConfig,
		tpaPageConfig: TpaPageConfig,
		sessionManager: ISessionManager,
		contextId: string,
		tpaContextMapping: ITpaContextMapping,
		tpaComponentApi: ITpaComponentApi
	): IPageDidMountHandler & ITpa => {
		const { widgets, tpaInnerRouteConfig, pageId } = tpaPageConfig

		registerTpasForContext(widgets, tpaContextMapping, contextId, pageId)

		const rebuildTpaSrc = (compId: string) => {
			const src = tpaComponentApi.buildSrc({
				compId,
				tpaCompData: widgets[compId]!,
				pageId: tpaPageConfig.pageId,
				tpaInnerRouteConfig,
			})
			props.update({
				[compId]: {
					src,
				},
			})
		}

		const rebuildTpasSrc = () => {
			const tpas = _.pickBy(widgets, ({ widgetId, isOOI }) => !isOOI && widgetsClientSpecMapData[widgetId])
			Object.keys(tpas).forEach(rebuildTpaSrc)
		}

		return {
			pageDidMount() {
				return sessionManager.addLoadNewSessionCallback(({ reason }) => {
					if (reason === 'memberLogin') {
						rebuildTpasSrc()
					}
				})
			},
			rebuildTpasSrc,
			rebuildTpaSrc,
		}
	}
)
