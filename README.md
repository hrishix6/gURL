<a id="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="frontend/public/logo2.svg" alt="Logo" width="80" height="80">
  </a>
  <p>Cross platform API Client</p>
</div>

<!-- ABOUT THE PROJECT -->
## Motivation
gURL is just another fancy cURL. I am building this because I want to learn Go & desktop app development using Wails, plus it's something that would be useful in my
day-to-day work.

## Features

It's still in early stage, essential features are implemented. 

* Simple UI to configure HTTP Requests
* Request history
* Request collections
* Environments
* Request examples
* Response preview for supported media types (Images, Audio, Video, Pdfs etc)
* Import & Export
* Linux & Mac Os supported, Windows support in progress.

## Screenshots

<figure>
  <figcaption align="center"><h3>Collections</h3></figcaption>
  <img src="docs/screens/collections.png"  alt="collections" />
</figure>

<figure>
  <figcaption align="center"><h3>Environments</h3></figcaption>
  <img src="docs/screens/environments.png"  alt="environment" />
</figure>

<figure>
  <figcaption align="center"><h3>Response Previews</h3></figcaption>
  <img src="docs/screens/preview.png"  alt="response preview" />
</figure>

<figure>
  <figcaption align="center"><h3>Response Example</h3></figcaption>
  <img src="docs/screens/response_example.png"  alt="response example" />
</figure>

<!-- ## Building from source

- clone this repository, checkout main branch

- You will need to install Wails dependencies for your platform, follow instructions on [this page](https://wails.io/docs/gettingstarted/installation). 

- Install `Node.js` >=20 and `Pnpm` >=10. 

- Install `GNU Make` for your platform. 

- run following command, binary will be built and saved under `./bin` directory.

  ```bash
  $ make build
  ``` -->

## Roadmap

- [ ] Importing Open API 2.0, 3.0 and 3.1 specs as usable collections
- [ ] Oauth 1.0 & 2.0 authorization support.
- [ ] WSS, GRPC, SOAP support.
- [ ] pre & post scripts.
- [ ] Mock server
- [ ] Git integration
- [ ] Web Hooks testing & replayability
- [ ] OAS generation

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Wails Project](https://wails.io/)
* [Angular V21](https://angular.dev/)
* [Daisy UI](https://daisyui.com/)
* [Lucide Icons](https://lucide.dev/)
* [Sqlite](https://sqlite.org/index.html)
* [GORM](https://gorm.io/)
* [mime-db](https://github.com/jshttp/mime-db)
* [nanoid](https://github.com/ai/nanoid)
* [go-nanoid](https://github.com/matoous/go-nanoid)
* [Biome](https://biomejs.dev/)

## License

MIT
