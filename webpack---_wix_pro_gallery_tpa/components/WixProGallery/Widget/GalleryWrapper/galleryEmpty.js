import React from 'react';
import {
    utils
} from '@wix/common-pro-gallery-component-wrapper';
import {
    useTranslation
} from '@wix/yoshi-flow-editor';

const GalleryEmpty = () => {
    const {
        t
    } = useTranslation();
    const emptyContent = ( <
        div >
        <
        div className = "pro-gallery-empty-title" > {
            t('Gallery_Empty_Title')
        } <
        br / > {
            t('Gallery_Empty_Title2')
        } <
        /div> <
        div className = "pro-gallery-empty-info" > {
            t('Gallery_Empty_Description')
        } <
        br / > {
            t('Gallery_Empty_Description2')
        } <
        /div> <
        /div>
    );
    return ( <
        div className = "pro-gallery-empty" >
        <
        div className = "pro-gallery-empty-content" >
        <
        div className = "pro-gallery-empty-image" > < /div> {
            emptyContent
        } <
        /div> <
        /div>
    );
};

export default GalleryEmpty;