package com.rohittrimukhe.happypdf;

import android.app.Application;
import com.rohittrimukhe.happypdf.documents.DocumentLifecycleCoordinator;
import com.rohittrimukhe.happypdf.legacy.LegacyMutationCoordinator;
import com.rohittrimukhe.happypdf.legacy.LegacyThemeCrashController;

/** Debug process owner for the real writer coordinator and its initially disarmed crash I/O. */
public final class HappyPdfApplication extends Application {
    private final LegacyThemeCrashController legacyThemeCrashController =
            new LegacyThemeCrashController();
    private final LegacyMutationCoordinator legacyMutationCoordinator =
            legacyThemeCrashController.createCoordinator();
    private final DocumentLifecycleCoordinator documentLifecycleCoordinator =
            new DocumentLifecycleCoordinator(this);

    public LegacyMutationCoordinator getLegacyMutationCoordinator() {
        return legacyMutationCoordinator;
    }

    public DocumentLifecycleCoordinator getDocumentLifecycleCoordinator() {
        return documentLifecycleCoordinator;
    }

    LegacyThemeCrashController getLegacyThemeCrashController() {
        return legacyThemeCrashController;
    }
}
