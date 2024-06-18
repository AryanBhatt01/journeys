import type { TpaCompData } from '@wix/thunderbolt-symbols/dist'
import { ITpaContextMapping } from 'feature-tpa-commons/dist'

export const registerTpasForContext = (
	widgets: { [compId: string]: TpaCompData },
	tpaContextMapping: ITpaContextMapping,
	contextId: string,
	pageId: string
) => {
	const tpaWidgetsToRegister = Object.entries(widgets).map(([id, tpaCompData]) => {
		if (tpaCompData.templateId && id !== tpaCompData.templateId) {
			tpaContextMapping.registerTpaTemplateId(tpaCompData.templateId, id)
		}
		return id
	})

	tpaContextMapping.registerTpasForContext({ contextId, pageId }, tpaWidgetsToRegister)
}
