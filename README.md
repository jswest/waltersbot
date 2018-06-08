# WALTERSBOT

By John West, under the MIT license.

## Installing everything.

-   Clone this repo.
-   Download [NVM](https://github.com/creationix/nvm).
-   Run `nvm install 8`.
-   Run `nvm use 8`.
-   Run `npm install`.

## Setting it up.

-   Get an API key from [The Walters Art Museum](http://api.thewalters.org/).
-   `cp config/sample-config.json config/config.json`.
-   Copy your API key into `config.json` as the value of `api_key`.
-   Run `node scripts/scrape-to-json.js`. This scrapes The Walters Art Museum's collection down as JSON.
-   Run `node scripts/save-to-sqlite.js`. This saves the JSON into a SQLITE database.

## Exploring the data.

-   You now have a SQLITE database that you can explore. Run `.schema` from the SQLITE db to see the fields.

## Running the Twitter Bot.
