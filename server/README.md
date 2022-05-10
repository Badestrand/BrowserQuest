BrowserQuest server
===================

# Installation

Run `npm ci` to install all dependencies.


# Running

Run `npm run start` to start the server.


# Configuration

The server settings (number of worlds, number of players per world, etc.) can be configured. Copy `config.json` to a new `config_local.json` file, then edit it. The server will override default settings with this file.


# Deployment
----------

In order to deploy the server, simply copy the `server` and `shared` directories to the staging/production server.

Then follow the Installation and Running steps from above.