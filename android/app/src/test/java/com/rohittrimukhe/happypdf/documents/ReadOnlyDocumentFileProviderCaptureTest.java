package com.rohittrimukhe.happypdf.documents;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;
import java.util.Collections;
import org.junit.Test;

public final class ReadOnlyDocumentFileProviderCaptureTest {
    @Test public void onlyOneFileDirectlyInsideTheCaptureRootMayBeWritten() {
        assertTrue(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_captures", "JPEG_20261019_211500_1.jpg")));

        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(null));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(Collections.emptyList()));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Collections.singletonList("happypdf_captures")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_captures", "nested", "a.jpg")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_captures", "..")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_captures", ".")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_captures", "")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("happypdf_documents", "a.pdf")));
        assertFalse(ReadOnlyDocumentFileProvider.isCapturePath(
                Arrays.asList("other", "happypdf_captures")));
    }
}
