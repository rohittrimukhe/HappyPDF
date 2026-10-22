#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const sha256 = (path) => createHash('sha256')
  .update(readFileSync(resolve(root, path))).digest('hex');
const requireText = (condition, message) => {
  if (!condition) throw new Error(`ANDROID_DOCUMENT_DELIVERY: ${message}`);
};
const count = (source, pattern) => [...source.matchAll(pattern)].length;

const frozen = new Map([
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/OwnedPendingImportStore.java', 'b8e86536ae9a41425dc7dad202d9bee1e365fc4958ecd45eae9a61f211cf39c9'],
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/PendingImportBatch.java', '409049cc9710115506f73f30ac9ad79f894b137a3b927710b0400a726dd8ad87'],
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/PendingImportRecord.java', '1be9cab639d6c2938b4b548b07291821f7dde8fd4e71cf07195c24c2af97566b'],
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentPickerController.java', 'adff94b278cd13c8cb7a5d7cfda6d4a4a2f7890b0e327b7931e73c5f77c73dd6'],
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/PickerRequestPolicy.java', 'a9d840adf47515f244bba4f40e5fb75a6332367b75b4319d51b8e2c2ad0c8c98'],
  ['android/app/src/main/java/com/rohittrimukhe/happypdf/documents/BoundedDocumentReader.java', '7d5aa243fd9467ec597f368cc236587279c2c102c3b6f0009ec0be33f9e19ad5'],
  ['android/app/src/test/java/com/rohittrimukhe/happypdf/documents/OwnedPendingImportStoreTest.java', 'a27a99033fe177dd9a566940dac0dffb46a36d6b0a6f6082acd2ec9641887ac4'],
  ['android/app/src/test/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentPickerControllerTest.java', 'bf2c5fdeb186d82c3c4a21b174f290e21559fb76af43ec6831cd40471d9adafb'],
  ['android/app/src/test/java/com/rohittrimukhe/happypdf/documents/PickerRequestPolicyTest.java', '7f40bf15f738d1cefab86faafe4cc7655d1af364174037f8b52d71109b676cf8'],
  ['android/app/src/androidTest/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentPickerControllerInstrumentedTest.java', '18f62934e2660041f3c2db98a58e72afb00524085f0b069dbd0f7448f577e07b'],
  ['android/app/src/test/java/com/rohittrimukhe/happypdf/documents/BoundedDocumentReaderTest.java', '90ff98775fd0704e461667e1bd472d8a9f06f8272a58ce2c6b4c6a0c41ad34af'],
]);
for (const [path, expected] of frozen) {
  requireText(sha256(path) === expected, `frozen source drift: ${path}`);
}

const coordinator = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/DocumentLifecycleCoordinator.java');
const writer = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/OwnedDocumentWriter.java');
const legacyResolver = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/LegacyDocumentOpenResolver.java');
const legacyResolverTest = read('android/app/src/test/java/com/rohittrimukhe/happypdf/documents/LegacyDocumentOpenResolverTest.java');
const exporter = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentExporter.java');
const sharer = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentSharer.java');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const releaseApp = read('android/app/src/release/java/com/rohittrimukhe/happypdf/HappyPdfApplication.java');
const debugApp = read('android/app/src/debug/java/com/rohittrimukhe/happypdf/HappyPdfApplication.java');
const plugin = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/AndroidDocumentsPlugin.java');
const provider = read('android/app/src/main/java/com/rohittrimukhe/happypdf/documents/ReadOnlyDocumentFileProvider.java');

for (const [literal, expected] of [
  ['MAXIMUM_CHUNK_BYTES = 524_288', writer],
  ['MAXIMUM_FILE_BYTES = 256L * 1024L * 1024L', writer],
  ['MAXIMUM_OPEN_SESSIONS = 4', writer],
  ['MAXIMUM_OPEN_BYTES = 256L * 1024L * 1024L', writer],
  ['INACTIVITY_EXPIRY_MILLIS = 30L * 60L * 1000L', writer],
  ['ABSOLUTE_EXPIRY_MILLIS = 2L * 60L * 60L * 1000L', writer],
  ['STORAGE_RESERVE_BYTES = 1024L * 1024L', writer],
  ['INCOMPLETE_EXPIRY_MILLIS = 30L * 60L * 1000L', exporter],
  ['COMPLETED_EXPIRY_MILLIS = 24L * 60L * 60L * 1000L', exporter],
  ['MAXIMUM_RETAINED_STAGES = 8', sharer],
  ['MAXIMUM_RETAINED_BYTES = 256L * 1024L * 1024L', sharer],
  ['STAGE_EXPIRY_MILLIS = 24L * 60L * 60L * 1000L', sharer],
]) requireText(expected.includes(literal), `missing frozen limit ${literal}`);

for (const owned of ['OwnedPendingImportStore', 'OwnedDocumentWriter',
  'AndroidDocumentPickerController', 'AndroidDocumentExporter', 'AndroidDocumentSharer',
  'LegacyDocumentOpenResolver']) {
  requireText(count(coordinator, new RegExp(`new ${owned}\\(`, 'g')) === 1,
    `coordinator must construct exactly one ${owned}`);
}
const productionConstructor = coordinator.match(
  /public DocumentLifecycleCoordinator\(Context context\) \{([\s\S]*?)\n    \}/)?.[1] ?? '';
requireText(productionConstructor.length > 0
  && !productionConstructor.includes('getFilesDir')
  && !productionConstructor.includes('new OwnedPendingImportStore')
  && !productionConstructor.includes('new OwnedDocumentWriter'),
  'production coordinator constructor must retain context without I/O or service creation');
requireText(coordinator.includes('if (graph == null) graph = Graph.production(application)'),
  'coordinator graph must be lazy');
requireText(coordinator.includes('new AndroidDocumentPickerController(application, pendingStore)'),
  'picker must share the graph pending store');
requireText(!/static\s+(?:final\s+)?DocumentLifecycleCoordinator/.test(coordinator),
  'static coordinator owner forbidden');
for (const app of [releaseApp, debugApp]) {
  requireText(count(app, /new DocumentLifecycleCoordinator\(this\)/g) === 1,
    'each Application must own exactly one document coordinator');
  requireText(count(app, /return documentLifecycleCoordinator;/g) === 1,
    'each Application must return its sole document coordinator');
  requireText(!/\bonCreate\s*\(|getFilesDir\s*\(/.test(app),
    'Application document ownership must remain construction-I/O-free');
}
const documentMethods = [
  'readChunk', 'beginWrite', 'appendWrite', 'finishWrite', 'abortWrite',
  'listOwned', 'renameItem', 'trashOwned', 'restoreOwned', 'deleteOwned', 'clearOwned',
  'clearOwnedPayloads', 'takePendingImports',
  'acknowledgePendingImports', 'pickDocuments', 'exportItem', 'renameExport', 'shareItem',
  'openReader',
];
requireText(count(plugin, /@PluginMethod\b/g) === documentMethods.length
  && documentMethods.every(method => new RegExp(
    `public\\s+void\\s+${method}\\s*\\(\\s*PluginCall\\s+call\\s*\\)`,
  ).test(plugin)),
  'AndroidDocuments must expose exactly the accepted document/picker surface');
const providerTags = [...manifest.matchAll(
  /<provider\b[^>]*android:name="\.documents\.ReadOnlyDocumentFileProvider"[^>]*>/g,
)];
requireText(providerTags.length === 1
  && providerTags[0][0].includes('android:authorities="${applicationId}.fileprovider"')
  && providerTags[0][0].includes('android:exported="false"')
  && providerTags[0][0].includes('android:grantUriPermissions="true"'),
  'exact narrow FileProvider registration missing');
requireText(provider.includes('if (!"r".equals(mode))')
  && count(provider, /throw new SecurityException\("Read-only document provider"\)/g) === 4,
  'FileProvider must reject every write and mutation path');
// The one write exception: the device camera writes a single file directly inside the
// capture root. Everything else (other roots, nested paths, insert/update/delete) stays refused.
const compactProvider = provider.replace(/\s+/g, ' ');
requireText(compactProvider.includes('static final String CAPTURE_ROOT = "happypdf_captures";')
  && compactProvider.includes('if (!"r".equals(mode)) { if (!isCapturePath(uri == null ? null : uri.getPathSegments())) { throw new SecurityException("Read-only document provider"); } } return super.openFile(uri, mode);')
  && count(provider, /isCapturePath\(/g) === 2
  && compactProvider.includes('static boolean isCapturePath(List<String> segments) { if (segments == null || segments.size() != 2 || !CAPTURE_ROOT.equals(segments.get(0))) { return false; } String name = segments.get(1); return !name.isEmpty() && !".".equals(name) && !"..".equals(name); }'),
  'the only FileProvider write exception must be one file directly inside happypdf_captures');
for (const method of ['insert(Uri uri, ContentValues values)',
  'update(Uri uri, ContentValues values, String selection, String[] selectionArgs)',
  'delete(Uri uri, String selection, String[] selectionArgs)']) {
  requireText(compactProvider.includes(`${method} { throw new SecurityException("Read-only document provider"); }`),
    `FileProvider ${method.split('(')[0]} must only throw`);
}

requireText(exporter.includes('MediaStore.Downloads.IS_PENDING, 1'),
  'MediaStore allocation must be pending');
requireText(exporter.includes('MediaStore.Downloads.IS_PENDING, 0'),
  'MediaStore publication must clear pending');
requireText(exporter.includes('PublicationState.UNKNOWN')
  && exporter.includes('DOCUMENT_DURABILITY_UNCERTAIN'),
  'indeterminate publication must preserve recovery as durability uncertain');
requireText(exporter.includes('output.force()') && exporter.includes('expectedHash'),
  'export must force and verify copied bytes');
requireText(sharer.includes('new Intent(Intent.ACTION_SEND)'), 'share action must be ACTION_SEND');
requireText(sharer.includes('new Intent(Intent.ACTION_SEND_MULTIPLE)')
  && sharer.includes('putParcelableArrayListExtra(Intent.EXTRA_STREAM, streams)')
  && sharer.includes('clip.addItem(clipItem)'),
  'collection share must use ACTION_SEND_MULTIPLE with every staged child in ClipData');
requireText(sharer.includes('intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)'),
  'share intent must set only read grant');
requireText(sharer.includes('appendPath("happypdf_share_staging")')
  && sharer.includes('if (!matchesCanonicalShareUri(expected, contentUri))')
  && sharer.includes('if (canonical.equals(candidate)) return true')
  && sharer.includes('getQueryParameterNames().equals(java.util.Set.of(DISPLAY_NAME_QUERY))')
  && sharer.includes('values.size() != 1')
  && sharer.includes('PdfReaderLaunchContract.isSafeDisplayName(displayName)')
  && sharer.includes('return reconstructed.equals(candidate)'),
  'share URI must be canonical with at most one validated display-name query');
requireText(!sharer.includes('FLAG_GRANT_WRITE_URI_PERMISSION')
  && !sharer.includes('FLAG_GRANT_PERSISTABLE_URI_PERMISSION')
  && !sharer.includes('FLAG_GRANT_PREFIX_URI_PERMISSION'), 'forbidden share grant present');
requireText(coordinator.includes('DOCUMENT_COLLECTION_UNSUPPORTED'),
  'collections must remain unsupported for document reads');
for (const invariant of [
  'MAXIMUM_COLLECTION_ITEMS = 300', 'MAXIMUM_COLLECTION_BYTES',
  'CollectionSource openCollection(', 'Files.list(directory)',
  'Files.isSymbolicLink(candidate)', 'collection.validateUnchanged()',
]) {
  requireText(legacyResolver.includes(invariant)
    || exporter.includes(invariant) || sharer.includes(invariant),
  `bounded legacy collection invariant missing: ${invariant}`);
}
requireText(exporter.includes('exportCollection(')
  && exporter.includes('MediaTarget.PICTURES')
  && exporter.includes('Environment.DIRECTORY_PICTURES')
  && exporter.includes('rollbackCompleted(completed)'),
  'collection export must use image albums/download folders and exact rollback');
requireText(coordinator.includes('graph().legacyResolver.openCollection(ref)')
  && coordinator.includes('graph().sharer.prepareCollection(')
  && coordinator.includes('graph().exporter.exportCollection('),
  'collection delivery must stay behind the single coordinator');
requireText(plugin.includes(': (hasDisplayName ? null : AndroidDocumentIngressPolicy.MIME_PDF)')
  && plugin.includes('coordinator.createShareContentUris(handle)'),
  'omitted MIME must select opaque collection delivery without exposing addresses');
requireText(coordinator.includes('snapshotLegacy') && sharer.includes('copy(')
  && exporter.includes('copySnapshot('), 'legacy delivery must use bounded snapshots');
const pinnedLegacySource = legacyResolver.slice(
  legacyResolver.indexOf('private final class ResolvedSource'),
  legacyResolver.indexOf('private static void closeQuietly'),
);
for (const invariant of [
  'OwnedDocumentWriter.DocumentSource openSource(', 'new ResolvedSource(resolved)',
  'private final FileChannel channel', 'FileChannel.open(resolved.path, StandardOpenOption.READ',
  'LinkOption.NOFOLLOW_LINKS', 'channel.read(buffer, offset + total)',
  'resolved.identity.requireSame(attributes(resolved.path))', 'closeQuietly(channel)',
]) {
  requireText(legacyResolver.includes(invariant) || pinnedLegacySource.includes(invariant),
    `legacy pinned-source invariant missing: ${invariant}`);
}
requireText(count(pinnedLegacySource, /FileChannel\.open\(/g) === 1,
  'legacy native source must use one identity-pinned channel across sequential windows');
requireText(legacyResolverTest.includes(
  'nativeSourceUsesOnePinnedChannelAcrossSequentialWindowsAndCloses'),
  'focused legacy pinned-channel/identity/close proof missing');
requireText(writer.includes('Pattern.compile("w1_[A-Za-z0-9_-]{22,64}")')
  && !writer.includes('Pattern.compile("s1_'), 'write sessions must use canonical w1 refs');
requireText(writer.includes('validateOwnedTarget') && writer.includes('sameIdentity(before, after)')
  && writer.includes('validateMagic(expected.mimeType, actual.prefix)'),
  'owned recovery must revalidate identity, size, hash, and MIME magic');

const xml = read('android/app/src/main/res/xml/file_paths.xml').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
const expectedXml = `<?xml version="1.0" encoding="utf-8"?> <paths xmlns:android="http://schemas.android.com/apk/res/android"> <cache-path name="happypdf_verified_copies" path="happypdf_verified_copies/" /> <files-path name="happypdf_share_staging" path="happypdf_documents/share/" /> <external-files-path name="happypdf_captures" path="Pictures/" /> </paths>`;
requireText(xml === expectedXml, 'file_paths.xml must expose exactly happypdf_documents/share/, the reader\'s verified copies and the camera capture folder');
for (const forbidden of ['cache-path', 'external-path', 'external-files-path',
  'external-cache-path', 'external-media-path', 'root-path', 'path="."', 'processed',
  'datastore', 'webview', 'pending']) {
  // The reader's verified-copy folder is the one cache path allowed (see PdfVerifiedCopy).
  // The camera capture folder is the one external-files path allowed (see ReadOnlyDocumentFileProvider).
  const rest = xml.replace('<cache-path name="happypdf_verified_copies" path="happypdf_verified_copies/" />', '')
    .replace('<external-files-path name="happypdf_captures" path="Pictures/" />', '');
  requireText(!rest.toLowerCase().includes(forbidden), `broad provider path forbidden: ${forbidden}`);
}

const t039Main = [coordinator, writer, exporter, sharer].join('\n');
for (const forbidden of ['android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.MANAGE_EXTERNAL_STORAGE',
  'Log.', 'System.out', 'printStackTrace', 'ZipOutputStream']) {
  requireText(!t039Main.includes(forbidden), `forbidden T039 behavior: ${forbidden}`);
}

console.log('ANDROID_DOCUMENT_DELIVERY_VERIFIER: PASS');
console.log('DELIVERY_CONTRACT: bounded writer/owned lifecycle, pinned legacy source, MediaStore export, and delayed read-only share staging verified');
