import { Member } from './memberTypes'
import { VeloMember } from '../types'
import { MemberDetails } from 'feature-site-members'

export const toVeloMember = (member?: Member | undefined): VeloMember | undefined => {
	if (member === undefined) {
		return undefined
	}
	return {
		_id: member.id,
		contactId: member.contactId,
		loginEmail: member.loginEmail,
		profile: {
			nickname: member.profile?.nickname,
			slug: member.profile?.slug,
			profilePhoto: member.profile?.photo,
			coverPhoto: member.profile?.cover,
			title: member.profile?.title,
		},
		contactDetails: member.contact,
		activityStatus: member.activityStatus,
		privacyStatus: member.privacyStatus,
		status: member.status,
		lastLoginDate: member.lastLoginDate,
		_createdDate: member.createdDate,
		_updatedDate: member.updatedDate,
	}
}

export const memberDetailsToVeloMember = (memberDetails: MemberDetails): VeloMember => ({
	_id: memberDetails.id,
	contactId: memberDetails.contactId,
	loginEmail: memberDetails.loginEmail,
	profile: {
		nickname: memberDetails.nickname,
		slug: memberDetails.slug,
	},
	lastLoginDate: new Date(memberDetails.lastLoginDate ?? Date.now()),
	_createdDate: new Date(memberDetails.creationDate),
	_updatedDate: new Date(memberDetails.lastUpdateDate),
	revision: memberDetails.revision,
})
