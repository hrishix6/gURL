# Gurl

## Backend Design

In wails `Structs` registered in `wails.Run` -> `Bind` option get exposed to frontend via bindings, exported methods on these structs are callable from 
frontend code. Following are the main structs exposed to frontend, 

### Executor 

Logic related to transforming & running the requests parsing response. Following types of requests are planned 

1. HTTP (supported)
2. WSS (planned)
3. GRPC (planned)
4. GraphQL (Planned)
5. SOAP (TBD)

### Storage

Logic related to File IO,  DB, CRUD, synching UI state and storing temporary data.


## Credits

* [Wails Project](https://wails.io/)
* [Angular V21](https://angular.dev/)
* [Daisy UI](https://daisyui.com/)
* [Lucide Icons](https://lucide.dev/)
* [Sqlite](https://sqlite.org/index.html)
* [GORM](https://gorm.io/)
* [mime-db](https://github.com/jshttp/mime-db)
* [nanoid](https://github.com/ai/nanoid)
* [go-nanoid](https://github.com/matoous/go-nanoid)
* [libopenapi](https://github.com/pb33f/libopenapi)
* [Biome](https://biomejs.dev/)

# License

MIT