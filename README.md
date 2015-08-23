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
