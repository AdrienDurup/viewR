# viewR : view renderer

## What is it

VIEWR is a basic server side view renderer for Node Server.
It relies on .viewr and .js files.
.viewr files are basically HTML-like files with viewr-specific features.
This extension is based on "html-text-basic" TextMate grammar file, and intends to highlight ${viewR_variables}.

## Requirements

- fs module.

## What it can do

# Inject data via variables

```html
<body>
    <main>
        ${myVariable}
    </main>
</body>
```

## what it can’t

- use express features for view engines
- use js in .viewr files
  
## TODO

- array handling
- loops and conditionnal
- complex components
- data storage in engine instance

## Release Notes

### beta 0.0.1

Initial release.
