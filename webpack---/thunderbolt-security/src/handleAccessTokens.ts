/**
 * This file is with it's imports is being loaded in the main-head.ejs on production using webpack.
 * While working locally, the last bundle is being loaded in the main-head.ejs as minified + uglyfied code.
 * To see changes from your code locally, after each change you need to run "npx webpack" from the package folder and copy
 * the content of the generated file in "dist/handleAccessTokens.js" to the main-head.ejs file.
 * This is only because yoshi does let us to remove the loaded webpack-dev-server into the bundle and it causes errors locally only.
 */

const CLIENT_COOKIE_NAME = 'client-session-bind'
const CLIENT_HEADER = 'client-binding'

const THUNDERBOLT_READY_EVENT_NAME = 'tbReady'

const removeCookie = () => {
	const cookieParams = `${CLIENT_COOKIE_NAME}=; max-age=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
	if (typeof location !== 'undefined') {
		const localUrl = new URL(location.href)
		const hostname = localUrl.hostname.includes('localhost') ? localUrl.hostname : `.${localUrl.hostname}`
		document.cookie = `${cookieParams}; domain=${hostname}`
	} else {
		document.cookie = cookieParams
	}
}

// @ts-ignore
const dynamicModelsEndpoint = window.viewerModel.experiments['specs.thunderbolt.replaceDynamicModel']
	? // @ts-ignore
	  window.viewerModel.accessTokensUrl
	: // @ts-ignore
	  window.viewerModel.dynamicModelUrl

// @ts-ignore
if (viewerModel.experiments['specs.thunderbolt.hardenFetchAndXHR']) {
	let originalFetch = fetch
	const xsrfValue = document.cookie
		.split(';')
		.map((_) => _.trim())
		.filter((cookieName) => cookieName.startsWith(CLIENT_COOKIE_NAME))[0]
		?.split('=')[1]
	const fetchHeaders: Record<string, string> = {}
	if (xsrfValue) {
		fetchHeaders[CLIENT_HEADER] = xsrfValue
		removeCookie()
	}

	function initOnTbReady(event: Event) {
		// @ts-ignore
		const { logger } = event.detail
		try {
			// @ts-ignore
			window.tb.init({ fetch: originalFetch, fetchHeaders })
		} catch (e) {
			logger.captureError(e, {
				tags: { feature: 'thunderbolt-security' },
				extra: {
					errorMessage: 'TB003',
				},
			})
		} finally {
			// @ts-ignore
			removeEventListener(THUNDERBOLT_READY_EVENT_NAME, initOnTbReady)
			// This is done to remove the reference to the original fetch and use the overridden one
			originalFetch = fetch
		}
	}

	// @ts-ignore
	addEventListener(THUNDERBOLT_READY_EVENT_NAME, initOnTbReady)
} else {
	// @ts-ignore
	window.fetchDynamicModel = () =>
		// @ts-ignore
		window.viewerModel.siteFeaturesConfigs.sessionManager.isRunningInDifferentSiteContext
			? Promise.resolve({})
			: fetch(dynamicModelsEndpoint, { credentials: 'same-origin' }).then(function (r) {
					if (!r.ok) {
						throw new Error(`[${r.status}]${r.statusText}`)
					}
					return r.json()
			  })
	// @ts-ignore
	window.dynamicModelPromise = window.fetchDynamicModel()
}
