# Contributing to Happy PDF

Happy PDF is proprietary software (see [LICENSE](./LICENSE)) and does not accept outside code contributions at this time.

You can still help:

- Report bugs and suggest ideas through GitHub issues.
- Report security problems privately as described in [SECURITY.md](./SECURITY.md).

## Development setup (maintainers)

```bash
npm install
npm run dev
```

Before pushing, run:

```bash
npm run lint
npm run test:catalog
npm run build
```

## Principles

- Keep PDF processing in the browser unless there is a clear, documented reason not to.
- Do not add server uploads for user documents.
- Avoid large dependencies when a small browser-side implementation is enough.
- Match the existing UI patterns before introducing new controls.
- Keep copy short and direct.
- Add route metadata and sitemap coverage for new public tools.

## Adding a new tool

1. Add the tool UI under `components/Tools`.
2. Put PDF logic in `services` when it can be reused.
3. Add the route in `App.tsx`.
4. Add the catalog entry in `components/Tools/toolCatalog.ts`, including its `availability`
   and, if the Android app has the same tool, its `androidTool`.
5. Add metadata in `components/SEO/RouteSEO.tsx`.
6. Add the route to `public/sitemap.xml`.
7. Run `npm run test:catalog`.
