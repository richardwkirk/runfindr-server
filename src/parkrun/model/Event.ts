import { Location } from "./Location";

export interface Event {

    eventName: string;

    shortName: string;

    longName: string;

    id: number;

    locationName: string;

    location: Location;

    url: string;

}
