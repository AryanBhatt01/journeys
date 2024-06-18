import { multi, withDependencies } from '@wix/thunderbolt-ioc'
import {
	CssFetcherSymbol,
	DomReadySymbol,
	HeadContentSymbol,
	ICssFetcher,
	IHeadContent,
	IPageResourceFetcher,
	PageResourceFetcherSymbol,
	ViewerModel,
	ViewerModelSym,
} from '@wix/thunderbolt-symbols'
import { LocalClientCssFetcher } from './LocalClientPageStyleLoader'

export type ILoadPageStyle = {
	load(pageId: string): Promise<void>
}

export const PageMainCssFetcher = withDependencies<ICssFetcher>(
	[PageResourceFetcherSymbol],
	(pageResourceFetcher: IPageResourceFetcher) => ({
		id: 'css',
		fetch: (pageId) => pageResourceFetcher.fetchResource(pageId, 'css'),
	})
)

export const toDomId = (id: string, pageId: string) => `${id}_${pageId}`

export const ClientPageStyleLoader = withDependencies<ILoadPageStyle>(
	[DomReadySymbol, multi(CssFetcherSymbol), ViewerModelSym],
	(domReadyPromise: Promise<void>, cssFetchers: Array<ICssFetcher>, viewerModel: ViewerModel) => {
		return {
			async load(pageId): Promise<void> {
				await domReadyPromise

				await Promise.all(
					cssFetchers.map(async (cssFetcher) => {
						if (viewerModel.siteAssets.modulesParams.css.shouldRunCssInBrowser) {
							return LocalClientCssFetcher(cssFetcher, pageId, viewerModel)
						}
						const id = toDomId(cssFetcher.id, pageId)
						if (document.getElementById(id)) {
							return
						}

						const { css } = await cssFetcher.fetch(pageId)

						const styleElement = window.document.createElement('style')
						styleElement.setAttribute('id', id)
						styleElement.innerHTML = css
						if (window.viewerModel.experiments['specs.thunderbolt.pagesCssInHead']) {
							window.document.head.appendChild(styleElement)
						} else {
							window.document.getElementById('pages-css')!.appendChild(styleElement)
						}
					})
				)
			},
		}
	}
)

export const ServerPageStyleLoader = withDependencies<ILoadPageStyle>(
	[HeadContentSymbol, multi(CssFetcherSymbol)],
	(headContent: IHeadContent, cssFetchers: Array<ICssFetcher>) => {
		return {
			async load(pageId) {
				const results = await Promise.all(
					cssFetchers.map(async ({ id, fetch }) => {
						const { css } = await fetch(pageId)
						return {
							id,
							css,
						}
					})
				)
				results.forEach(({ id, css }) => {
					headContent.addPageCss(`<style id="${toDomId(id, pageId)}">${css}</style>`)
				})
			},
		}
	}
)
