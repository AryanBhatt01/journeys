export const getPageIdByWidgetId = (viewerModel: any, widgetId: string): string => {
	return (
		Object.values<any>(viewerModel.siteFeaturesConfigs.dynamicPages.prefixToRouterFetchData).find(
			({ optionsData }) => optionsData.bodyData.pageRoles[widgetId]
		)?.optionsData?.bodyData?.pageRoles?.[widgetId]?.id ?? ''
	)
}
