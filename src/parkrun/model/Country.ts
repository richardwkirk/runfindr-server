import { Event } from "./Event";
import { Location } from "./Location";

export interface Country {

    name: string;

    countryCode: number;

    specialEvent?: string;

    cancellationsLoaded: boolean;

    bounds?: {
        north: number,
        east: number,
        south: number,
        west: number
    };

    events?: Event[];

    url: string;

}
