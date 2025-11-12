const IMAGE_PATH = "images/";
const IMAGE_EXT = "jpg";

const spots = [
  {
    name: "Main Lab Block (Orion/Antares)",
    lat: 52.05674493,
    lng: 1.27986381,
    info: "Originally known as the Main Lab Block or B62...",
  },
  {
    name: "Acoustic Block",
    lat: 52.05671008,
    lng: 1.28002642,
    info: "The Adastral Acoustic Block includes anechoic chambers...",
  },
  {
    name: "Old Post Room",
    lat: 52.05734795,
    lng: 1.27954631,
    info: "At one time, a former WW2 building stood here...",
  },
  {
    name: "B1",
    lat: 52.06050806,
    lng: 1.27999692,
    info: "If you look to your west, you’ll see Building B1...",
  },
  {
    name: "Heritage Centre",
    lat: 52.05891122,
    lng: 1.27937062,
    info: "Congratulations! You have arrived at the last location on the trail...",
  }
];

// auto-generate image URLs
const toFileName = name =>
  name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') + '.' + IMAGE_EXT;
spots.forEach(s => s.img = IMAGE_PATH + toFileName(s.name));
