# note-tool

A NodeJS script that deal with markdown note.

Supports:

- **flomo export html note to markdown;**

## how to start

1. install

```bash
npm i -g @alucpro/note-tool
```

then you can use `note` cli cmd.

2. set local config file

You need set a local config to tell note-tool where you notes store.

```bash
note env
```

This cmd will check you config file.
And it will create a default config for you if not exist.

Then, you should update you config.json.

```json
{
  "FLOMO_DIST_DIR": "../../note_flomo_dist", // after trans flomo note to markdown, they are stored here
  "FLOMO_HTML_SOURCE_DIR": "../../note_flomo_source" // export your flomo html-style notes to here
}
```

## feature

- `note`: view help doc;
- `note env`: check local env;
- `note flomo2md`: trans flomo export html note to markdown;
