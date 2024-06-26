import {
    assert
} from '../assert';
import {
    messageTemplates
} from '../messages';
import {
    reportError
} from '../reporters';
import {
    withValidation
} from '../validations';
export const setLink = (url, target, linkUtils, setProps) => {
    if (assert.isNil(url) || url === '') {
        setProps({
            link: undefined,
        });
        return;
    }
    try {
        setProps({
            link: linkUtils.getLinkProps(url, target),
        });
    } catch (e) {
        reportError(`The link property that is passed to the link method cannot be set to the value "${url}" as this is not a supported link type.`);
    }
};
export const getLink = (props, linkUtils) => props.link ? linkUtils.getLink(props.link) : '';
const _linkPropsSDKFactory = ({
    setProps,
    props,
    platformUtils: {
        linkUtils
    }
}) => {
    return {
        set link(url) {
            setLink(url, props.link ? .target, linkUtils, setProps);
        },
        get link() {
            return getLink(props, linkUtils);
        },
        set target(target) {
            setProps({
                link: { ...props.link,
                    target
                },
            });
        },
        get target() {
            return props.link ? .target ? ? '_blank';
        },
        set preventLinkNavigation(preventLinkNavigation) {
            setProps({
                preventLinkNavigation
            });
        },
        get preventLinkNavigation() {
            return props.preventLinkNavigation ? ? false;
        },
    };
};
export const linkPropsSDKFactory = withValidation(_linkPropsSDKFactory, {
    type: ['object'],
    properties: {
        link: {
            type: ['string', 'nil'],
            warnIfNil: true
        },
        target: {
            type: ['string', 'nil'],
            warnIfNil: true
        },
        preventLinkNavigation: {
            type: ['boolean']
        },
    },
}, {
    target: [
        (target) => {
            if (target === '_blank' || target === '_self') {
                return true;
            }
            reportError(messageTemplates.error_target_w_photo({
                target
            }));
            if (assert.isNil(target)) {
                return true;
            }
            return false;
        },
    ],
});
//# sourceMappingURL=linkPropsSDKFactory.js.map