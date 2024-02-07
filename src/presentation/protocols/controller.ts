import { HttpRequest, HttpResponse } from "./http";

export interface Controller {
    perform (httpRequest: HttpRequest): HttpResponse
}