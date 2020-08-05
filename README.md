# Web frontend for InterPlanetary Container Registry

*Disclaimer: this project is in the early prototype stage.*

InterPlanetary Container Registry (IPCR) is like [Docker Hub](https://hub.docker.com), but fully decentralised.
For more details, see [ipcr/ipcr](https://github.com/ipcr/ipcr).
This project implements Web frontend for IPCR.

Live demo is [on Fleek](https://ipcr.on.fleek.co/)!

The project was started at [HackFS](https://hackfs.com). HackFS is a virtual Hackathon by ETHGlobal and Protocol Labs.

## How to run

The following sections describe how to build and run the frontend on your machine.

### Prerequisites

All commands below were tested on macOS Catalina version 10.15.6.

#### Install packages

First, you need to install [Yarn](https://classic.yarnpkg.com):

	brew install yarn

Note, that the project doesn't work with Yarn 2 yet.

Now you can install packages required by the frontend:

	yarn install

### Run in development

This project uses [Parcel](https://parceljs.org) as a web application bundler.
Parcel has a development server built in, that will automatically rebuild the app as you change files.

To start the development server, simply run:

	yarn start

Now you can open [http://localhost:1234](http://localhost:1234) in your browser.

### Build for production

When it comes time to bundle the frontend for production, run:

	yarn build

## License

This project is licensed under the MIT License–see the [LICENSE](LICENSE) file for details.