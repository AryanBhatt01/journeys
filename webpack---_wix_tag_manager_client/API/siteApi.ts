import { xhrGeneric } from '../utils/xhr';
import { SITES_API, METASITE_APP_DEF_ID, WIX_DOMAINS } from '../consts/consts';
import { tokenAccessor } from '../modules/stateCache';
import { error } from '../utils/logger';
import { runCallback } from '../utils/callbackUtils';
import { extractQueryParameter } from '../utils/extractQueryParameter';
import { getCurrentPageInfo } from '../utils/wixEmbedsAPIClient';
import { getSiteTagParams, PageInfo, SiteEmbedsHandlerOptions } from '../types';
import { siteEmbedsHandler } from './siteApiHandlers';
import { isPartyTownSupported } from '../consts/partytown';

function buildTagApiUrl(
  baseUrl: string,
  metasiteId: string,
  wixSite?: boolean,
) {
  return `${
    baseUrl && !isWixSite(!!wixSite) ? baseUrl : ''
  }/${SITES_API}${metasiteId}`;
}

// This is for template workarounds, they are on a Wix.com domain but their document type is "template"
function isWixSite(wixSite: boolean): boolean {
  let isWixDomain = false;
  WIX_DOMAINS.forEach((domain) => {
    if (!isWixDomain) {
      isWixDomain = location.hostname.indexOf(domain) > 0;
    }
  });
  return isWixDomain || wixSite;
}

async function getAccessTokenForCall() {
  let token: any;
  const getAccessToken = tokenAccessor();
  if (typeof getAccessToken === 'function') {
    try {
      token = await getAccessToken();
    } catch (e) {
      // Failed to get token
    }
  }
  if (!token) {
    const getAppToken = window.wixEmbedsAPI.getAppToken;
    token = runCallback(getAppToken, METASITE_APP_DEF_ID);
  }
  return token;
}

async function getSiteTags(params: getSiteTagParams) {
  const { metasiteId, htmlsiteId, baseUrl, wixSite, language, categories } =
    params;

  const maybeSiteOverrideId = extractQueryParameter('site-override');
  const maybeAppsOverrideId = extractQueryParameter('apps-override');
  const uri = buildTagApiUrl(baseUrl, metasiteId, wixSite);

  const consentPolicyManager = window.consentPolicyManager;
  const headers =
    !wixSite && consentPolicyManager
      ? consentPolicyManager._getConsentPolicyHeader()
      : {};
  const pageInfo: PageInfo = getCurrentPageInfo(window);

  // This is to support removing tags by query parameter when the experiment is on: specs.cookieConsent.CcpWixSitesPixelTests
  const omit: string | undefined = extractQueryParameter('omit');
  const accessToken = await getAccessTokenForCall();
  if (accessToken) {
    headers.authorization = accessToken;
  }
  xhrGeneric(
    uri,
    (response: string) => {
      // in wix-sites, we may only know the policy after tag manager server
      // returns from the first call. so we should rerun init in this case
      const initConsentPolicyManager = !categories && !!wixSite;
      const siteEmbedsHandlerOptions: SiteEmbedsHandlerOptions = {
        initConsentPolicyManager,
        currentPageID: pageInfo.id,
      };
      siteEmbedsHandler(response, siteEmbedsHandlerOptions);
    },
    (err: any) => {
      error(`Error loading site tags at ${uri}`);
      error(err.message);
    },
    {
      query: {
        wixSite: !!wixSite,
        htmlsiteId,
        language,
        categories,
        omit,
        partytown: isPartyTownSupported(),
        siteOverrideId: maybeSiteOverrideId,
        appsOverrideId: maybeAppsOverrideId,
      },
      headers,
    },
  );
}

export { getSiteTags };
