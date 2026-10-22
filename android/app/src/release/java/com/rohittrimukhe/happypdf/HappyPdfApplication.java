package com.rohittrimukhe.happypdf;

import android.app.Application;
import com.rohittrimukhe.happypdf.documents.DocumentLifecycleCoordinator;
import com.rohittrimukhe.happypdf.legacy.LegacyMutationCoordinator;

/** Allocates the sole writer coordinator; construction deliberately performs no storage I/O. */
public final class HappyPdfApplication extends Application {
    private final LegacyMutationCoordinator legacyMutationCoordinator = new LegacyMutationCoordinator();
    private final DocumentLifecycleCoordinator documentLifecycleCoordinator =
            new DocumentLifecycleCoordinator(this);
    public LegacyMutationCoordinator getLegacyMutationCoordinator() { return legacyMutationCoordinator; }
    public DocumentLifecycleCoordinator getDocumentLifecycleCoordinator() {
        return documentLifecycleCoordinator;
    }
}
