package com.rohittrimukhe.happypdf;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class HostIdentityTest {
    @Test
    public void debugApplicationIdIsIsolatedFromProduction() {
        assertEquals("com.rohittrimukhe.happypdf.debug", BuildConfig.APPLICATION_ID);
    }
}
