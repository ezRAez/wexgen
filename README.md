# Wexgen – WDI's Express Generator

An [Express](https://www.npmjs.com/package/express) application generator
following WDI conventions.

## Attribution

While a fork of the Express generator, this project is very different from 
the original in scope and form. However, the basic template for the completed
application (and this documentation) is taken directly the original. All 
thanks to everyone who has worked on Express, and who keep it and its suite
of tools running. Send them tips!

[![Gratipay][gratipay-image]][gratipay-url]

## Installation

```sh
$ npm install -g wexgen
```

## Quick Start

The quickest way to get started with wex is to utilize the executable 
`wexgen` to generate an application as shown below:

Create the app:

```bash
$ wexgen /tmp/example-app
```

Install dependencies:

```bash
$ cd /tmp/example-app && npm install
```

Rock and roll:

```bash
$ nodemon
```

## License

[MIT](LICENSE)

<!-- Links -->

[gratipay-image]: https://img.shields.io/gratipay/dougwilson.svg
[gratipay-url]: https://gratipay.com/dougwilson/

<!--
## Command Line Options

This generator can also be further configured with the following command line flags.

```
-h, --help          output usage information
-V, --version       output the version number
-e, --ejs           add ejs engine support (defaults to jade)
    --hbs           add handlebars engine support
-H, --hogan         add hogan.js engine support
-c, --css <engine>  add stylesheet <engine> support (less|stylus|compass|sass) 
                    (defaults to plain css)
    --git           add .gitignore
-f, --force         force on non-empty directory
```

----

Note: Only tested for Io.js v3.0.0 (and above).

┌──────────────────────────────────────────────────────────────────────┐
│           PARSE   RESOLVE   SCAFFOLD  PARSE INS.                     │
│TEMPLATES   EJS   FILENAMES  (WRITE)    POINTS                        │
│    ↓        ↓        ↓         ↓          ↓                          │
│    ⁠└────────┴────────┴─────────┴──────────┤                          │
│                                           │                          │
│                                           ↓                          │
│⁠    ┌─────────────┬─────────────┬──────────┴┬──────────┬─────! (TEST) │
│    ↑             ↑             ↑           ↑          ↑              │
│ INSERTS        PARSE         PARSE       RESOLVE   INSERT!           │
│                 EJS         METADATA    INSERTIONS                   │
└──────────────────────────────────────────────────────────────────────┘


template as a class

Command line (create is BLUE!)
```
$ express newapp

   create : newapp
   create : newapp/package.json
   create : newapp/app.js
   create : newapp/public
   create : newapp/public/javascripts
   create : newapp/public/images
   create : newapp/public/stylesheets
   create : newapp/public/stylesheets/style.css
   create : newapp/routes
   create : newapp/routes/index.js
   create : newapp/routes/users.js
   create : newapp/views
   create : newapp/views/index.jade
   create : newapp/views/layout.jade
   create : newapp/views/error.jade
   create : newapp/bin
   create : newapp/bin/www

   install dependencies:
     $ cd newapp && npm install

   run the app:
     $ DEBUG=newapp:* npm start

```
-->
