const createElementorySupportQueryParams = (gridAppId: string, viewMode: string, wixCodeInstance?: string): string => {
	const gridAppIdAndViewModeQueryParams = `?gridAppId=${gridAppId}&viewMode=${viewMode}`

	return wixCodeInstance
		? `${gridAppIdAndViewModeQueryParams}&instance=${wixCodeInstance}`
		: gridAppIdAndViewModeQueryParams
}

export { createElementorySupportQueryParams }
