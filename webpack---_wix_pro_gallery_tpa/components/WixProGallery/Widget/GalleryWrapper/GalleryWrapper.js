import {
    CommonGalleryWrapper
} from '@wix/common-pro-gallery-component-wrapper';
import loadable from '@wix/yoshi-flow-editor/loadable';
import ProFullscreenWrapper from '../FullscreenWrapper/FullscreenWrapper'; // TODO - remove FullscreenWrapper import when the SSR can accept different bundles
import {
    PRO_GALLERY
} from '../../../../types/constants';
import {
    getResizeMediaUrl
} from '@wix/photography-client-lib';
import '../../../../assets/static/commonStaticsCss.global.scss';
import '../../../../assets/static/proGallery/FullscreenWrapper.scss';
import '../../../../assets/static/common/galleryEmpty.scss';
import GalleryEmpty from './galleryEmpty';
// import '../../../../assets/dynamic/proGallery/FullscreenWrapperWixStyles.scss'

export default class ProGalleryWrapper extends CommonGalleryWrapper {
    isStoreGallery() {
        return false;
    }

    createStaticCssLinkElement() {
        return null;
    }

    getFullscreenElementIfNeeded() {
        if (!this.canRenderFullscreen()) {
            return null;
        }
        return ProFullscreenWrapper;
    }

    canRenderFullscreen() {
        return this.getFullscreenSelectedIndex() >= 0;
    }

    getSentryDSN() {
        return PRO_GALLERY.SENTRY_DSN;
    }

    getItemResizer(staticMediaUrls, isPrerenderMode) {
        return getResizeMediaUrl({
            staticMediaUrls,
            isPrerenderMode,
            useOptimizedImageFormat: this.props.options ? .useOptimizedImageFormat,
        });
    }
    getGalleryEmpty() {
        return GalleryEmpty;
    }
}