import { bootstrapApplication } from "@angular/platform-browser";
import { config } from "./app/angular.config";
import { MainRouter } from "./main.router";

bootstrapApplication(MainRouter, config).catch((err) => console.error(err));
