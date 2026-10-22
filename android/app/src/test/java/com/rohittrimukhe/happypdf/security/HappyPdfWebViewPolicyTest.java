package com.rohittrimukhe.happypdf.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public final class HappyPdfWebViewPolicyTest {
    @Test public void acceptsOnlyThePackagedLocalOrigin() {
        assertEquals(HappyPdfWebViewPolicy.Navigation.ALLOW_PACKAGED_ORIGIN,
                HappyPdfWebViewPolicy.decide("https://localhost/"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.ALLOW_PACKAGED_ORIGIN,
                HappyPdfWebViewPolicy.decide("https://localhost/tools?source=home#top"));

        for (String blocked : new String[] {
                "https://localhost.evil.example/", "https://localhost:8443/", "http://localhost/",
                "https://user@localhost/", "file:///android_asset/index.html", "content://provider/item",
                "intent://open/#Intent;scheme=https;end", "javascript:alert(1)", "data:text/html,x",
                "blob:https://localhost/id", "https://localhost\\@evil.example/", "not a url"
        }) {
            assertEquals(blocked, HappyPdfWebViewPolicy.Navigation.BLOCK,
                    HappyPdfWebViewPolicy.decide(blocked));
        }
    }

    // GHSA-rvm3-566m-v7fv: the proxy path would serve remote content as https://localhost.
    @Test public void neverTreatsCapacitorsHttpProxyAsThePackagedOrigin() {
        for (String url : new String[] {
                "https://localhost/_capacitor_http_interceptor_?u=https%3A%2F%2Fexample.com",
                "https://localhost/_capacitor_https_interceptor_/x",
                "https://localhost/_CAPACITOR_HTTP_INTERCEPTOR_?u=x"}) {
            assertFalse(url, HappyPdfWebViewPolicy.isPackagedOrigin(url));
            assertEquals(url, HappyPdfWebViewPolicy.Navigation.BLOCK, HappyPdfWebViewPolicy.decide(url));
        }
        assertTrue(HappyPdfWebViewPolicy.isPackagedOrigin("https://localhost/assets/index.js"));
    }

    @Test public void keepsExistingWebAndEmailLinksVisibleOutsideTheBridge() {
        assertEquals(HappyPdfWebViewPolicy.Navigation.OPEN_EXTERNAL_BROWSER,
                HappyPdfWebViewPolicy.decide("https://www.example.com/help"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.OPEN_EXTERNAL_BROWSER,
                HappyPdfWebViewPolicy.decide("http://www.example.com/legacy"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.OPEN_EXTERNAL_BROWSER,
                HappyPdfWebViewPolicy.decide("mailto:support@example.com"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.BLOCK,
                HappyPdfWebViewPolicy.decide("mailto:support@example.com%0d%0aBcc:attacker@example.com"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.BLOCK,
                HappyPdfWebViewPolicy.decide("tel:+123456789"));
        assertEquals(HappyPdfWebViewPolicy.Navigation.BLOCK,
                HappyPdfWebViewPolicy.decide("https://user@example.com/"));
    }

    @Test public void reloadsTheSamePackagedRouteWithTheRecoveryMarkerOnly() {
        assertEquals("https://localhost/compress#renderer-restarted",
                HappyPdfWebViewPolicy.rendererRecoveryUrl("https://localhost/compress"));
        assertEquals("https://localhost/view?x=1#renderer-restarted",
                HappyPdfWebViewPolicy.rendererRecoveryUrl("https://localhost/view?x=1#/old"));
        assertEquals(null, HappyPdfWebViewPolicy.rendererRecoveryUrl(null));
        assertEquals(null, HappyPdfWebViewPolicy.rendererRecoveryUrl("https://www.example.com/"));
    }

    @Test public void webViewUpdatePageIsPackagedAndItsStoreLinkOpensOutside() {
        assertTrue(HappyPdfWebViewPolicy.isPackagedOrigin(HappyPdfWebViewPolicy.WEBVIEW_UPDATE_URL));
        assertEquals(HappyPdfWebViewPolicy.Navigation.OPEN_EXTERNAL_BROWSER, HappyPdfWebViewPolicy.decide(
                "https://play.google.com/store/apps/details?id=com.google.android.webview"));
    }

    @Test public void isolatesOnlyTheObservedBrokenGraphicsDriver() {
        assertTrue(HappyPdfWebViewPolicy.requiresSoftwareRendering("mt6855", ""));
        assertTrue(HappyPdfWebViewPolicy.requiresSoftwareRendering("other", "MT6855"));
        assertFalse(HappyPdfWebViewPolicy.requiresSoftwareRendering("mt6985", "Dimensity 9300"));
        assertFalse(HappyPdfWebViewPolicy.requiresSoftwareRendering(null, null));
    }

    @Test public void rendererRecoveryCannotLoopImmediately() {
        assertTrue(HappyPdfWebViewPolicy.mayRestartRenderer(0, 10));
        assertFalse(HappyPdfWebViewPolicy.mayRestartRenderer(10,
                10 + HappyPdfWebViewPolicy.RENDERER_RECOVERY_COOLDOWN_MILLIS - 1));
        assertTrue(HappyPdfWebViewPolicy.mayRestartRenderer(10,
                10 + HappyPdfWebViewPolicy.RENDERER_RECOVERY_COOLDOWN_MILLIS));
    }
}
