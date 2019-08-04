import { Location } from './Location';
import { Event } from './Event';

export interface Region {
    
    name: string;
    
    location: Location;
   
    regions: Region[];
   
    events: Event[];
   
    url: string;

}
