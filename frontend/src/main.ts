import { bootstrapApplication } from "@angular/platform-browser";
import { config } from "./app/angular.config";
import { App } from "./app/app";

bootstrapApplication(App, config).catch((err) => console.error(err));
