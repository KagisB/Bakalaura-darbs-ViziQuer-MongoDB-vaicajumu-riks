[![License](http://img.shields.io/:license-mit-blue.svg)](https://raw.githubusercontent.com/LUMII-Syslab/viziquer/master/LICENSE)

## Bakalaura darbs

Bakalaura laikā izstrādātais kods ir izveidots konkrētos failos. Commit, kas ir veidoti no lietotāja "KagisB", ir Kārļa Boša izstrādātais kods bakalaura darba praktiskās daļas izstrādei.

Failā /app/imports/client/custom/vq/js/generateSPARQL_jo.js ir izveidotas 3 funkcijas:
- "GenerateMongoQuery", kas ir funkcija, kuru izsauc, nospiežot uz diagrammas, lai ģenerētu vaicājuma tekstu. Tā savāc ievaddatus un nodot apakšfunkcijai.
- "GenerateMongoQueryString", kas ir funkcija, kas izveido vaicājuma tekstu no padotajiem ievaddatiem.
- "setTextinMongoDB", kas ir vienkārša funkcija, kas gatavo vaicājuma tekstu ieliek diagrammas skatā, lai viegli varētu to nokopēt.

Ir izveidoti faili, kuri uzglabā ievaddatu skatu un funkcionalitāti datu saglabāšanai, kas atrodami /app/imports/client/custom/vq/templates mapītē.
Funkcionalitāti nodrošina:
- add_conditionDocument_form.html
- add_conditionDocument_form.js
- addFieldsDocumentDB_form.html
- addFieldsDocumentDB_form.js
- show_mongoDB_code.html
- show_mongoDB_code.js

# ViziQuer

The aim of the ViziQuer project is to provide visual/diagrammatic environment for ontology-based data query definition and execution.

See https://viziquer.lumii.lv for the tool description.

See the [ViziQuer wiki](https://github.com/LUMII-Syslab/viziquer/wiki) for information on getting started and using ViziQuer.

## Acknowledgements

The ViziQuer tool has been developed at Institute of Mathematics and Computer Science, University of Latvia, https://lumii.lv, 
with partial support from Latvian Science Council project lzp-2021/1-0389 "Visual Queries in Distributed Knowledge Graphs" (since 2022).

## Context

For the use with the data shape server (DSS), the DSS server needs to be installed/accessible, as well (put the link in .env file, 
following the pattern given in sample.env).

See https://github.com/LUMII-Syslab/data-shape-server

The DSS shall need a link to a PostgreSQL database, holding the data schemas for the endpoints to be queried. 

The sample schemas are available; means for their creation are described at https://viziquer.lumii.lv

## Installation

You can choose between running ViziQuer locally (from source) and running ViziQuer within a Docker environment (upcoming for the DSS version)

### To setup ViziQuer locally

1. Download and install _Meteor_ framework, follow instructions: https://www.meteor.com/install
1. Perform `git clone` for this repository.
1. Change to the `./viziquer/app` directory.
1. Execute the command `meteor npm ci` to install the required _node_ packages.
1. Now to run the ViziQuer tool, type `meteor` in the ViziQuer directory.
 To run on a specific port, type, for example, `meteor --port 4000`.
1. Open the web browser and type `localhost:3000` (default port: 3000) or with the specified port `localhost:4000`

## Configuration for the first use

1. The first user that signs up to the tool instance shall get administrator rights (the rights to manage tool configurations)

## Docker Environment Notes (currently applies to ViziQuer/web classic only)

### To run ViziQuer within a Docker environment on MacOs or Linux

1. Download, install and start Docker: https://docs.docker.com/install/
1. Start the tool by `docker-compose -f docker-compose-public.yml up`.
1. Open browser and type `localhost:80`.

### To run ViziQuer within a Docker environment on Windows

1. Download, install and start Docker: https://docs.docker.com/install/
1. Create a volume for Mongo DB before the first use: `docker volume create --name=vqdata` (to avoid issues of Mongo DB not working from a shared Windows folder).
1. Start the tool by `docker-compose -f docker-compose-windows.yml up`.
1. Open browser and type `localhost:80`.
